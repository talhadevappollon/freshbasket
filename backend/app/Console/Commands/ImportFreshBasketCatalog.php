<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\InventoryLog;
use Illuminate\Support\Str;

class ImportFreshBasketCatalog extends Command
{
    protected $signature = 'freshbasket:import';
    protected $description = 'Import scraped Fresh Basket PK categories and products into MySQL database';

    public function handle()
    {
        $filePath = base_path('../data/freshbasket_catalog.json');
        if (!file_exists($filePath)) {
            $this->error("Catalog file not found at: {$filePath}");
            return 1;
        }

        $this->info("Loading Fresh Basket catalog data from: {$filePath}");
        $json = file_get_contents($filePath);
        $data = json_decode($json, true);

        if (!$data || !isset($data['products'])) {
            $this->error("Invalid catalog json format.");
            return 1;
        }

        $this->info("Importing " . count($data['categories']) . " categories...");
        $catMap = [];

        foreach ($data['categories'] as $c) {
            $slug = Str::slug($c['name']);
            if (empty($slug)) {
                $slug = Str::slug($c['slug']);
            }
            
            $cat = Category::updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $c['name'],
                    'description' => $c['description'] ?? null,
                    'image_url' => !empty($c['image']) ? $c['image'] : null,
                    'is_featured' => true,
                    'is_active' => true,
                ]
            );
            $catMap[$c['slug']] = $cat->id;
            $catMap[$slug] = $cat->id;
            $catMap[strtolower($c['name'])] = $cat->id;
        }

        // Add standard main categories if missing
        $defaultCategories = [
            'Fresh Produce' => 'fresh-produce',
            'Bakery & Dairy' => 'bakery-dairy',
            'Beverages' => 'beverages',
            'Snacks & Confectionery' => 'snacks-confectionery',
            'Cooking & Pantry' => 'cooking-pantry',
            'Personal Care' => 'personal-care',
            'Household Essentials' => 'household-essentials',
            'Meat & Seafood' => 'meat-seafood',
        ];

        foreach ($defaultCategories as $name => $slug) {
            $cat = Category::firstOrCreate(
                ['slug' => $slug],
                [
                    'name' => $name,
                    'description' => "Fresh and premium {$name} sourced daily.",
                    'is_featured' => true,
                    'is_active' => true,
                ]
            );
            $catMap[$slug] = $cat->id;
            $catMap[strtolower($name)] = $cat->id;
        }

        $this->info("Importing " . count($data['products']) . " products with full details, images, barcodes & stock...");
        $bar = $this->output->createProgressBar(count($data['products']));
        $bar->start();

        $count = 0;
        foreach ($data['products'] as $p) {
            $name = trim($p['name']);
            if (empty($name)) continue;

            $slug = Str::slug($p['slug'] ?? $name);
            // Ensure unique slug
            $existing = Product::where('slug', $slug)->first();
            if ($existing && $existing->sku !== $p['sku']) {
                $slug = $slug . '-' . substr(md5($p['sku'] ?? uniqid()), 0, 5);
            }

            // Find matching category
            $categoryId = null;
            $catName = strtolower($p['category_name'] ?? '');
            
            // Best-effort category matching
            if (str_contains(strtolower($name), 'mushroom') || str_contains(strtolower($name), 'malta') || str_contains(strtolower($name), 'apple') || str_contains(strtolower($name), 'banana') || str_contains(strtolower($name), 'tomato') || str_contains(strtolower($name), 'potato') || str_contains(strtolower($name), 'onion')) {
                $categoryId = $catMap['fresh-produce'] ?? null;
            } elseif (str_contains(strtolower($name), 'cookie') || str_contains(strtolower($name), 'bread') || str_contains(strtolower($name), 'cake') || str_contains(strtolower($name), 'croissant') || str_contains(strtolower($name), 'cheese') || str_contains(strtolower($name), 'milk')) {
                $categoryId = $catMap['bakery-dairy'] ?? null;
            } elseif (str_contains(strtolower($name), 'drink') || str_contains(strtolower($name), 'juice') || str_contains(strtolower($name), 'tea') || str_contains(strtolower($name), 'coffee') || str_contains(strtolower($name), 'water')) {
                $categoryId = $catMap['beverages'] ?? null;
            } elseif (str_contains(strtolower($name), 'cracker') || str_contains(strtolower($name), 'chip') || str_contains(strtolower($name), 'chocolate') || str_contains(strtolower($name), 'candy')) {
                $categoryId = $catMap['snacks-confectionery'] ?? null;
            }

            if (!$categoryId && isset($catMap[$catName])) {
                $categoryId = $catMap[$catName];
            }
            if (!$categoryId) {
                $categoryId = Category::inRandomOrder()->first()?->id ?? 1;
            }

            $price = floatval($p['price'] ?? 0);
            if ($price <= 0) {
                $price = 150.00; // default minimum
            }

            $costPrice = round($price * 0.78, 2); // 22% gross margin calculation for POS
            $stock = rand(25, 80);

            $product = Product::updateOrCreate(
                ['sku' => $p['sku'] ?? 'FB-' . uniqid()],
                [
                    'category_id' => $categoryId,
                    'name' => $name,
                    'slug' => $slug,
                    'barcode' => $p['barcode'] ?? ('896400' . rand(100000, 999999)),
                    'description' => $p['description'] ?? "High-grade grocery item directly from Fresh Basket.",
                    'short_description' => Str::limit($p['description'] ?? $name, 120),
                    'brand' => $p['brand'] ?? 'Fresh Basket',
                    'price' => $price,
                    'compare_at_price' => !empty($p['compare_at_price']) ? floatval($p['compare_at_price']) : null,
                    'cost_price' => $costPrice,
                    'stock_quantity' => $stock,
                    'track_stock' => true,
                    'low_stock_threshold' => 8,
                    'unit' => !empty($p['unit']) ? $p['unit'] : '1 unit',
                    'primary_image' => !empty($p['primary_image']) ? $p['primary_image'] : null,
                    'is_featured' => ($count % 6 === 0),
                    'is_active' => true,
                ]
            );

            // Seed images
            if (!empty($p['images'])) {
                ProductImage::where('product_id', $product->id)->delete();
                foreach (array_slice($p['images'], 0, 4) as $idx => $imgUrl) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_url' => $imgUrl,
                        'is_primary' => ($idx === 0),
                        'sort_order' => $idx,
                    ]);
                }
            }

            // Create initial inventory log (POS Audit Trail)
            InventoryLog::firstOrCreate(
                ['product_id' => $product->id, 'reason' => 'restock'],
                [
                    'change_qty' => $stock,
                    'balance_after' => $stock,
                    'reference_id' => 'INIT-STOCK',
                    'operator_name' => 'System Admin',
                    'notes' => 'Initial catalog sync from Fresh Basket',
                ]
            );

            $count++;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Imported {$count} products successfully!");
        return 0;
    }
}


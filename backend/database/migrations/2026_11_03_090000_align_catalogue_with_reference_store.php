<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Puts the store's categories and the category of every product in line with the reference store's menu
     * (Fruits, Vegetables, Nuts & Dates, Bakery, Dairy, Pantry, Gift Basket, Frozen, Baby Food, Tea & Coffee, Beverages,
     * each with its sub-categories). The data comes from database/data/reference_taxonomy.json.
     *
     * Nothing is deleted. Products only change category, categories that are not part of the reference menu are switched
     * off, and every change is recorded in two small tables so that down() puts everything back exactly as it was.
     */
    public function up(): void
    {
        $file = database_path('data/reference_taxonomy.json');
        $data = is_file($file) ? json_decode(ltrim(file_get_contents($file), "\xEF\xBB\xBF"), true) : null;
        if (!is_array($data) || empty($data['categories']) || empty($data['products'])) {
            // Fail loudly: returning quietly would record this migration as done and it would never run again
            throw new \RuntimeException('database/data/reference_taxonomy.json is missing or unreadable, so the catalogue was not aligned.');
        }

        // If an earlier attempt failed part-way it may have left these (empty) tables behind: reuse them, so the
        // migration can simply be run again. Rows that are already there are never replaced (insertOrIgnore below).
        if (!Schema::hasTable('catalogue_alignment_products')) {
            Schema::create('catalogue_alignment_products', function (Blueprint $table) {
                $table->unsignedBigInteger('product_id')->primary();
                $table->unsignedBigInteger('old_category_id')->nullable();
            });
        }
        if (!Schema::hasTable('catalogue_alignment_categories')) {
            Schema::create('catalogue_alignment_categories', function (Blueprint $table) {
                $table->unsignedBigInteger('category_id')->primary();
                $table->boolean('created')->default(false);
                $table->string('old_name', 191)->nullable();
                $table->unsignedBigInteger('old_parent_id')->nullable();
                $table->boolean('old_is_active')->nullable();
                $table->integer('old_sort_order')->nullable();
            });
        }

        DB::transaction(function () use ($data) {
            $now = now();

            // Existing categories, found by a name that ignores case, odd spaces and "flavoured/flavored"
            $existing = DB::table('categories')->get();
            $byName = [];
            foreach ($existing as $c) {
                $byName[$this->norm($c->name)] ??= $c;
            }
            $usedSlugs = $existing->pluck('slug')->flip()->all();
            $touched = [];   // category id => true: part of the reference menu

            $remember = function ($row) {
                DB::table('catalogue_alignment_categories')->insertOrIgnore([
                    'category_id' => $row->id,
                    'created' => false,
                    'old_name' => $row->name,
                    'old_parent_id' => $row->parent_id,
                    'old_is_active' => $row->is_active,
                    'old_sort_order' => $row->sort_order,
                ]);
            };

            $ensure = function (string $name, string $slug, ?int $parentId, int $sort) use (&$byName, &$usedSlugs, &$touched, $remember, $now): int {
                $key = $this->norm($name);
                if (isset($byName[$key])) {
                    $row = $byName[$key];
                    $remember($row);
                    DB::table('categories')->where('id', $row->id)->update([
                        'name' => $name,
                        'parent_id' => $parentId,
                        'is_active' => true,
                        'is_featured' => true,
                        'sort_order' => $sort,
                        'updated_at' => $now,
                    ]);
                    $touched[$row->id] = true;

                    return (int) $row->id;
                }

                $unique = $slug;
                for ($i = 2; isset($usedSlugs[$unique]); $i++) {
                    $unique = $slug . '-' . $i;
                }
                $usedSlugs[$unique] = true;
                $id = DB::table('categories')->insertGetId([
                    'name' => $name,
                    'slug' => $unique,
                    'parent_id' => $parentId,
                    'is_active' => true,
                    'is_featured' => true,
                    'sort_order' => $sort,
                    'description' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
                DB::table('catalogue_alignment_categories')->insert(['category_id' => $id, 'created' => true]);
                $byName[$key] = (object) ['id' => $id, 'name' => $name];
                $touched[$id] = true;

                return $id;
            };

            // 1. The menu: top-level categories, then their sub-categories named "Top/Sub"
            $targets = [];   // "Top" or "Top/Sub" => category id
            foreach ($data['categories'] as $i => $top) {
                $topId = $ensure($top['name'], $top['slug'], null, ($i + 1) * 100);
                $targets[$top['name']] = $topId;
                foreach ($top['children'] as $j => $sub) {
                    $targets[$top['name'] . '/' . $sub['name']] = $ensure($top['name'] . '/' . $sub['name'], $sub['slug'], $topId, ($i + 1) * 100 + $j + 1);
                }
            }

            // 2. Every product goes to the category the reference store files it under
            $byCategory = [];
            foreach ($data['products'] as $sku => $path) {
                if (isset($targets[$path])) {
                    $byCategory[$targets[$path]][] = (string) $sku;
                }
            }
            foreach ($byCategory as $categoryId => $skus) {
                foreach (array_chunk($skus, 400) as $chunk) {
                    $rows = DB::table('products')->whereIn('sku', $chunk)->where(function ($q) use ($categoryId) {
                        $q->whereNull('category_id')->orWhere('category_id', '!=', $categoryId);
                    })->get(['id', 'category_id']);
                    foreach ($rows as $r) {
                        DB::table('catalogue_alignment_products')->insertOrIgnore(['product_id' => $r->id, 'old_category_id' => $r->category_id]);
                    }
                    DB::table('products')->whereIn('id', $rows->pluck('id'))->update(['category_id' => $categoryId, 'updated_at' => $now]);
                }
            }

            // 3. Categories that are not part of the reference menu are switched off (kept, just hidden from the storefront)
            foreach (DB::table('categories')->get() as $c) {
                if (isset($touched[$c->id])) {
                    continue;
                }
                $remember($c);
                DB::table('categories')->where('id', $c->id)->update(['is_active' => false, 'updated_at' => $now]);
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('catalogue_alignment_products') || !Schema::hasTable('catalogue_alignment_categories')) {
            return;
        }

        DB::transaction(function () {
            foreach (DB::table('catalogue_alignment_products')->get() as $r) {
                DB::table('products')->where('id', $r->product_id)->update(['category_id' => $r->old_category_id]);
            }

            foreach (DB::table('catalogue_alignment_categories')->where('created', false)->get() as $r) {
                DB::table('categories')->where('id', $r->category_id)->update([
                    'name' => $r->old_name,
                    'parent_id' => $r->old_parent_id,
                    'is_active' => $r->old_is_active,
                    'sort_order' => $r->old_sort_order,
                ]);
            }

            $created = DB::table('catalogue_alignment_categories')->where('created', true)->pluck('category_id');
            // sub-categories first, so no category is removed while another still points at it
            DB::table('categories')->whereIn('id', $created)->whereNotNull('parent_id')->delete();
            DB::table('categories')->whereIn('id', $created)->delete();
        });

        Schema::dropIfExists('catalogue_alignment_products');
        Schema::dropIfExists('catalogue_alignment_categories');
    }

    private function norm(string $name): string
    {
        $n = preg_replace('/\s+/u', ' ', str_replace("\xC2\xA0", ' ', $name));

        return str_replace('flavoured', 'flavored', mb_strtolower(trim($n)));
    }
};

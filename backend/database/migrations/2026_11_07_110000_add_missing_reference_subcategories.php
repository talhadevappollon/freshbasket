<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Adds the sub-categories of the reference menu that were missing (Mangoes, Energy Drinks, Choose Your Own Basket,
     * Cereals & Granola) and files the products that belong in them (database/data/reference_taxonomy_additions.json).
     *
     * Purely additive: existing categories are never changed, products only change category, and down() puts
     * everything back from two small bookkeeping tables.
     */
    public function up(): void
    {
        $file = database_path('data/reference_taxonomy_additions.json');
        $data = is_file($file) ? json_decode(ltrim(file_get_contents($file), "\xEF\xBB\xBF"), true) : null;
        if (!is_array($data) || empty($data['categories'])) {
            throw new \RuntimeException('database/data/reference_taxonomy_additions.json is missing or unreadable.');
        }

        if (!Schema::hasTable('catalogue_additions_products')) {
            Schema::create('catalogue_additions_products', function (Blueprint $table) {
                $table->unsignedBigInteger('product_id')->primary();
                $table->unsignedBigInteger('old_category_id')->nullable();
            });
        }
        if (!Schema::hasTable('catalogue_additions_categories')) {
            Schema::create('catalogue_additions_categories', function (Blueprint $table) {
                $table->unsignedBigInteger('category_id')->primary();
            });
        }

        DB::transaction(function () use ($data) {
            $now = now();
            $byName = [];
            foreach (DB::table('categories')->get() as $c) {
                $byName[$this->norm($c->name)] ??= $c;
            }
            $usedSlugs = DB::table('categories')->pluck('slug')->flip()->all();
            $targets = [];   // "Parent/Name" => category id

            foreach ($data['categories'] as $c) {
                $full = $c['parent'] . '/' . $c['name'];
                $key = $this->norm($full);
                if (isset($byName[$key])) {
                    $targets[$full] = (int) $byName[$key]->id;
                    continue;
                }
                $parent = $byName[$this->norm($c['parent'])] ?? null;
                if (!$parent) {
                    continue;   // the parent is not in this database: nothing to hang it under
                }
                $slug = $c['slug'];
                for ($i = 2; isset($usedSlugs[$slug]); $i++) {
                    $slug = $c['slug'] . '-' . $i;
                }
                $usedSlugs[$slug] = true;
                $siblings = DB::table('categories')->where('parent_id', $parent->id)->count();
                $id = DB::table('categories')->insertGetId([
                    'name' => $full,
                    'slug' => $slug,
                    'parent_id' => $parent->id,
                    'is_active' => true,
                    'is_featured' => true,
                    'sort_order' => (int) $parent->sort_order + $siblings + 1,
                    'description' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
                DB::table('catalogue_additions_categories')->insertOrIgnore(['category_id' => $id]);
                $targets[$full] = $id;
            }

            $bySub = [];
            foreach (($data['products'] ?? []) as $sku => $path) {
                if (isset($targets[$path])) {
                    $bySub[$targets[$path]][] = (string) $sku;
                }
            }
            foreach ($bySub as $categoryId => $skus) {
                foreach (array_chunk($skus, 400) as $chunk) {
                    $rows = DB::table('products')->whereIn('sku', $chunk)->where(function ($q) use ($categoryId) {
                        $q->whereNull('category_id')->orWhere('category_id', '!=', $categoryId);
                    })->get(['id', 'category_id']);
                    foreach ($rows as $r) {
                        DB::table('catalogue_additions_products')->insertOrIgnore(['product_id' => $r->id, 'old_category_id' => $r->category_id]);
                    }
                    DB::table('products')->whereIn('id', $rows->pluck('id'))->update(['category_id' => $categoryId, 'updated_at' => $now]);
                }
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('catalogue_additions_products') || !Schema::hasTable('catalogue_additions_categories')) {
            return;
        }
        DB::transaction(function () {
            foreach (DB::table('catalogue_additions_products')->get() as $r) {
                DB::table('products')->where('id', $r->product_id)->update(['category_id' => $r->old_category_id]);
            }
            DB::table('categories')->whereIn('id', DB::table('catalogue_additions_categories')->pluck('category_id'))->delete();
        });
        Schema::dropIfExists('catalogue_additions_products');
        Schema::dropIfExists('catalogue_additions_categories');
    }

    private function norm(string $name): string
    {
        $n = preg_replace('/\s+/u', ' ', str_replace("\xC2\xA0", ' ', $name));

        return str_replace('flavoured', 'flavored', mb_strtolower(trim($n)));
    }
};

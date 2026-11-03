<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    /** Seconds the category list (with preview photos) is reused. Short, so new categories show up quickly. */
    private const CACHE_SECONDS = 60;

    public function index()
    {
        try {
            $payload = Cache::remember('api.categories.index.v3', self::CACHE_SECONDS, fn () => $this->buildIndex());
        } catch (\Throwable $e) {
            // A broken cache store must never take the storefront menu down
            $payload = $this->buildIndex();
        }

        return response()->json($payload);
    }

    /**
     * Every active category plus `preview_images`: up to three product photos from that category,
     * so the storefront can show real pictures on category tiles even when the category has no image of its own.
     */
    private function buildIndex(): array
    {
        $categories = Category::withCount(['products' => function ($q) {
            $q->where('is_active', true);
        }])
        ->where('is_active', true)
        ->orderBy('sort_order')
        ->orderBy('name')
        ->get();

        $previews = Product::query()
            ->where('is_active', true)
            ->whereNotNull('primary_image')
            ->where('primary_image', '!=', '')
            ->orderByDesc('is_featured')
            ->orderByRaw('stock_quantity > 0 desc')
            ->orderBy('id')
            ->get(['category_id', 'primary_image'])
            ->groupBy('category_id')
            ->map(fn ($rows) => $rows->pluck('primary_image')->unique()->take(3)->values()->all());

        // products_count is the category's own; total_products also counts its sub-categories
        $withChildren = $categories->mapWithKeys(fn (Category $c) => [
            $c->id => (int) $c->products_count + (int) $categories->where('parent_id', $c->id)->sum('products_count'),
        ]);

        return $categories->map(function (Category $c) use ($previews, $withChildren) {
            $row = $c->toArray();
            $row['total_products'] = $withChildren[$c->id] ?? (int) $c->products_count;
            // a parent's picture falls back to its children's, so every category tile has a real photo
            $mine = $previews->get($c->id, []);
            $row['preview_images'] = $mine ?: $this->childPreviews($c->id, $previews);

            return $row;
        })->all();
    }

    private function childPreviews(int $parentId, $previews): array
    {
        $ids = Category::where('parent_id', $parentId)->pluck('id');
        $pool = [];
        foreach ($ids as $id) {
            foreach ($previews->get($id, []) as $url) {
                $pool[$url] = true;
            }
        }

        return array_slice(array_keys($pool), 0, 3);
    }

    public function show($slug)
    {
        $category = Category::with(['children'])
            ->withCount('products')
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json($category);
    }
}

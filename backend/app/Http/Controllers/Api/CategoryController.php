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
            $payload = Cache::remember('api.categories.index.v2', self::CACHE_SECONDS, fn () => $this->buildIndex());
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

        return $categories->map(function (Category $c) use ($previews) {
            $row = $c->toArray();
            $row['preview_images'] = $previews->get($c->id, []);

            return $row;
        })->all();
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

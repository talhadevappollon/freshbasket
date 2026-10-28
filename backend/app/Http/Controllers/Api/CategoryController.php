<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::withCount(['products' => function ($q) {
            $q->where('is_active', true);
        }])
        ->where('is_active', true)
        ->orderBy('sort_order')
        ->orderBy('name')
        ->get();

        return response()->json($categories);
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

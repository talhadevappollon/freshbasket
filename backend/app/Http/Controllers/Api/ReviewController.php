<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductReview;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    /**
     * Get approved reviews for a given product slug.
     */
    public function index($slug)
    {
        $reviews = ProductReview::where('product_slug', $slug)
            ->where('status', 'approved')
            ->orderByDesc('created_at')
            ->get();

        $total = $reviews->count();
        $avg = $total > 0 ? round($reviews->avg('rating'), 2) : 5.0;

        $breakdown = [
            '5' => $reviews->where('rating', 5)->count(),
            '4' => $reviews->where('rating', 4)->count(),
            '3' => $reviews->where('rating', 3)->count(),
            '2' => $reviews->where('rating', 2)->count(),
            '1' => $reviews->where('rating', 1)->count(),
        ];

        return response()->json([
            'success' => true,
            'slug' => $slug,
            'average_rating' => $avg,
            'total_reviews' => $total,
            'breakdown' => $breakdown,
            'reviews' => $reviews->map(function ($r) {
                return [
                    'id' => $r->id,
                    'customer_name' => $r->customer_name,
                    'rating' => $r->rating,
                    'review_title' => $r->review_title,
                    'review_body' => $r->review_body,
                    'media_urls' => $r->media_urls,
                    'is_verified' => $r->is_verified,
                    'created_at' => $r->created_at->format('M d, Y'),
                ];
            }),
        ]);
    }

    /**
     * Submit a new customer review.
     */
    public function store(Request $request, $slug)
    {
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'customer_name' => 'required|string|max:100',
            'customer_email' => 'required|email|max:150',
            'review_title' => 'required|string|max:150',
            'review_body' => 'required|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $prod = Product::where('slug', $slug)->first();

        $review = ProductReview::create([
            'product_id' => $prod?->id,
            'product_slug' => $slug,
            'product_name' => $prod?->name ?? ucwords(str_replace('-', ' ', $slug)),
            'customer_name' => trim($request->customer_name),
            'customer_email' => trim($request->customer_email),
            'rating' => intval($request->rating),
            'review_title' => trim($request->review_title),
            'review_body' => trim($request->review_body),
            'media_urls' => $request->media_urls ?? null,
            'is_verified' => true,
            'status' => 'approved', // auto-approved for instant satisfaction, admin can edit/reject
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thank you! Your review has been submitted successfully.',
            'review' => [
                'id' => $review->id,
                'customer_name' => $review->customer_name,
                'rating' => $review->rating,
                'review_title' => $review->review_title,
                'review_body' => $review->review_body,
                'is_verified' => $review->is_verified,
                'created_at' => $review->created_at->format('M d, Y'),
            ],
        ], 201);
    }
}


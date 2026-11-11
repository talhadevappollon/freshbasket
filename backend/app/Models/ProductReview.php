<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'product_slug',
        'product_name',
        'customer_name',
        'customer_email',
        'rating',
        'review_title',
        'review_body',
        'media_urls',
        'is_verified',
        'status',
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_verified' => 'boolean',
        'media_urls' => 'array',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }
}


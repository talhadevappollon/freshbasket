<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'sku',
        'barcode',
        'description',
        'short_description',
        'brand',
        'price',
        'compare_at_price',
        'cost_price',
        'stock_quantity',
        'track_stock',
        'low_stock_threshold',
        'unit',
        'primary_image',
        'is_featured',
        'is_active',
        'availability',
    ];

    public const AVAILABILITY = [
        'available' => 'Available',
        'out_of_stock' => 'Out of stock',
        'out_of_season' => 'Out of season',
    ];

    /** Sent with every product to the website: sold_out (see below). */
    protected $appends = ['sold_out'];

    /**
     * Sold out: stock is tracked and none is left. The website shows it as out of stock and checkout refuses it,
     * without touching the manual availability switch, so adding stock puts it straight back on sale.
     */
    public function getSoldOutAttribute(): bool
    {
        return (bool) $this->track_stock && (int) $this->stock_quantity <= 0;
    }

    /** True when the product can go into an order: the manual switch is "available" and it is not sold out. */
    public function isOrderable(): bool
    {
        return ($this->availability ?? 'available') === 'available' && ! $this->sold_out;
    }

    /** What the shopper is told when the product cannot be ordered. */
    public function unavailableLabel(): string
    {
        if (($this->availability ?? 'available') !== 'available') {
            return self::AVAILABILITY[$this->availability] ?? 'Unavailable';
        }

        return $this->sold_out ? 'Out of stock' : 'Available';
    }

    protected $casts = [
        'price' => 'float',
        'compare_at_price' => 'float',
        'cost_price' => 'float',
        'stock_quantity' => 'integer',
        'track_stock' => 'boolean',
        'low_stock_threshold' => 'integer',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function inventoryLogs()
    {
        return $this->hasMany(InventoryLog::class)->latest();
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function isLowStock(): bool
    {
        return $this->track_stock && $this->stock_quantity <= $this->low_stock_threshold;
    }
}


<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'customer_id',
        'customer_account_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'delivery_city',
        'delivery_area',
        'delivery_address',
        'subtotal',
        'delivery_fee',
        'discount',
        'total',
        'payment_method',
        'payment_status',
        'order_status',
        'order_source',
        'order_notes',
        'delivery_date',
        'delivery_window',
    ];

    protected $casts = [
        'subtotal' => 'float',
        'delivery_fee' => 'float',
        'discount' => 'float',
        'total' => 'float',
        'delivery_date' => 'date:Y-m-d',
    ];

    protected $appends = ['delivery_window_label'];

    public function getDeliveryWindowLabelAttribute(): ?string
    {
        return \App\Support\DeliverySlots::label($this->delivery_window);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}


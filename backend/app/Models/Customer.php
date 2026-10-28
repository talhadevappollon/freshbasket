<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'city',
        'area',
        'address',
        'customer_notes',
        'orders_count',
        'total_spent',
        'status',
    ];

    protected $casts = [
        'orders_count' => 'integer',
        'total_spent' => 'float',
    ];

    public function orders()
    {
        return $this->hasMany(Order::class)->latest();
    }
}


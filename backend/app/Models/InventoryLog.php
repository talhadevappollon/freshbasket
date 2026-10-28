<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'change_qty',
        'reason',
        'reference_id',
        'balance_after',
        'operator_name',
        'notes',
    ];

    protected $casts = [
        'change_qty' => 'integer',
        'balance_after' => 'integer',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}

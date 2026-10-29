<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rider extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'cash_collected_today' => 'float',
        'is_active' => 'boolean',
    ];
}


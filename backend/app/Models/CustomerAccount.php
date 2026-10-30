<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class CustomerAccount extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'name',
        'phone',
        'phone_key',
        'email',
        'password',
        'delivery_city',
        'delivery_area',
        'delivery_address',
    ];

    protected $hidden = ['password', 'phone_key'];

    protected function casts(): array
    {
        return ['password' => 'hashed'];
    }

    /** 0300-1234567, 0300 1234567 and +92 300 1234567 all become 3001234567. */
    public static function phoneKey(string $phone): string
    {
        return substr(preg_replace('/\D+/', '', $phone), -10);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}

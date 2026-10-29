<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * The store trades as "Fresh House" (see the logo). Rows seeded with the old name are updated;
     * anything an admin already edited by hand is left alone because only exact old values match.
     */
    public function up(): void
    {
        DB::table('products')->where('brand', 'Fresh Basket')->update(['brand' => 'Fresh House']);
        DB::table('store_settings')->where('key', 'store_name')->where('value', 'Fresh Basket Pakistan')->update(['value' => 'Fresh House']);
    }

    public function down(): void
    {
        DB::table('products')->where('brand', 'Fresh House')->update(['brand' => 'Fresh Basket']);
        DB::table('store_settings')->where('key', 'store_name')->where('value', 'Fresh House')->update(['value' => 'Fresh Basket Pakistan']);
    }
};

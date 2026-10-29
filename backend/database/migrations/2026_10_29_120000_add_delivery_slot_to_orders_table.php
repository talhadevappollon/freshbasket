<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The storefront promises delivery slots; this is where the shopper's pick is stored.
     * delivery_window is a key from App\Support\DeliverySlots (e.g. "asap", "14:00-16:00").
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->date('delivery_date')->nullable()->after('order_notes');
            $table->string('delivery_window', 20)->nullable()->after('delivery_date');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['delivery_date', 'delivery_window']);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Storefront shopper accounts. Deliberately separate from the CRM `customers` table: a guest order never
     * becomes visible to whoever later signs up with the same phone number. An account only sees orders that were
     * placed while it was signed in (orders.customer_account_id).
     */
    public function up(): void
    {
        Schema::create('customer_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('name', 191);
            $table->string('phone', 50);
            $table->string('phone_key', 15)->unique(); // last 10 digits: 0300-1234567 and +92 300 1234567 are the same shopper
            $table->string('email', 191)->nullable()->unique();
            $table->string('password');
            $table->string('delivery_city', 100)->nullable();
            $table->string('delivery_area', 100)->nullable();
            $table->text('delivery_address')->nullable();
            $table->timestamps();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('customer_account_id')->nullable()->after('customer_id')->constrained('customer_accounts')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('customer_account_id');
        });
        Schema::dropIfExists('customer_accounts');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Categories
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 191);
            $table->string('slug', 191)->unique();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->text('image_url')->nullable();
            $table->string('icon', 100)->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // 2. Products (POS + Online store ready)
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('name', 191);
            $table->string('slug', 191)->unique();
            $table->string('sku', 100)->unique();
            $table->string('barcode', 100)->nullable()->index();
            $table->longText('description')->nullable();
            $table->text('short_description')->nullable();
            $table->string('brand', 100)->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('compare_at_price', 10, 2)->nullable();
            $table->decimal('cost_price', 10, 2)->nullable();
            $table->integer('stock_quantity')->default(50);
            $table->boolean('track_stock')->default(true);
            $table->integer('low_stock_threshold')->default(5);
            $table->string('unit', 50)->default('1 unit');
            $table->text('primary_image')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 3. Product Images Gallery
        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->text('image_url');
            $table->boolean('is_primary')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // 4. Customers (CRM 360)
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name', 191);
            $table->string('email', 191)->nullable()->index();
            $table->string('phone', 50)->index();
            $table->string('city', 100)->default('Karachi');
            $table->string('area', 100)->nullable();
            $table->text('address')->nullable();
            $table->text('customer_notes')->nullable();
            $table->integer('orders_count')->default(0);
            $table->decimal('total_spent', 12, 2)->default(0.00);
            $table->string('status', 50)->default('active'); // active, vip, blacklisted
            $table->timestamps();
        });

        // 5. Orders (Cash on Delivery + POS)
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 50)->unique();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('customer_name', 191);
            $table->string('customer_email', 191)->nullable();
            $table->string('customer_phone', 50);
            $table->string('delivery_city', 100)->default('Karachi');
            $table->string('delivery_area', 100)->nullable();
            $table->text('delivery_address');
            $table->decimal('subtotal', 10, 2);
            $table->decimal('delivery_fee', 10, 2)->default(0.00);
            $table->decimal('discount', 10, 2)->default(0.00);
            $table->decimal('total', 10, 2);
            $table->string('payment_method', 50)->default('cod'); // cod, card, pos_cash
            $table->string('payment_status', 50)->default('unpaid'); // unpaid, paid, refunded
            $table->string('order_status', 50)->default('pending'); // pending, processing, dispatched, delivered, cancelled
            $table->string('order_source', 50)->default('online'); // online, pos, phone
            $table->text('order_notes')->nullable();
            $table->timestamps();
        });

        // 6. Order Items
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->string('product_name', 191);
            $table->string('unit', 50)->nullable();
            $table->decimal('price', 10, 2);
            $table->integer('quantity');
            $table->decimal('subtotal', 10, 2);
            $table->timestamps();
        });

        // 7. Inventory Logs (POS & Online synchronization)
        Schema::create('inventory_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->integer('change_qty');
            $table->string('reason', 50); // online_order, pos_sale, restock, adjustment, return
            $table->string('reference_id', 100)->nullable();
            $table->integer('balance_after');
            $table->string('operator_name', 100)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 8. CRM Leads / Contact Messages
        Schema::create('crm_leads', function (Blueprint $table) {
            $table->id();
            $table->string('name', 191);
            $table->string('phone', 50)->nullable();
            $table->string('email', 191)->nullable();
            $table->string('subject', 191)->nullable();
            $table->text('message');
            $table->string('status', 50)->default('new'); // new, contacted, resolved, closed
            $table->text('agent_notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crm_leads');
        Schema::dropIfExists('inventory_logs');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
    }
};

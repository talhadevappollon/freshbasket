<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Discount Coupons & Vouchers
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('title');
            $table->enum('discount_type', ['percentage', 'fixed'])->default('percentage');
            $table->decimal('discount_value', 10, 2);
            $table->decimal('min_spend', 10, 2)->default(0);
            $table->decimal('max_discount', 10, 2)->nullable();
            $table->dateTime('starts_at')->nullable();
            $table->dateTime('expires_at')->nullable();
            $table->integer('usage_limit')->default(100);
            $table->integer('used_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Delivery Riders & Fleet
        Schema::create('riders', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone', 30);
            $table->string('cnic', 30)->nullable();
            $table->string('vehicle_type')->default('Motorcycle');
            $table->string('vehicle_number')->nullable();
            $table->string('assigned_area')->default('Karachi Central');
            $table->enum('status', ['available', 'delivering', 'off_duty'])->default('available');
            $table->integer('total_deliveries')->default(0);
            $table->decimal('cash_collected_today', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 3. Supermarket Outlets & Warehouse Hubs
        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code', 20)->unique();
            $table->string('city')->default('Karachi');
            $table->string('area');
            $table->string('address');
            $table->string('phone', 30);
            $table->string('manager_name')->nullable();
            $table->integer('pos_terminals_count')->default(2);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 4. Store & POS Settings
        Schema::create('store_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('group')->default('general');
            $table->timestamps();
        });

        // Seed initial Coupons
        DB::table('coupons')->insert([
            [
                'code' => 'FRESH10',
                'title' => 'Flat 10% Discount on First Fresh Grocery Order',
                'discount_type' => 'percentage',
                'discount_value' => 10.00,
                'min_spend' => 1500.00,
                'max_discount' => 500.00,
                'starts_at' => now(),
                'expires_at' => now()->addMonths(6),
                'usage_limit' => 500,
                'used_count' => 38,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'WELCOME500',
                'title' => 'Flat Rs. 500 OFF on Orders Above Rs. 3,500',
                'discount_type' => 'fixed',
                'discount_value' => 500.00,
                'min_spend' => 3500.00,
                'max_discount' => 500.00,
                'starts_at' => now(),
                'expires_at' => now()->addMonths(3),
                'usage_limit' => 250,
                'used_count' => 19,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'FREEDEL',
                'title' => 'Free Delivery Voucher for Karachi Orders',
                'discount_type' => 'fixed',
                'discount_value' => 150.00,
                'min_spend' => 1000.00,
                'max_discount' => 150.00,
                'starts_at' => now(),
                'expires_at' => now()->addMonths(12),
                'usage_limit' => 1000,
                'used_count' => 142,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'RAMADAN20',
                'title' => 'Ramadan Grocery Special 20% Discount',
                'discount_type' => 'percentage',
                'discount_value' => 20.00,
                'min_spend' => 5000.00,
                'max_discount' => 1200.00,
                'starts_at' => now(),
                'expires_at' => now()->addMonths(2),
                'usage_limit' => 300,
                'used_count' => 64,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Seed initial Delivery Riders Fleet
        DB::table('riders')->insert([
            [
                'name' => 'Muhammad Bilal',
                'phone' => '+92 301 2345678',
                'cnic' => '42101-1234567-1',
                'vehicle_type' => 'Honda CD 70',
                'vehicle_number' => 'KHI-8921',
                'assigned_area' => 'DHA Phase 5 & 6',
                'status' => 'delivering',
                'total_deliveries' => 142,
                'cash_collected_today' => 18450.00,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Tariq Mehmood',
                'phone' => '+92 312 9876543',
                'cnic' => '42201-9876543-3',
                'vehicle_type' => 'United 125',
                'vehicle_number' => 'KHI-4512',
                'assigned_area' => 'Clifton Block 2 & 4',
                'status' => 'available',
                'total_deliveries' => 98,
                'cash_collected_today' => 12300.00,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Kamran Ali',
                'phone' => '+92 333 4567890',
                'cnic' => '42301-3456789-5',
                'vehicle_type' => 'Suzuki GD 110S',
                'vehicle_number' => 'KHI-6701',
                'assigned_area' => 'Gulshan-e-Iqbal Block 13',
                'status' => 'delivering',
                'total_deliveries' => 215,
                'cash_collected_today' => 24100.00,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Shahid Khan',
                'phone' => '+92 345 1122334',
                'cnic' => '42401-5678901-7',
                'vehicle_type' => 'Yamaha YBR 125',
                'vehicle_number' => 'KHI-3390',
                'assigned_area' => 'PECHS Block 2 & 6',
                'status' => 'available',
                'total_deliveries' => 76,
                'cash_collected_today' => 8900.00,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Rashid Farooq',
                'phone' => '+92 321 7788990',
                'cnic' => '42501-7890123-9',
                'vehicle_type' => 'Honda 125',
                'vehicle_number' => 'KHI-9988',
                'assigned_area' => 'Bahria Town Karachi',
                'status' => 'off_duty',
                'total_deliveries' => 189,
                'cash_collected_today' => 0.00,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Seed initial Supermarket Outlets & Warehouses
        DB::table('branches')->insert([
            [
                'name' => 'Karachi Central Fulfilment Hub (Main HQ)',
                'code' => 'KHI-HQ-01',
                'city' => 'Karachi',
                'area' => 'Korangi Industrial Area',
                'address' => 'Plot 45-B, Sector 23, Korangi Industrial Zone, Karachi',
                'phone' => '+92 21 35051234',
                'manager_name' => 'Asad Siddiqui',
                'pos_terminals_count' => 6,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'DHA Phase 6 Express Superstore',
                'code' => 'KHI-DHA-02',
                'city' => 'Karachi',
                'area' => 'DHA Phase 6',
                'address' => 'Shahbaz Commercial Area, Lane 4, DHA Phase 6, Karachi',
                'phone' => '+92 21 35845678',
                'manager_name' => 'Zubair Sheikh',
                'pos_terminals_count' => 4,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Clifton Block 4 Gourmet Market',
                'code' => 'KHI-CLF-03',
                'city' => 'Karachi',
                'area' => 'Clifton Block 4',
                'address' => 'Near Bilawal Roundabout, Marine Drive, Clifton, Karachi',
                'phone' => '+92 21 35789012',
                'manager_name' => 'Fahad Abbasi',
                'pos_terminals_count' => 3,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Gulshan-e-Iqbal Distribution Node',
                'code' => 'KHI-GSH-04',
                'city' => 'Karachi',
                'area' => 'Gulshan Block 13-C',
                'address' => 'Main University Road, Near Civic Center, Gulshan-e-Iqbal, Karachi',
                'phone' => '+92 21 34981122',
                'manager_name' => 'Naveed Akhtar',
                'pos_terminals_count' => 2,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Seed initial Store Settings
        DB::table('store_settings')->insert([
            ['key' => 'store_name', 'value' => 'Fresh Basket Pakistan', 'group' => 'general', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'store_tagline', 'value' => 'Karachi\'s Premier Gourmet & Daily Fresh Grocery Store', 'group' => 'general', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'helpline_phone', 'value' => '+92 300 1234567', 'group' => 'contact', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'whatsapp_number', 'value' => '+92 300 1234567', 'group' => 'contact', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'support_email', 'value' => 'support@freshbasket.com.pk', 'group' => 'contact', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'currency', 'value' => 'PKR', 'group' => 'finance', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'free_shipping_threshold', 'value' => '2000', 'group' => 'shipping', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'default_shipping_fee', 'value' => '150', 'group' => 'shipping', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'operating_hours', 'value' => '8:00 AM - 12:00 Midnight (Mon - Sun)', 'group' => 'general', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'express_delivery_mins', 'value' => '90', 'group' => 'shipping', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'pos_tax_rate', 'value' => '0', 'group' => 'finance', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('store_settings');
        Schema::dropIfExists('branches');
        Schema::dropIfExists('riders');
        Schema::dropIfExists('coupons');
    }
};
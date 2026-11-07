<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A manual availability switch for every product: "available", "out_of_stock" or "out_of_season".
     * The product stays on the storefront lists; only its button changes (and checkout refuses it).
     */
    public function up(): void
    {
        if (Schema::hasColumn('products', 'availability')) {
            return;
        }
        Schema::table('products', function (Blueprint $table) {
            $table->string('availability', 20)->default('available')->after('is_active')->index();
        });
    }

    public function down(): void
    {
        if (!Schema::hasColumn('products', 'availability')) {
            return;
        }
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['availability']);
            $table->dropColumn('availability');
        });
    }
};

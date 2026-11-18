<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * "Forgot password" links for shopper accounts. Only a hash of each link's token is kept; a link works once,
 * for 60 minutes.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('customer_password_resets')) {
            return;
        }
        Schema::create('customer_password_resets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('customer_account_id')->index();
            $table->string('token_hash', 64);
            $table->timestamp('expires_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_password_resets');
    }
};

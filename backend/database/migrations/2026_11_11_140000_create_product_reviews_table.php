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
        Schema::create('product_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->string('product_slug', 191)->index();
            $table->string('product_name', 191)->nullable();
            $table->string('customer_name', 191);
            $table->string('customer_email', 191)->nullable();
            $table->unsignedTinyInteger('rating')->default(5);
            $table->string('review_title', 191);
            $table->text('review_body');
            $table->json('media_urls')->nullable();
            $table->boolean('is_verified')->default(true);
            $table->string('status', 50)->default('approved')->index(); // approved, pending, rejected
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_reviews');
    }
};


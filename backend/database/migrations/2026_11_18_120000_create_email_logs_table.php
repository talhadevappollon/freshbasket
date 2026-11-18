<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Every email the shop sends (or fails to send), shown in Admin → Email Setup.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('email_logs')) {
            return;
        }
        Schema::create('email_logs', function (Blueprint $table) {
            $table->id();
            $table->string('type', 40);
            $table->string('recipient', 500);
            $table->string('subject', 255);
            $table->string('status', 10); // sent | failed
            $table->text('error')->nullable();
            $table->string('reference', 80)->nullable(); // order number, enquiry id, ...
            $table->timestamps();
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_logs');
    }
};

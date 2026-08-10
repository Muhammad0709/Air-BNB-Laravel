<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('country_payment_settings', function (Blueprint $table) {
            $table->string('country_code', 3)->primary();
            $table->boolean('enable_cod')->default(false);
            $table->boolean('enable_mpesa_delivery')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('country_payment_settings');
    }
};
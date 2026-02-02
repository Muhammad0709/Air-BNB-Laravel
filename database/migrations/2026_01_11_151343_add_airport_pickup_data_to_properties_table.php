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
        Schema::table('properties', function (Blueprint $table) {
            $table->boolean('airport_pickup_enabled')->default(false)->after('images');
            $table->string('airport')->nullable()->after('airport_pickup_enabled');
            $table->time('pickup_start_time')->nullable()->after('airport');
            $table->time('pickup_end_time')->nullable()->after('pickup_start_time');
            $table->decimal('airport_pickup_price', 10, 2)->nullable()->after('pickup_end_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn([
                'airport_pickup_enabled',
                'airport',
                'pickup_start_time',
                'pickup_end_time',
                'airport_pickup_price',
            ]);
        });
    }
};

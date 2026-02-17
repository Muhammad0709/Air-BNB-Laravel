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
            $table->boolean('guided_tours_enabled')->default(false)->after('airport_pickup_price');
            $table->text('guided_tours_description')->nullable()->after('guided_tours_enabled');
            $table->string('guided_tours_duration', 255)->nullable()->after('guided_tours_description');
            $table->decimal('guided_tours_price', 10, 2)->nullable()->after('guided_tours_duration');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn([
                'guided_tours_enabled',
                'guided_tours_description',
                'guided_tours_duration',
                'guided_tours_price',
            ]);
        });
    }
};

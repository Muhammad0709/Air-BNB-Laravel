<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->string('listing_category', 20)->default('stay')->after('property_type');
            $table->unsignedInteger('duration_hours')->nullable()->after('listing_category');
        });

        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE properties MODIFY bedrooms INT NULL');
            DB::statement('ALTER TABLE properties MODIFY bathrooms INT NULL');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("UPDATE properties SET bedrooms = 1 WHERE bedrooms IS NULL");
            DB::statement("UPDATE properties SET bathrooms = 1 WHERE bathrooms IS NULL");
            DB::statement('ALTER TABLE properties MODIFY bedrooms INT NOT NULL');
            DB::statement('ALTER TABLE properties MODIFY bathrooms INT NOT NULL');
        }

        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn(['listing_category', 'duration_hours']);
        });
    }
};

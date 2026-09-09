<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table): void {
            $table->unsignedInteger('beds')->nullable()->after('bedrooms');
            $table->text('house_rules')->nullable()->after('description');
            $table->time('check_in_time')->nullable()->after('timezone');
            $table->time('check_out_time')->nullable()->after('check_in_time');
            $table->unsignedInteger('minimum_stay')->nullable()->after('check_out_time');
            $table->unsignedInteger('maximum_stay')->nullable()->after('minimum_stay');
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table): void {
            $table->dropColumn([
                'beds', 'house_rules', 'check_in_time', 'check_out_time',
                'minimum_stay', 'maximum_stay',
            ]);
        });
    }
};

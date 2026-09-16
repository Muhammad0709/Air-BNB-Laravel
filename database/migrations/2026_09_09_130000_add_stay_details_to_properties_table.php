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
            $table->time('check_in_time')->nullable()->after('timezone');
            $table->time('check_out_time')->nullable()->after('check_in_time');
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table): void {
            $table->dropColumn([
                'beds', 'check_in_time', 'check_out_time',
            ]);
        });
    }
};

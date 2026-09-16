<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['check_in_date', 'check_out_date'] as $column) {
            if (! Schema::hasColumn('properties', $column)) {
                Schema::table('properties', function (Blueprint $table) use ($column): void {
                    $table->date($column)->nullable();
                });
            }
        }
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table): void {
            $table->dropColumn(['check_in_date', 'check_out_date']);
        });
    }
};

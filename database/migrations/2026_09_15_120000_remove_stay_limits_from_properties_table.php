<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $hasMinimum = Schema::hasColumn('properties', 'minimum_stay');
        $hasMaximum = Schema::hasColumn('properties', 'maximum_stay');

        if (! $hasMinimum && ! $hasMaximum) {
            return;
        }

        Schema::table('properties', function (Blueprint $table) use ($hasMinimum, $hasMaximum): void {
            $columns = [];
            if ($hasMinimum) {
                $columns[] = 'minimum_stay';
            }
            if ($hasMaximum) {
                $columns[] = 'maximum_stay';
            }
            $table->dropColumn($columns);
        });
    }

    public function down(): void
    {
        $hasMinimum = Schema::hasColumn('properties', 'minimum_stay');
        $hasMaximum = Schema::hasColumn('properties', 'maximum_stay');

        Schema::table('properties', function (Blueprint $table) use ($hasMinimum, $hasMaximum): void {
            if (! $hasMinimum) {
                $table->unsignedInteger('minimum_stay')->nullable()->after('check_out_time');
            }
            if (! $hasMaximum) {
                $table->unsignedInteger('maximum_stay')->nullable()->after('minimum_stay');
            }
        });
    }
};

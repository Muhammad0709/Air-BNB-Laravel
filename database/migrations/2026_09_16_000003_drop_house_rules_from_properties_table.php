<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('properties', 'house_rules')) {
            Schema::table('properties', function (Blueprint $table): void {
                $table->dropColumn('house_rules');
            });
        }
    }

    public function down(): void
    {
        // Intentionally irreversible: the field is no longer part of the schema.
        // Removed values can only be recovered from a database backup.
    }
};

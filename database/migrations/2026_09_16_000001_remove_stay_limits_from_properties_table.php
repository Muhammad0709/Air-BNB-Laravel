<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Existing installations still have these columns; fresh databases do not.
        $columns = array_values(array_intersect(
            ['minimum_stay', 'maximum_stay'],
            Schema::getColumnListing('properties'),
        ));

        if ($columns !== []) {
            Schema::table('properties', function (Blueprint $table) use ($columns): void {
                $table->dropColumn($columns);
            });
        }
    }

    public function down(): void
    {
        // Stay limits have been retired from the base schema as well.
        // Rolling back must not recreate the removed fields or invent their values.
    }
};

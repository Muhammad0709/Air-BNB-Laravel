<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('reference', 20)->nullable()->after('id');
        });

        DB::table('bookings')->whereNull('reference')->orderBy('id')->each(function ($booking) {
            DB::table('bookings')
                ->where('id', $booking->id)
                ->update(['reference' => 'BK-' . strtoupper(Str::random(8))]);
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->unique('reference');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropUnique(['reference']);
            $table->dropColumn('reference');
        });
    }
};

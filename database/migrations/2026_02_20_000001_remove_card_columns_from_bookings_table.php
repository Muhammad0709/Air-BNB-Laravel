<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $columnsToDrop = [];
            if (Schema::hasColumn('bookings', 'payment_method')) {
                $columnsToDrop[] = 'payment_method';
            }
            if (Schema::hasColumn('bookings', 'card_last_four')) {
                $columnsToDrop[] = 'card_last_four';
            }
            if (! empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            if (! Schema::hasColumn('bookings', 'payment_method')) {
                $table->string('payment_method')->nullable()->after('status');
            }
            if (! Schema::hasColumn('bookings', 'card_last_four')) {
                $table->string('card_last_four', 4)->nullable()->after('payment_method');
            }
        });
    }
};

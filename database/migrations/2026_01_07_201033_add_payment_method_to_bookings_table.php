<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (! Schema::hasColumn('bookings', 'payment_method')) {
            Schema::table('bookings', function (Blueprint $table) {
                $table->enum('payment_method', ['online_mpesa', 'cod', 'delivery_mpesa'])
                    ->default('cod')
                    ->index()
                    ->after('status');
            });
        }

        if (! Schema::hasColumn('bookings', 'payment_collected_at')) {
            Schema::table('bookings', function (Blueprint $table) {
                $table->timestamp('payment_collected_at')->nullable()->after('payment_method');
            });
        }
    }

    public function down(): void
    {
        $columns = array_filter([
            Schema::hasColumn('bookings', 'payment_method') ? 'payment_method' : null,
            Schema::hasColumn('bookings', 'payment_collected_at') ? 'payment_collected_at' : null,
        ]);

        if ($columns) {
            Schema::table('bookings', function (Blueprint $table) use ($columns) {
                $table->dropColumn($columns);
            });
        }
    }
};

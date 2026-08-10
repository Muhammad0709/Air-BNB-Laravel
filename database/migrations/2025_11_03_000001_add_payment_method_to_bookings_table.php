<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->enum('payment_method', ['online_mpesa', 'cod', 'delivery_mpesa'])
                ->default('cod')
                ->index()
                ->after('status');
            $table->timestamp('payment_collected_at')->nullable()->after('payment_method');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'payment_collected_at']);
        });
    }
};
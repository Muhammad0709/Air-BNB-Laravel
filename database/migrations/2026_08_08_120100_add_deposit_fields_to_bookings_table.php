<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->decimal('deposit_amount', 10, 2)->default(0)->after('total_amount');
            $table->string('deposit_status', 20)->nullable()->after('deposit_amount');
            $table->text('deposit_dispute_reason')->nullable()->after('deposit_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['deposit_amount', 'deposit_status', 'deposit_dispute_reason']);
        });
    }
};

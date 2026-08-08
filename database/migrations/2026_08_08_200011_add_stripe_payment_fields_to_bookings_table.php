<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('payment_status', 20)->default('pending')->after('status');
            $table->string('stripe_checkout_session_id')->nullable()->unique()->after('payment_status');
            $table->string('stripe_payment_intent_id')->nullable()->after('stripe_checkout_session_id');
        });

        // Preserve the previous (derived) payment status for existing bookings so the
        // host/admin booking lists don't change for historical data.
        DB::table('bookings')->whereIn('status', ['confirmed', 'completed'])->update(['payment_status' => 'paid']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['payment_status', 'stripe_checkout_session_id', 'stripe_payment_intent_id']);
        });
    }
};

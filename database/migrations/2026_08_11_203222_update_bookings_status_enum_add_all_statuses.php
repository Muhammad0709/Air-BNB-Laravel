<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * All allowed status values after this migration.
     */
    private array $statuses = [
        'pending',
        'awaiting_host_response',
        'awaiting_payment',
        'waiting_for_delivery_payment',
        'confirmed',
        'paid',
        'completed',
        'cancelled',
        'expired',
        'refunded',
        'disputed',
    ];

    public function up(): void
    {
        // MySQL ALTER TABLE MODIFY for enum — safest approach
        $list = implode("','", $this->statuses);
        DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('{$list}') NOT NULL DEFAULT 'pending'");
    }

    public function down(): void
    {
        // Revert to original 4 values (update any rows that use new statuses first)
        DB::statement("UPDATE bookings SET status = 'cancelled' WHERE status IN ('expired','refunded','disputed')");
        DB::statement("UPDATE bookings SET status = 'pending'   WHERE status IN ('awaiting_host_response','awaiting_payment','waiting_for_delivery_payment','paid')");
        DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'pending'");
    }
};

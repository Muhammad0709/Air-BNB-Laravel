<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private array $statuses = [
        'pending',
        'awaiting_host_response',
        'awaiting_payment',
        'confirmed',
        'cancelled',
        'completed',
        'expired',
        'refunded',
        'disputed',
    ];

    public function up(): void
    {
        // Move any rows with removed statuses to sensible fallbacks
        DB::statement("UPDATE bookings SET status = 'confirmed' WHERE status IN ('paid')");
        DB::statement("UPDATE bookings SET status = 'pending'   WHERE status IN ('waiting_for_delivery_payment')");

        $list = implode("','", $this->statuses);
        DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('{$list}') NOT NULL DEFAULT 'pending'");
    }

    public function down(): void
    {
        // Restore the 11-value enum (previous migration)
        $all = ['pending','awaiting_host_response','awaiting_payment','waiting_for_delivery_payment',
                'confirmed','paid','completed','cancelled','expired','refunded','disputed'];
        $list = implode("','", $all);
        DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('{$list}') NOT NULL DEFAULT 'pending'");
    }
};

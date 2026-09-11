<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('properties')) {
            Schema::table('properties', function (Blueprint $table) {
                if (! Schema::hasColumn('properties', 'experience_category')) {
                    $table->string('experience_category')->nullable();
                }
                if (! Schema::hasColumn('properties', 'experience_available_dates')) {
                    $table->json('experience_available_dates')->nullable();
                }
                if (! Schema::hasColumn('properties', 'experience_available_times')) {
                    $table->json('experience_available_times')->nullable();
                }
                if (! Schema::hasColumn('properties', 'experience_not_included')) {
                    $table->json('experience_not_included')->nullable();
                }
                if (! Schema::hasColumn('properties', 'experience_guest_requirements')) {
                    $table->text('experience_guest_requirements')->nullable();
                }
                if (! Schema::hasColumn('properties', 'experience_booking_paused')) {
                    $table->boolean('experience_booking_paused')->default(false);
                }
            });
        }

        if (Schema::hasTable('bookings')) {
            Schema::table('bookings', function (Blueprint $table) {
                if (! Schema::hasColumn('bookings', 'experience_time')) {
                    $table->string('experience_time', 5)->nullable();
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('properties')) {
            Schema::table('properties', function (Blueprint $table) {
                foreach ([
                    'experience_category',
                    'experience_available_dates',
                    'experience_available_times',
                    'experience_not_included',
                    'experience_guest_requirements',
                    'experience_booking_paused',
                ] as $column) {
                    if (Schema::hasColumn('properties', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }

        if (Schema::hasTable('bookings') && Schema::hasColumn('bookings', 'experience_time')) {
            Schema::table('bookings', function (Blueprint $table) {
                $table->dropColumn('experience_time');
            });
        }
    }
};

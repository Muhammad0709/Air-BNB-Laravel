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
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY type ENUM('User','Admin','Host','Moderator','Company') NOT NULL DEFAULT 'User'");
        }

        Schema::table('users', function (Blueprint $table) {
            $table->string('company_name')->nullable()->after('type');
            $table->string('tax_id')->nullable()->after('company_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['company_name', 'tax_id']);
        });

        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY type ENUM('User','Admin','Host','Moderator') NOT NULL DEFAULT 'User'");
        }
    }
};

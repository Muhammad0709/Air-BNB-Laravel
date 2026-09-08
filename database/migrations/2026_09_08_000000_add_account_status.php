<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'account_status')) {
                $table->string('account_status')->default('active')->index();
            }
            if (! Schema::hasColumn('users', 'account_status_reason')) {
                $table->text('account_status_reason')->nullable();
            }
        });

    }
    public function down(): void
    {
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn(['account_status', 'account_status_reason']));
    }
};

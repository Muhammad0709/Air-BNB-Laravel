<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('provider_verification_status')->default('verified')->index();
            $table->string('company_registration_number')->nullable();
            $table->text('company_registered_address')->nullable();
            $table->string('company_contact_person')->nullable();
            $table->text('company_description')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'provider_verification_status',
                'company_registration_number',
                'company_registered_address',
                'company_contact_person',
                'company_description',
            ]);
        });
    }
};

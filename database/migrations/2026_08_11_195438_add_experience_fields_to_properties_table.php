<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            // Minimum participants for an experience (max is already 'guests' column)
            $table->unsignedInteger('min_participants')->nullable()->after('guests');

            // Languages the guide speaks (e.g. "English, Swahili")
            $table->string('guide_language', 255)->nullable()->after('min_participants');

            // Physical difficulty / group composition note
            $table->string('group_size', 255)->nullable()->after('guide_language');

            // Where guests should meet the host
            $table->string('meeting_point', 500)->nullable()->after('group_size');

            // What is included in the experience (JSON array of strings)
            $table->json('included_services')->nullable()->after('meeting_point');

            // Safety information / requirements
            $table->text('safety_info')->nullable()->after('included_services');
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn([
                'min_participants',
                'guide_language',
                'group_size',
                'meeting_point',
                'included_services',
                'safety_info',
            ]);
        });
    }
};

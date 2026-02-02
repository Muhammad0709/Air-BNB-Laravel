<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\PropertyType;
use App\Enums\PropertyStatus;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('location');
            $table->decimal('price', 10, 2);
            $table->integer('bedrooms');
            $table->integer('bathrooms');
            $table->integer('guests');
            $table->enum('property_type', array_column(PropertyType::cases(), 'value'));
            $table->string('status')->default('Active');
            $table->enum('approval_status', array_column(PropertyStatus::cases(), 'value'))->default(PropertyStatus::PENDING->value);
            $table->text('description')->nullable();
            $table->json('amenities')->nullable();
            $table->string('image')->nullable();
            $table->json('images')->nullable();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};

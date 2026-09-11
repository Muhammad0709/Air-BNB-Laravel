<?php

namespace Tests\Feature;

use App\Http\Requests\Admin\UpdatePropertyRequest;
use App\Http\Requests\StoreBookingRequest;
use App\Models\Property;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class ExperienceWorkflowTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        foreach (['property_blocked_dates', 'bookings', 'properties'] as $table) {
            Schema::dropIfExists($table);
        }

        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('location');
            $table->decimal('price', 10, 2)->default(0);
            $table->integer('bedrooms')->nullable();
            $table->integer('beds')->nullable();
            $table->integer('bathrooms')->nullable();
            $table->integer('guests')->default(1);
            $table->string('property_type')->default('tour');
            $table->string('listing_category')->nullable();
            $table->string('status')->default('Active');
            $table->string('approval_status')->default('Approved');
            $table->text('description')->nullable();
            $table->integer('min_participants')->nullable();
            $table->json('experience_available_dates')->nullable();
            $table->json('experience_available_times')->nullable();
            $table->boolean('experience_booking_paused')->default(false);
            $table->timestamps();
        });

        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->nullable();
            $table->unsignedBigInteger('property_id');
            $table->date('check_in_date');
            $table->date('check_out_date');
            $table->string('experience_time', 5)->nullable();
            $table->string('status');
            $table->integer('adults')->default(1);
            $table->integer('children')->default(0);
            $table->timestamps();
        });

        Schema::create('property_blocked_dates', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('property_id');
            $table->date('start_date');
            $table->date('end_date');
            $table->string('reason')->nullable();
            $table->timestamps();
        });
    }

    public function test_experience_booking_rejects_unavailable_date_and_time(): void
    {
        $property = $this->experience();

        $validator = $this->bookingValidator([
            'property_id' => $property->id,
            'checkin' => '2026-10-02',
            'experience_time' => '11:00',
        ]);

        $this->assertFalse($validator->passes());
        $this->assertArrayHasKey('checkin', $validator->errors()->toArray());
        $this->assertArrayHasKey('experience_time', $validator->errors()->toArray());
    }

    public function test_experience_booking_rejects_a_full_time_slot(): void
    {
        $property = $this->experience(['guests' => 4]);

        DB::table('bookings')->insert([
            'property_id' => $property->id,
            'check_in_date' => '2026-10-01',
            'check_out_date' => '2026-10-02',
            'experience_time' => '10:00',
            'status' => 'confirmed',
            'adults' => 4,
            'children' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $validator = $this->bookingValidator([
            'property_id' => $property->id,
            'experience_time' => '10:00',
        ]);

        $this->assertFalse($validator->passes());
        $this->assertArrayHasKey('adults', $validator->errors()->toArray());
    }

    public function test_admin_experience_update_does_not_require_stay_fields(): void
    {
        $property = $this->experience();
        $request = UpdatePropertyRequest::create('/admin/properties/' . $property->id, 'PUT', [
            'title' => 'Updated Experience',
            'location' => 'Lahore',
            'price' => 50,
            'guests' => 4,
            'property_type' => 'villa',
            'status' => 'Active',
        ]);
        $route = new class($property) {
            public function __construct(private Property $property) {}

            public function parameter(string $key, mixed $default = null): mixed
            {
                return $key === 'property' ? $this->property : $default;
            }
        };
        $request->setRouteResolver(fn () => $route);

        $rules = $request->rules();

        $this->assertContains('nullable', $rules['bedrooms']);
        $this->assertContains('nullable', $rules['bathrooms']);
        $this->assertTrue(Validator::make($request->all(), $rules)->passes());
    }

    private function experience(array $overrides = []): Property
    {
        return Property::create(array_merge([
            'title' => 'City Walking Tour',
            'location' => 'Lahore',
            'price' => 50,
            'guests' => 4,
            'property_type' => 'tour',
            'listing_category' => 'experience',
            'status' => 'Active',
            'approval_status' => 'Approved',
            'description' => 'A guided city experience.',
            'min_participants' => 1,
            'experience_available_dates' => ['2026-10-01'],
            'experience_available_times' => ['10:00'],
            'experience_booking_paused' => false,
        ], $overrides));
    }

    private function bookingValidator(array $overrides = [])
    {
        $data = array_merge([
            'property_id' => 1,
            'checkin' => '2026-10-01',
            'checkout' => '2026-10-02',
            'experience_time' => '10:00',
            'name' => 'Test Guest',
            'email' => 'guest@example.com',
            'phone' => '03001234567',
            'adults' => 1,
            'children' => 0,
        ], $overrides);
        $request = StoreBookingRequest::create('/booking', 'POST', $data);
        $validator = Validator::make($request->all(), $request->rules(), $request->messages());
        $request->withValidator($validator);

        return $validator;
    }
}

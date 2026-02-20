<?php

namespace Database\Seeders;

use App\Enums\BookingStatus;
use App\Enums\PropertyStatus;
use App\Enums\PropertyType;
use App\Enums\UserType;
use App\Models\Booking;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestHistorySeeder extends Seeder
{
    /**
     * 20 listings (properties) + 5 completed bookings per listing for testing History.
     */
    public function run(): void
    {
        $hosts = $this->ensureHosts(2);
        $customers = $this->ensureCustomers(10);
        $properties = $this->createProperties(20, $hosts);

        $bookingCount = 0;
        foreach ($properties as $property) {
            for ($i = 0; $i < 5; $i++) {
                $customer = $customers->random();
                $this->createCompletedBooking($property, $customer, $i);
                $bookingCount++;
            }
        }

        $this->command->info("TestHistorySeeder: 20 properties and {$bookingCount} completed bookings created.");
    }

    private function ensureHosts(int $count): \Illuminate\Support\Collection
    {
        $existing = User::where('type', UserType::HOST)->take($count)->get();
        if ($existing->count() >= $count) {
            return $existing->take($count);
        }
        $created = collect();
        for ($i = $existing->count(); $i < $count; $i++) {
            $created->push(User::create([
                'name' => 'Host ' . ($i + 1),
                'email' => 'host' . ($i + 1) . '@test.com',
                'password' => Hash::make('password'),
                'type' => UserType::HOST,
                'email_verified_at' => now(),
            ]));
        }
        return $existing->merge($created)->take($count);
    }

    private function ensureCustomers(int $count): \Illuminate\Support\Collection
    {
        $existing = User::where('type', UserType::USER)->take($count)->get();
        if ($existing->count() >= $count) {
            return $existing->take($count);
        }
        $names = ['Alice', 'Bob', 'Carol', 'David', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack'];
        $created = collect();
        for ($i = $existing->count(); $i < $count; $i++) {
            $name = $names[$i % count($names)] . ' ' . ($i + 1);
            $created->push(User::create([
                'name' => $name,
                'email' => 'customer' . ($i + 1) . '@test.com',
                'password' => Hash::make('password'),
                'type' => UserType::USER,
                'email_verified_at' => now(),
            ]));
        }
        return $existing->merge($created)->take($count);
    }

    private function createProperties(int $count, \Illuminate\Support\Collection $hosts): \Illuminate\Support\Collection
    {
        $titles = [
            'Cozy Studio Downtown', 'Lakeside Cabin', 'City View Apartment', 'Garden House', 'Beach Loft',
            'Mountain Retreat', 'Urban Flat', 'Riverside Villa', 'Sunset Apartment', 'Forest Lodge',
            'Metro Studio', 'Harbor View Suite', 'Country Cottage', 'Skyline Penthouse', 'Park Side Home',
            'Alpine Chalet', 'Seaside Bungalow', 'Downtown Loft', 'Hillside Villa', 'Central Apartment',
        ];
        $locations = [
            'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
            'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'Austin, TX',
            'Miami, FL', 'Seattle, WA', 'Denver, CO', 'Boston, MA', 'Portland, OR',
            'Las Vegas, NV', 'Nashville, TN', 'Atlanta, GA', 'Minneapolis, MN', 'Orlando, FL',
        ];
        $types = [PropertyType::APARTMENT->value, PropertyType::HOUSE->value, PropertyType::STUDIO->value, PropertyType::VILLA->value, PropertyType::CONDO->value];

        $properties = collect();
        for ($i = 0; $i < $count; $i++) {
            $host = $hosts[$i % $hosts->count()];
            $properties->push(Property::create([
                'title' => $titles[$i],
                'location' => $locations[$i],
                'price' => [120, 150, 180, 200, 250][$i % 5],
                'bedrooms' => 1 + ($i % 3),
                'bathrooms' => 1 + ($i % 2),
                'guests' => 2 + ($i % 4),
                'property_type' => $types[$i % count($types)],
                'status' => 'Active',
                'approval_status' => PropertyStatus::APPROVED->value,
                'is_guest_favorite' => $i % 3 === 0,
                'description' => 'Test property for history and commission.',
                'amenities' => ['WiFi', 'AC', 'Kitchen', 'Parking'],
                'user_id' => $host->id,
            ]));
        }
        return $properties;
    }

    private function createCompletedBooking(Property $property, User $customer, int $offset): void
    {
        $nights = [2, 3, 5, 7, 4][$offset % 5];
        $baseDate = now()->subDays(90 - ($offset * 15));
        $checkIn = $baseDate->copy();
        $checkOut = $baseDate->copy()->addDays($nights);

        $nightlyRate = (float) $property->price;
        $subtotal = $nightlyRate * $nights;
        $cleaningFee = 25.0;
        $serviceFee = round($subtotal * 0.12, 2);
        $totalAmount = $subtotal + $cleaningFee + $serviceFee;

        Booking::create([
            'property_id' => $property->id,
            'user_id' => $customer->id,
            'name' => $customer->name,
            'email' => $customer->email,
            'phone_code' => '+1',
            'phone' => '555' . str_pad((string) (($property->id * 10 + $offset) % 10000000), 7, '0'),
            'rooms' => 1,
            'adults' => 2,
            'children' => 0,
            'check_in_date' => $checkIn,
            'check_out_date' => $checkOut,
            'nights' => $nights,
            'nightly_rate' => $nightlyRate,
            'cleaning_fee' => $cleaningFee,
            'service_fee' => $serviceFee,
            'total_amount' => $totalAmount,
            'status' => BookingStatus::COMPLETED,
            'created_at' => $checkIn->copy()->subDays(7),
        ]);
    }
}

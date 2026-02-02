<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Property;
use App\Models\Booking;
use App\Enums\UserType;
use App\Enums\PropertyStatus;

class CreateBookingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::where('type', UserType::USER->value)->take(5)->get();
        $properties = Property::where('status', 'Active')
            ->where('approval_status', PropertyStatus::APPROVED)
            ->take(8)
            ->get();

        if ($users->isEmpty() || $properties->isEmpty()) {
            $this->command->warn('Need at least 1 user and 1 approved property to seed bookings.');
            return;
        }

        $bookings = [
            // Past confirmed booking
            [
                'property' => $properties[0] ?? $properties->first(),
                'user' => $users[0] ?? $users->first(),
                'name' => 'John Doe',
                'email' => 'john.doe@example.com',
                'phone_code' => '+1',
                'phone' => '5551234567',
                'rooms' => 1,
                'adults' => 2,
                'children' => 0,
                'check_in_date' => now()->subDays(30),
                'check_out_date' => now()->subDays(23),
                'nights' => 7,
                'status' => 'completed',
                'payment_method' => 'credit_card',
                'card_last_four' => '1234',
            ],
            // Current confirmed booking
            [
                'property' => $properties[1] ?? $properties->first(),
                'user' => $users[1] ?? $users[0] ?? $users->first(),
                'name' => 'Sarah Johnson',
                'email' => 'sarah.johnson@example.com',
                'phone_code' => '+31',
                'phone' => '612345678',
                'rooms' => 2,
                'adults' => 4,
                'children' => 1,
                'check_in_date' => now()->subDays(3),
                'check_out_date' => now()->addDays(4),
                'nights' => 7,
                'status' => 'confirmed',
                'payment_method' => 'credit_card',
                'card_last_four' => '5678',
            ],
            // Upcoming pending booking
            [
                'property' => $properties[2] ?? $properties->first(),
                'user' => $users[2] ?? $users[0] ?? $users->first(),
                'name' => 'Michael Chen',
                'email' => 'michael.chen@example.com',
                'phone_code' => '+44',
                'phone' => '7912345678',
                'rooms' => 1,
                'adults' => 2,
                'children' => 0,
                'check_in_date' => now()->addDays(10),
                'check_out_date' => now()->addDays(17),
                'nights' => 7,
                'status' => 'pending',
                'payment_method' => 'ideal',
                'card_last_four' => null,
            ],
            // Future confirmed booking
            [
                'property' => $properties[3] ?? $properties->first(),
                'user' => $users[3] ?? $users[0] ?? $users->first(),
                'name' => 'Emily Rodriguez',
                'email' => 'emily.rodriguez@example.com',
                'phone_code' => '+1',
                'phone' => '5559876543',
                'rooms' => 3,
                'adults' => 6,
                'children' => 2,
                'check_in_date' => now()->addDays(20),
                'check_out_date' => now()->addDays(27),
                'nights' => 7,
                'status' => 'confirmed',
                'payment_method' => 'credit_card',
                'card_last_four' => '9012',
            ],
            // Short stay booking
            [
                'property' => $properties[4] ?? $properties->first(),
                'user' => $users[4] ?? $users[0] ?? $users->first(),
                'name' => 'David Wilson',
                'email' => 'david.wilson@example.com',
                'phone_code' => '+31',
                'phone' => '612345679',
                'rooms' => 1,
                'adults' => 1,
                'children' => 0,
                'check_in_date' => now()->addDays(5),
                'check_out_date' => now()->addDays(7),
                'nights' => 2,
                'status' => 'pending',
                'payment_method' => 'paypal',
                'card_last_four' => null,
            ],
            // Cancelled booking
            [
                'property' => $properties[5] ?? $properties->first(),
                'user' => $users[0] ?? $users->first(),
                'name' => 'Lisa Anderson',
                'email' => 'lisa.anderson@example.com',
                'phone_code' => '+44',
                'phone' => '7912345679',
                'rooms' => 2,
                'adults' => 3,
                'children' => 1,
                'check_in_date' => now()->addDays(15),
                'check_out_date' => now()->addDays(22),
                'nights' => 7,
                'status' => 'cancelled',
                'payment_method' => 'credit_card',
                'card_last_four' => '3456',
            ],
        ];

        foreach ($bookings as $bookingData) {
            $property = $bookingData['property'];
            $user = $bookingData['user'];
            
            $nightlyRate = (float) $property->price;
            $nights = $bookingData['nights'];
            $subtotal = $nightlyRate * $nights;
            $cleaningFee = 25.00;
            $serviceFee = round($subtotal * 0.12, 2);
            $totalAmount = $subtotal + $cleaningFee + $serviceFee;

            Booking::create([
                'property_id' => $property->id,
                'user_id' => $user->id,
                'name' => $bookingData['name'],
                'email' => $bookingData['email'],
                'phone_code' => $bookingData['phone_code'],
                'phone' => $bookingData['phone'],
                'rooms' => $bookingData['rooms'],
                'adults' => $bookingData['adults'],
                'children' => $bookingData['children'],
                'check_in_date' => $bookingData['check_in_date'],
                'check_out_date' => $bookingData['check_out_date'],
                'nights' => $nights,
                'nightly_rate' => $nightlyRate,
                'cleaning_fee' => $cleaningFee,
                'service_fee' => $serviceFee,
                'total_amount' => $totalAmount,
                'status' => $bookingData['status'],
                'payment_method' => $bookingData['payment_method'],
                'card_last_four' => $bookingData['card_last_four'],
                'created_at' => now()->subDays(rand(1, 60)),
            ]);
        }

        $this->command->info('Successfully created ' . count($bookings) . ' bookings!');
    }
}

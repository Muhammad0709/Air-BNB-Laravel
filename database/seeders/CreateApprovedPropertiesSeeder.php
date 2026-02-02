<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Property;
use App\Models\User;
use App\Enums\PropertyStatus;
use App\Enums\PropertyType;

class CreateApprovedPropertiesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get first user or create one if none exists
        $user = User::first();
        
        if (!$user) {
            $this->command->error('No users found. Please create a user first.');
            return;
        }

        $properties = [
            [
                'title' => 'Luxury Beachfront Villa',
                'location' => 'Malibu, California',
                'price' => 299.00,
                'bedrooms' => 4,
                'bathrooms' => 3,
                'guests' => 8,
                'property_type' => PropertyType::VILLA->value,
                'status' => 'Active',
                'approval_status' => PropertyStatus::APPROVED->value,
                'is_guest_favorite' => true,
                'description' => 'Stunning beachfront villa with panoramic ocean views, private pool, and direct beach access.',
                'amenities' => ['WiFi', 'Parking', 'Pool', 'AC', 'Kitchen', 'Balcony'],
                'user_id' => $user->id,
            ],
            [
                'title' => 'Modern Downtown Apartment',
                'location' => 'New York, New York',
                'price' => 199.00,
                'bedrooms' => 2,
                'bathrooms' => 2,
                'guests' => 4,
                'property_type' => PropertyType::APARTMENT->value,
                'status' => 'Active',
                'approval_status' => PropertyStatus::APPROVED->value,
                'is_guest_favorite' => false,
                'description' => 'Stylish apartment in the heart of downtown with modern amenities and city views.',
                'amenities' => ['WiFi', 'AC', 'Kitchen', 'Gym', 'Parking'],
                'user_id' => $user->id,
            ],
            [
                'title' => 'Cozy Mountain Cabin',
                'location' => 'Aspen, Colorado',
                'price' => 249.00,
                'bedrooms' => 3,
                'bathrooms' => 2,
                'guests' => 6,
                'property_type' => PropertyType::HOUSE->value,
                'status' => 'Active',
                'approval_status' => PropertyStatus::APPROVED->value,
                'is_guest_favorite' => true,
                'description' => 'Charming mountain cabin with fireplace, perfect for a winter getaway.',
                'amenities' => ['WiFi', 'Fireplace', 'Kitchen', 'Parking', 'Pet-Friendly'],
                'user_id' => $user->id,
            ],
            [
                'title' => 'Elegant Studio Loft',
                'location' => 'San Francisco, California',
                'price' => 149.00,
                'bedrooms' => 1,
                'bathrooms' => 1,
                'guests' => 2,
                'property_type' => PropertyType::STUDIO->value,
                'status' => 'Active',
                'approval_status' => PropertyStatus::APPROVED->value,
                'is_guest_favorite' => false,
                'description' => 'Beautiful studio loft with high ceilings and modern design in trendy neighborhood.',
                'amenities' => ['WiFi', 'AC', 'Kitchen', 'Balcony'],
                'user_id' => $user->id,
            ],
            [
                'title' => 'Spacious Family House',
                'location' => 'Austin, Texas',
                'price' => 179.00,
                'bedrooms' => 5,
                'bathrooms' => 4,
                'guests' => 10,
                'property_type' => PropertyType::HOUSE->value,
                'status' => 'Active',
                'approval_status' => PropertyStatus::APPROVED->value,
                'is_guest_favorite' => false,
                'description' => 'Large family-friendly house with backyard, perfect for groups and families.',
                'amenities' => ['WiFi', 'Parking', 'Pool', 'AC', 'Kitchen', 'Gym', 'Pet-Friendly'],
                'user_id' => $user->id,
            ],
            [
                'title' => 'Luxury Condo with City Views',
                'location' => 'Miami, Florida',
                'price' => 229.00,
                'bedrooms' => 2,
                'bathrooms' => 2,
                'guests' => 4,
                'property_type' => PropertyType::CONDO->value,
                'status' => 'Active',
                'approval_status' => PropertyStatus::APPROVED->value,
                'is_guest_favorite' => false,
                'description' => 'Premium condo with stunning city and ocean views, rooftop pool access.',
                'amenities' => ['WiFi', 'Parking', 'Pool', 'AC', 'Kitchen', 'Gym', 'Balcony'],
                'user_id' => $user->id,
            ],
            [
                'title' => 'Rustic Countryside Villa',
                'location' => 'Tuscany, Italy',
                'price' => 349.00,
                'bedrooms' => 4,
                'bathrooms' => 3,
                'guests' => 8,
                'property_type' => PropertyType::VILLA->value,
                'status' => 'Active',
                'approval_status' => PropertyStatus::APPROVED->value,
                'is_guest_favorite' => false,
                'description' => 'Beautiful countryside villa with vineyard views and traditional Italian architecture.',
                'amenities' => ['WiFi', 'Parking', 'Pool', 'AC', 'Kitchen', 'Balcony', 'Pet-Friendly'],
                'user_id' => $user->id,
            ],
            [
                'title' => 'Modern Urban Apartment',
                'location' => 'Chicago, Illinois',
                'price' => 159.00,
                'bedrooms' => 1,
                'bathrooms' => 1,
                'guests' => 2,
                'property_type' => PropertyType::APARTMENT->value,
                'status' => 'Active',
                'approval_status' => PropertyStatus::APPROVED->value,
                'is_guest_favorite' => false,
                'description' => 'Contemporary apartment in vibrant neighborhood with easy access to public transport.',
                'amenities' => ['WiFi', 'AC', 'Kitchen', 'Parking'],
                'user_id' => $user->id,
            ],
            [
                'title' => 'Beachside Bungalow',
                'location' => 'Bali, Indonesia',
                'price' => 129.00,
                'bedrooms' => 2,
                'bathrooms' => 1,
                'guests' => 4,
                'property_type' => PropertyType::HOUSE->value,
                'status' => 'Active',
                'approval_status' => PropertyStatus::APPROVED->value,
                'is_guest_favorite' => false,
                'description' => 'Charming beachside bungalow with tropical garden and direct beach access.',
                'amenities' => ['WiFi', 'Kitchen', 'Parking', 'Balcony'],
                'user_id' => $user->id,
            ],
            [
                'title' => 'Luxury Penthouse Suite',
                'location' => 'Las Vegas, Nevada',
                'price' => 399.00,
                'bedrooms' => 3,
                'bathrooms' => 3,
                'guests' => 6,
                'property_type' => PropertyType::CONDO->value,
                'status' => 'Active',
                'approval_status' => PropertyStatus::APPROVED->value,
                'is_guest_favorite' => true,
                'description' => 'Ultra-modern penthouse with panoramic city views, premium amenities, and concierge service.',
                'amenities' => ['WiFi', 'Parking', 'Pool', 'AC', 'Kitchen', 'Gym', 'Balcony', 'Concierge'],
                'user_id' => $user->id,
            ],
        ];

        foreach ($properties as $propertyData) {
            Property::create($propertyData);
        }

        $this->command->info('Successfully created 10 approved properties!');
    }
}


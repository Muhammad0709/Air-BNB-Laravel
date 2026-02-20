<?php

namespace Database\Seeders;

use App\Models\Property;
use App\Models\Review;
use App\Models\User;
use App\Enums\PropertyStatus;
use App\Enums\PropertyType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class PropertySeeder extends Seeder
{

    public function run(): void
    {
        $user = User::first();

        if (!$user) {
            $this->command->warn('No user found. Run User/Admin seeder first.');
            return;
        }

        $properties = $this->getPropertiesData($user->id);

        foreach ($properties as $index => $data) {
            $imagePath = $this->downloadImageForProperty($index + 1);
            if ($imagePath) {
                $data['image'] = $imagePath;
                $data['images'] = [$imagePath];
            }
            Property::create($data);
        }

        // Add 3 high-rated properties (avg rating 4.6, 4.7, 4.9) with reviews
        $this->seedTopRatedProperties($user);

        $this->command->info('PropertySeeder: Created ' . count($properties) . ' properties + 3 top-rated, with approved status and unique images.');
    }

    /**
     * Create 3 properties with target average ratings 4.6, 4.7, 4.9 via reviews.
     */
    private function seedTopRatedProperties(User $user): void
    {
        $targets = [
            ['title' => 'Santorini Premium Villa', 'location' => 'Santorini, Greece', 'rating' => 4.6],
            ['title' => 'Bali Paradise Villa', 'location' => 'Bali, Indonesia', 'rating' => 4.7],
            ['title' => 'Dubai Luxury Villa', 'location' => 'Dubai, UAE', 'rating' => 4.9],
        ];

        // Ratings that produce exact average (integer reviews 1-5 only)
        // 4.6 = (5+5+5+5+3)/5; 4.7 = (5*7+4*3)/10; 4.9 = (5*9+4*1)/10
        $ratingsForTarget = [
            4.6 => [5, 5, 5, 5, 3],
            4.7 => array_merge(array_fill(0, 7, 5), array_fill(0, 3, 4)),
            4.9 => array_merge(array_fill(0, 9, 5), [4]),
        ];

        $baseSeed = 51;
        foreach ($targets as $i => $target) {
            $imagePath = $this->downloadImageForProperty($baseSeed + $i);
            $data = [
                'title' => $target['title'],
                'location' => $target['location'],
                'price' => 299 + ($i * 50),
                'bedrooms' => 3,
                'bathrooms' => 2,
                'guests' => 6,
                'property_type' => PropertyType::VILLA->value,
                'status' => 'Active',
                'approval_status' => PropertyStatus::APPROVED->value,
                'is_guest_favorite' => false,
                'description' => 'Stunning property with panoramic views and premium amenities.',
                'amenities' => ['WiFi', 'Parking', 'Pool', 'AC', 'Kitchen', 'Balcony'],
                'user_id' => $user->id,
            ];
            if ($imagePath) {
                $data['image'] = $imagePath;
                $data['images'] = [$imagePath];
            }
            $property = Property::create($data);

            $ratings = $ratingsForTarget[$target['rating']];
            $reviewUserIds = User::pluck('id')->unique()->values()->all();
            if (empty($reviewUserIds)) {
                $reviewUserIds = [$user->id];
            }
            // One review per user (unique constraint); use as many reviews as we have users
            $maxReviews = min(count($ratings), count($reviewUserIds));
            $ratingsToUse = array_slice($ratings, 0, $maxReviews);
            foreach ($ratingsToUse as $rIndex => $rating) {
                Review::create([
                    'property_id' => $property->id,
                    'user_id' => $reviewUserIds[$rIndex],
                    'rating' => $rating,
                    'comment' => 'Excellent stay, highly recommend!',
                ]);
            }
        }
    }

    /**
     * Download a unique image from Picsum and store in public disk.
     * Returns storage path (e.g. 'properties/seed-1.jpg') or null on failure.
     */
    private function downloadImageForProperty(int $seed): ?string
    {
        $url = "https://picsum.photos/seed/{$seed}/800/600";
        $filename = "properties/seed-{$seed}.jpg";

        try {
            $response = Http::timeout(15)->get($url);
            if (!$response->successful()) {
                return null;
            }
            $contents = $response->body();
            if (empty($contents) || strlen($contents) < 100) {
                return null;
            }
            Storage::disk('public')->put($filename, $contents);
            return $filename;
        } catch (\Throwable $e) {
            $this->command->warn("Could not download image for seed {$seed}: " . $e->getMessage());
            return null;
        }
    }

    private function getPropertiesData(int $userId): array
    {
        $locations = [
            'Malibu, California', 'New York, New York', 'Aspen, Colorado', 'San Francisco, California',
            'Austin, Texas', 'Miami, Florida', 'Chicago, Illinois', 'Seattle, Washington', 'Boston, Massachusetts',
            'Los Angeles, California', 'Denver, Colorado', 'Nashville, Tennessee', 'Portland, Oregon',
            'San Diego, California', 'Las Vegas, Nevada', 'Phoenix, Arizona', 'Dallas, Texas', 'Atlanta, Georgia',
            'New Orleans, Louisiana', 'Santa Fe, New Mexico', 'Savannah, Georgia', 'Charleston, South Carolina',
            'Sedona, Arizona', 'Lake Tahoe, California', 'Key West, Florida', 'Napa Valley, California',
            'Tuscany, Italy', 'Bali, Indonesia', 'Barcelona, Spain', 'Paris, France', 'Tokyo, Japan',
            'London, UK', 'Amsterdam, Netherlands', 'Sydney, Australia', 'Dubai, UAE', 'Lisbon, Portugal',
            'Santorini, Greece', 'Cape Town, South Africa', 'Queenstown, New Zealand', 'Reykjavik, Iceland',
            'Banff, Canada', 'Cancun, Mexico', 'Prague, Czech Republic', 'Rome, Italy', 'Vienna, Austria',
            'Madrid, Spain', 'Berlin, Germany', 'Edinburgh, UK', 'Dublin, Ireland', 'Zurich, Switzerland',
        ];

        $titles = [
            'Luxury Beachfront Villa', 'Modern Downtown Apartment', 'Cozy Mountain Cabin', 'Elegant Studio Loft',
            'Spacious Family House', 'Luxury Condo with City Views', 'Rustic Countryside Villa', 'Modern Urban Apartment',
            'Beachside Bungalow', 'Luxury Penthouse Suite', 'Charming Cottage', 'Stunning Lake House',
            'Contemporary Loft', 'Historic Townhouse', 'Seaside Retreat', 'Garden View Apartment',
            'Skyline Penthouse', 'Coastal Escape', 'Mountain View Lodge', 'Downtown Studio',
            'Vineyard Estate', 'Tropical Paradise Villa', 'City Center Apartment', 'Hillside Retreat',
            'Waterfront Condo', 'Desert Oasis', 'Alpine Chalet', 'Urban Sanctuary', 'Beach House Escape',
            'Country Estate', 'Rooftop Terrace Apartment', 'Forest Cabin', 'Riverside Loft',
            'Sunset View Villa', 'Minimalist Studio', 'Grand Historic Home', 'Modern Farmhouse',
            'Cliffside Villa', 'Park View Apartment', 'Island Bungalow', 'Garden Cottage',
            'High-Rise Condo', 'Bohemian Loft', 'Scandinavian Retreat', 'Mediterranean Villa',
            'Japanese-Style House', 'Colonial Mansion', 'Art Deco Apartment', 'Treehouse Retreat',
            'Floating Home', 'Castle Suite',
        ];

        $descriptions = [
            'Stunning property with panoramic views and premium amenities.',
            'Beautiful space in a prime location, perfect for your stay.',
            'Comfortable and stylish, with everything you need.',
            'Relax in this well-appointed property with modern finishes.',
            'Spacious and inviting, ideal for families and groups.',
            'Elegant design meets comfort in this unique property.',
            'Enjoy peace and privacy in this lovely retreat.',
            'Central location with easy access to attractions.',
            'A true home away from home with top-notch amenities.',
            'Wake up to amazing views in this special property.',
        ];

        $amenitiesSets = [
            ['WiFi', 'Parking', 'Pool', 'AC', 'Kitchen', 'Balcony'],
            ['WiFi', 'AC', 'Kitchen', 'Gym', 'Parking'],
            ['WiFi', 'Fireplace', 'Kitchen', 'Parking', 'Pet-Friendly'],
            ['WiFi', 'AC', 'Kitchen', 'Balcony'],
            ['WiFi', 'Parking', 'Pool', 'AC', 'Kitchen', 'Gym', 'Pet-Friendly'],
            ['WiFi', 'Parking', 'Pool', 'AC', 'Kitchen', 'Gym', 'Balcony'],
            ['WiFi', 'Parking', 'Pool', 'AC', 'Kitchen', 'Balcony', 'Pet-Friendly'],
            ['WiFi', 'AC', 'Kitchen', 'Parking'],
            ['WiFi', 'Kitchen', 'Parking', 'Balcony'],
            ['WiFi', 'Parking', 'Pool', 'AC', 'Kitchen', 'Gym', 'Balcony', 'Concierge'],
        ];

        $types = [
            PropertyType::VILLA->value,
            PropertyType::APARTMENT->value,
            PropertyType::HOUSE->value,
            PropertyType::STUDIO->value,
            PropertyType::CONDO->value,
        ];

        $data = [];
        for ($i = 0; $i < 50; $i++) {
            $beds = [1, 2, 3, 4, 5, 6][$i % 6];
            $baths = max(1, (int) ceil($beds / 2) + ($i % 2));
            $guests = $beds * 2 + ($i % 3);
            $data[] = [
                'title' => $titles[$i % count($titles)],
                'location' => $locations[$i % count($locations)],
                'price' => [99, 129, 159, 199, 249, 299, 349, 399][$i % 8] + ($i % 5) * 10,
                'bedrooms' => $beds,
                'bathrooms' => min($baths, 5),
                'guests' => min($guests, 12),
                'property_type' => $types[$i % count($types)],
                'status' => 'Active',
                'approval_status' => PropertyStatus::APPROVED->value,
                'is_guest_favorite' => $i % 4 === 0,
                'description' => $descriptions[$i % count($descriptions)],
                'amenities' => $amenitiesSets[$i % count($amenitiesSets)],
                'user_id' => $userId,
            ];
        }

        return $data;
    }
}

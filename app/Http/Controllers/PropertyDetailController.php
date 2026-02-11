<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Enums\PropertyStatus;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class PropertyDetailController extends Controller
{
    /**
     * Display the specified property detail page.
     */
    public function show($id)
    {
        $property = Property::with(['user', 'reviews.user'])
            ->where('status', 'Active')
            ->where('approval_status', PropertyStatus::APPROVED)
            ->findOrFail($id);

        // Format images array
        $images = [];
        if ($property->images) {
            $imagesArray = is_string($property->images) ? json_decode($property->images, true) : $property->images;
            if (is_array($imagesArray)) {
                foreach ($imagesArray as $img) {
                    if ($img) {
                        $images[] = Storage::url($img);
                    }
                }
            }
        }
        
        // If no images array but has main image, use that
        if (empty($images) && $property->image) {
            $images[] = Storage::url($property->image);
        }

        // Format amenities
        $amenities = [];
        if ($property->amenities) {
            if (is_string($property->amenities)) {
                // Try JSON first
                $decoded = json_decode($property->amenities, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $amenities = $decoded;
                } else {
                    // Fallback to comma-separated
                    $amenities = array_map('trim', explode(',', $property->amenities));
                }
            } elseif (is_array($property->amenities)) {
                $amenities = $property->amenities;
            }
        }

        // Format reviews
        $reviews = $property->reviews->map(function ($review) {
            $profilePicture = null;
            if ($review->user->profile_picture) {
                // If profile_picture is a full URL, use it as is
                if (filter_var($review->user->profile_picture, FILTER_VALIDATE_URL)) {
                    $profilePicture = $review->user->profile_picture;
                } else {
                    // Otherwise, treat it as a storage path
                    $profilePicture = Storage::url($review->user->profile_picture);
                }
            }

            return [
                'id' => $review->id,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'created_at' => $review->created_at->format('d M, Y'),
                'user' => [
                    'id' => $review->user->id,
                    'name' => $review->user->name,
                    'profile_picture' => $profilePicture,
                ],
            ];
        });

        // Calculate average rating and rating breakdown
        $totalReviews = $reviews->count();
        $averageRating = $totalReviews > 0 ? round($reviews->avg('rating'), 1) : 0;
        
        $ratingBreakdown = [
            5 => $reviews->where('rating', 5)->count(),
            4 => $reviews->where('rating', 4)->count(),
            3 => $reviews->where('rating', 3)->count(),
            2 => $reviews->where('rating', 2)->count(),
            1 => $reviews->where('rating', 1)->count(),
        ];

        // Format property data
        $propertyData = [
            'id' => $property->id,
            'title' => $property->title,
            'location' => $property->location,
            'price' => $property->price,
            'bedrooms' => $property->bedrooms,
            'bathrooms' => $property->bathrooms,
            'guests' => $property->guests,
            'property_type' => $property->property_type,
            'description' => $property->description,
            'amenities' => $amenities,
            'image' => $property->image ? Storage::url($property->image) : null,
            'images' => $images,
            'host' => [
                'id' => $property->user->id,
                'name' => $property->user->name,
                'email' => $property->user->email,
                'profile_picture' => $property->user->profile_picture ?? null,
                'created_at' => $property->user->created_at->toDateTimeString(),
            ],
        ];

        // Get related properties (same location, different property)
        $relatedProperties = Property::where('status', 'Active')
            ->where('approval_status', PropertyStatus::APPROVED)
            ->where('location', 'like', "%{$property->location}%")
            ->where('id', '!=', $property->id)
            ->limit(3)
            ->get()
            ->map(function ($prop) {
                return [
                    'id' => $prop->id,
                    'title' => $prop->title,
                    'location' => $prop->location,
                    'price' => $prop->price,
                    'image' => $prop->image ? Storage::url($prop->image) : null,
                ];
            });

        $defaultCheckin = Carbon::today()->format('Y-m-d');
        $defaultCheckout = Carbon::today()->addDays(7)->format('Y-m-d');

        return Inertia::render('ListingDetail', [
            'property' => $propertyData,
            'relatedProperties' => $relatedProperties,
            'reviews' => $reviews,
            'ratingStats' => [
                'average' => $averageRating,
                'total' => $totalReviews,
                'breakdown' => $ratingBreakdown,
            ],
            'defaultCheckin' => $defaultCheckin,
            'defaultCheckout' => $defaultCheckout,
        ]);
    }
}

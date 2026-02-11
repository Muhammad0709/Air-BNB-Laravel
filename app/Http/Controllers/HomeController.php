<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Enums\PropertyStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class HomeController extends Controller
{
    public function index()
    {
        // Helper function to format properties
        $formatProperty = function ($property) {
            $reviews = $property->reviews;
            $totalReviews = $reviews->count();
            $averageRating = $totalReviews > 0 ? round($reviews->avg('rating'), 2) : 0;

            return [
                'id' => $property->id,
                'title' => $property->title,
                'location' => $property->location,
                'price' => (float) $property->price,
                'rating' => $averageRating,
                'reviews' => $totalReviews,
                'image' => $property->image ? Storage::url($property->image) : '/images/filter-1.svg',
                'isGuestFavorite' => (bool) ($property->is_guest_favorite ?? false),
            ];
        };

        // Featured Properties (Hotels) - Latest approved properties
        $featuredProperties = Property::with('reviews')
            ->where('status', 'Active')
            ->where('approval_status', PropertyStatus::APPROVED)
            ->latest()
            ->limit(20)
            ->get()
            ->map($formatProperty);

        // Favorite Properties - Guest favorites
        $favoriteProperties = Property::with('reviews')
            ->where('status', 'Active')
            ->where('approval_status', PropertyStatus::APPROVED)
            ->where('is_guest_favorite', true)
            ->latest()
            ->limit(20)
            ->get()
            ->map($formatProperty);

        // Popular Properties - Approved, sorted by rating (then latest)
        $popularProperties = Property::with('reviews')
            ->where('status', 'Active')
            ->where('approval_status', PropertyStatus::APPROVED)
            ->latest()
            ->limit(50)
            ->get()
            ->map($formatProperty)
            ->sortByDesc('rating')
            ->take(20)
            ->values()
            ->all();

        // Popular Destinations - Get unique locations from properties
        $popularDestinations = Property::where('status', 'Active')
            ->where('approval_status', PropertyStatus::APPROVED)
            ->select('location')
            ->distinct()
            ->orderBy('location')
            ->limit(10)
            ->get()
            ->map(function ($property) {
                // Split location into city and region if format is "City, Region"
                $parts = explode(', ', $property->location);
                $name = $parts[0] ?? $property->location;
                $region = count($parts) > 1 ? implode(', ', array_slice($parts, 1)) : '';
                
                return [
                    'name' => $name,
                    'location' => $property->location,
                ];
            });

        return Inertia::render('Home', [
            'featuredProperties' => $featuredProperties,
            'favoriteProperties' => $favoriteProperties,
            'popularProperties' => $popularProperties,
            'popularDestinations' => $popularDestinations,
        ]);
    }
}

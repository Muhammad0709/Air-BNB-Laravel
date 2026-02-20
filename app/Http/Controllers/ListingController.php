<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Property;
use App\Enums\PropertyStatus;

class ListingController extends Controller
{
    /**
     * Display the listing page.
     */
    public function index(Request $request)
    {
        $query = Property::where('status', 'Active')
                        ->where('approval_status', PropertyStatus::APPROVED);

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Apply price range filter
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->get('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->get('max_price'));
        }

        // Apply property type filter
        if ($request->filled('property_type')) {
            $query->where('property_type', $request->get('property_type'));
        }

        // Apply guests filter
        if ($request->filled('guests')) {
            $query->where('guests', '>=', $request->get('guests'));
        }

        // Apply location filter
        if ($request->filled('locations')) {
            $locations = $request->get('locations');
            if (is_array($locations) && !empty($locations)) {
                $query->where(function($q) use ($locations) {
                    foreach ($locations as $location) {
                        $q->orWhere('location', 'like', "%{$location}%");
                    }
                });
            }
        }

        // Apply amenities filter
        if ($request->filled('amenities')) {
            $amenities = $request->get('amenities');
            if (is_array($amenities) && !empty($amenities)) {
                $query->where(function($q) use ($amenities) {
                    foreach ($amenities as $amenity) {
                        $q->whereRaw("JSON_CONTAINS(amenities, ?)", [json_encode($amenity)]);
                    }
                });
            }
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'featured');
        switch ($sortBy) {
            case 'price_low':
                $query->orderBy('price', 'asc');
                break;
            case 'price_high':
                $query->orderBy('price', 'desc');
                break;
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            default:
                $query->orderBy('created_at', 'desc');
        }

        $properties = $query->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->paginate(8)
            ->through(function ($property) {
                return [
                    'id' => $property->id,
                    'title' => $property->title,
                    'location' => $property->location,
                    'price' => (float) $property->price,
                    'guests' => $property->guests,
                    'bedrooms' => $property->bedrooms,
                    'bathrooms' => $property->bathrooms,
                    'property_type' => $property->property_type,
                    'image' => $property->getPrimaryImageUrl(),
                    'amenities' => is_string($property->amenities) ? explode(',', $property->amenities) : ($property->amenities ?? []),
                    'rating' => $property->reviews_avg_rating ? round((float) $property->reviews_avg_rating, 2) : null,
                    'reviews' => (int) ($property->reviews_count ?? 0),
                    'is_guest_favorite' => (bool) ($property->is_guest_favorite ?? false),
                ];
            });

        // Get price range for filters (null-safe when no properties)
        $priceRange = Property::where('status', 'Active')
                             ->where('approval_status', PropertyStatus::APPROVED)
                             ->selectRaw('MIN(price) as min_price, MAX(price) as max_price')
                             ->first();
        $minPrice = $priceRange ? (float) $priceRange->min_price : 0;
        $maxPrice = $priceRange ? (float) $priceRange->max_price : 1000;

        // Get available property types
        $propertyTypes = Property::where('status', 'Active')
                                ->where('approval_status', PropertyStatus::APPROVED)
                                ->distinct()
                                ->pluck('property_type')
                                ->filter()
                                ->values();

        // Get available locations and amenities for filter options
        $availableLocations = Property::where('status', 'Active')
                                    ->where('approval_status', PropertyStatus::APPROVED)
                                    ->distinct()
                                    ->pluck('location')
                                    ->filter()
                                    ->values();

        $availableAmenities = Property::where('status', 'Active')
                                    ->where('approval_status', PropertyStatus::APPROVED)
                                    ->whereNotNull('amenities')
                                    ->get()
                                    ->flatMap(function ($property) {
                                        $amenities = is_string($property->amenities) 
                                            ? explode(',', $property->amenities) 
                                            : ($property->amenities ?? []);
                                        return array_map('trim', $amenities);
                                    })
                                    ->unique()
                                    ->filter()
                                    ->values();

        return Inertia::render('Listing', [
            'properties' => $properties,
            'filters' => [
                'search' => $request->get('search', ''),
                'min_price' => $request->filled('min_price') ? (float) $request->get('min_price') : $minPrice,
                'max_price' => $request->filled('max_price') ? (float) $request->get('max_price') : $maxPrice,
                'property_type' => $request->get('property_type', ''),
                'guests' => (int) $request->get('guests', 1),
                'checkin' => $request->get('checkin'),
                'checkout' => $request->get('checkout'),
                'locations' => $request->get('locations', []),
                'amenities' => $request->get('amenities', []),
                'sort_by' => $sortBy,
            ],
            'priceRange' => [
                'min' => $minPrice,
                'max' => $maxPrice,
            ],
            'propertyTypes' => $propertyTypes,
            'availableLocations' => $availableLocations,
            'availableAmenities' => $availableAmenities,
        ]);
    }
}
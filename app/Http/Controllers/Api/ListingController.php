<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Enums\PropertyStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * @OA\Tag(
 *     name="Listings",
 *     description="API endpoints for browsing and filtering property listings"
 * )
 */
class ListingController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/listings",
     *     summary="Browse property listings",
     *     description="Returns a paginated list of active/approved properties with filtering, sorting, and available filter options.",
     *     tags={"Listings"},
     *     @OA\Parameter(name="search", in="query", required=false, description="Search by title, location or description", @OA\Schema(type="string")),
     *     @OA\Parameter(name="min_price", in="query", required=false, @OA\Schema(type="number")),
     *     @OA\Parameter(name="max_price", in="query", required=false, @OA\Schema(type="number")),
     *     @OA\Parameter(name="property_type", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="guests", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="locations", in="query", required=false, description="Array of location strings", @OA\Schema(type="array", @OA\Items(type="string"))),
     *     @OA\Parameter(name="amenities", in="query", required=false, description="Array of amenity strings", @OA\Schema(type="array", @OA\Items(type="string"))),
     *     @OA\Parameter(name="sort_by", in="query", required=false, description="featured|price_low|price_high|newest", @OA\Schema(type="string", default="featured")),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=8, maximum=50)),
     *     @OA\Parameter(name="page", in="query", required=false, @OA\Schema(type="integer", default=1)),
     *     @OA\Response(
     *         response=200,
     *         description="Listings retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Listings retrieved successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $query = Property::where('status', 'Active')
            ->where('approval_status', PropertyStatus::APPROVED);

        // Search
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Price range
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->get('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->get('max_price'));
        }

        // Property type
        if ($request->filled('property_type')) {
            $query->where('property_type', $request->get('property_type'));
        }

        // Guests
        if ($request->filled('guests')) {
            $query->where('guests', '>=', $request->get('guests'));
        }

        // Locations (array)
        if ($request->filled('locations')) {
            $locations = $request->get('locations');
            if (is_array($locations) && ! empty($locations)) {
                $query->where(function ($q) use ($locations) {
                    foreach ($locations as $location) {
                        $q->orWhere('location', 'like', "%{$location}%");
                    }
                });
            }
        }

        // Amenities (array)
        if ($request->filled('amenities')) {
            $amenities = $request->get('amenities');
            if (is_array($amenities) && ! empty($amenities)) {
                $query->where(function ($q) use ($amenities) {
                    foreach ($amenities as $amenity) {
                        $q->whereRaw('JSON_CONTAINS(amenities, ?)', [json_encode($amenity)]);
                    }
                });
            }
        }

        // Sorting
        switch ($request->get('sort_by', 'featured')) {
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

        $perPage = min((int) $request->get('per_page', 8), 50);

        $paginated = $query
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->paginate($perPage);

        $properties = $paginated->getCollection()->map(function ($property) {
            return [
                'id'               => $property->id,
                'title'            => $property->title,
                'location'         => $property->location,
                'price'            => (float) $property->price,
                'guests'           => $property->guests,
                'bedrooms'         => $property->bedrooms,
                'bathrooms'        => $property->bathrooms,
                'property_type'    => $property->property_type,
                'image'            => $property->getPrimaryImageUrl(),
                'amenities'        => is_array($property->amenities)
                    ? $property->amenities
                    : (is_string($property->amenities) ? explode(',', $property->amenities) : []),
                'rating'           => $property->reviews_avg_rating
                    ? round((float) $property->reviews_avg_rating, 2) : null,
                'reviews'          => (int) ($property->reviews_count ?? 0),
                'is_guest_favorite' => (bool) ($property->is_guest_favorite ?? false),
            ];
        });

        // Price range for filter hints
        $priceRange = Property::where('status', 'Active')
            ->where('approval_status', PropertyStatus::APPROVED)
            ->selectRaw('MIN(price) as min_price, MAX(price) as max_price')
            ->first();

        // Available filter options
        $propertyTypes = Property::where('status', 'Active')
            ->where('approval_status', PropertyStatus::APPROVED)
            ->distinct()->pluck('property_type')->filter()->values();

        $availableLocations = Property::where('status', 'Active')
            ->where('approval_status', PropertyStatus::APPROVED)
            ->distinct()->pluck('location')->filter()->values();

        $availableAmenities = Property::where('status', 'Active')
            ->where('approval_status', PropertyStatus::APPROVED)
            ->whereNotNull('amenities')
            ->get()
            ->flatMap(function ($prop) {
                $arr = is_array($prop->amenities)
                    ? $prop->amenities
                    : (is_string($prop->amenities) ? explode(',', $prop->amenities) : []);
                return array_map('trim', $arr);
            })
            ->unique()->filter()->values();

        return response()->json([
            'status'  => 'success',
            'message' => 'Listings retrieved successfully',
            'data'    => [
                'properties'          => $properties,
                'current_page'        => $paginated->currentPage(),
                'last_page'           => $paginated->lastPage(),
                'per_page'            => $paginated->perPage(),
                'total'               => $paginated->total(),
                'filters'             => [
                    'search'        => $request->get('search', ''),
                    'min_price'     => $request->filled('min_price')
                        ? (float) $request->get('min_price')
                        : (float) ($priceRange->min_price ?? 0),
                    'max_price'     => $request->filled('max_price')
                        ? (float) $request->get('max_price')
                        : (float) ($priceRange->max_price ?? 1000),
                    'property_type' => $request->get('property_type', ''),
                    'guests'        => (int) $request->get('guests', 1),
                    'locations'     => $request->get('locations', []),
                    'amenities'     => $request->get('amenities', []),
                    'sort_by'       => $request->get('sort_by', 'featured'),
                ],
                'price_range'         => [
                    'min' => (float) ($priceRange->min_price ?? 0),
                    'max' => (float) ($priceRange->max_price ?? 1000),
                ],
                'property_types'      => $propertyTypes,
                'available_locations' => $availableLocations,
                'available_amenities' => $availableAmenities,
            ],
        ], 200);
    }
}

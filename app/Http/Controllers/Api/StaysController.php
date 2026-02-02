<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListingRequest;
use App\Http\Resources\ListingResource;
use App\Models\Property;
use App\Enums\PropertyStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

/**
 * @OA\Tag(
 *     name="Stays",
 *     description="API endpoints for property stays and search"
 * )
 */
class StaysController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/stays",
     *     summary="Search and filter properties",
     *     description="Returns filtered properties with support for search, location, price, guests, dates, and sorting",
     *     tags={"Stays"},
     *     security={{"apiAuth": {}}},
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search query (searches in title, location, description)",
     *         required=false,
     *         @OA\Schema(type="string", example="beachfront")
     *     ),
     *     @OA\Parameter(
     *         name="location",
     *         in="query",
     *         description="Single location filter",
     *         required=false,
     *         @OA\Schema(type="string", example="North America")
     *     ),
     *     @OA\Parameter(
     *         name="locations",
     *         in="query",
     *         description="Array of location filters (can be passed multiple times: ?locations=Europe&locations=Asia)",
     *         required=false,
     *         @OA\Schema(type="array", @OA\Items(type="string"), example={"North America", "South America"})
     *     ),
     *     @OA\Parameter(
     *         name="min_price",
     *         in="query",
     *         description="Minimum price filter",
     *         required=false,
     *         @OA\Schema(type="number", format="float", example=100)
     *     ),
     *     @OA\Parameter(
     *         name="max_price",
     *         in="query",
     *         description="Maximum price filter",
     *         required=false,
     *         @OA\Schema(type="number", format="float", example=500)
     *     ),
     *     @OA\Parameter(
     *         name="guests",
     *         in="query",
     *         description="Minimum number of guests",
     *         required=false,
     *         @OA\Schema(type="integer", minimum=1, example=2)
     *     ),
     *     @OA\Parameter(
     *         name="checkin",
     *         in="query",
     *         description="Check-in date (YYYY-MM-DD)",
     *         required=false,
     *         @OA\Schema(type="string", format="date", example="2026-01-15")
     *     ),
     *     @OA\Parameter(
     *         name="checkout",
     *         in="query",
     *         description="Check-out date (YYYY-MM-DD)",
     *         required=false,
     *         @OA\Schema(type="string", format="date", example="2026-01-20")
     *     ),
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         description="Sort order: featured, price_low, price_high, rating_high",
     *         required=false,
     *         @OA\Schema(type="string", enum={"featured", "price_low", "price_high", "rating_high"}, default="featured")
     *     ),
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number for pagination",
     *         required=false,
     *         @OA\Schema(type="integer", minimum=1, default=1)
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Items per page (max: 50)",
     *         required=false,
     *         @OA\Schema(type="integer", minimum=1, maximum=50, default=12)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Properties retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Properties retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="properties",
     *                     type="array",
     *                     @OA\Items(ref="#/components/schemas/Property")
     *                 ),
     *                 @OA\Property(property="current_page", type="integer", example=1),
     *                 @OA\Property(property="last_page", type="integer", example=5),
     *                 @OA\Property(property="per_page", type="integer", example=12),
     *                 @OA\Property(property="total", type="integer", example=50),
     *                 @OA\Property(property="from", type="integer", example=1),
     *                 @OA\Property(property="to", type="integer", example=12),
     *                 @OA\Property(
     *                     property="filters",
     *                     type="object",
     *                     @OA\Property(property="price_range", type="object",
     *                         @OA\Property(property="min", type="number", example=100),
     *                         @OA\Property(property="max", type="number", example=500)
     *                     ),
     *                     @OA\Property(
     *                         property="locations",
     *                         type="array",
     *                         @OA\Items(
     *                             type="object",
     *                             @OA\Property(property="name", type="string", example="North America"),
     *                             @OA\Property(property="count", type="integer", example=15)
     *                         )
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function index(ListingRequest $request): JsonResponse
    {
        $perPage = $request->input('per_page', 12);
        $query = Property::with(['reviews'])
            ->where('status', 'Active')
            ->where('approval_status', PropertyStatus::APPROVED);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('locations') && is_array($request->input('locations'))) {
            $locations = array_filter($request->input('locations'), fn($loc) => !empty($loc));
            
            if (!empty($locations)) {
                $query->where(function ($q) use ($locations) {
                    foreach ($locations as $location) {
                        $q->orWhere('location', 'like', "%{$location}%");
                    }
                });
            }
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->input('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->input('max_price'));
        }

        if ($request->filled('guests')) {
            $query->where('guests', '>=', $request->input('guests'));
        }

        $sortBy = $request->input('sort_by', 'featured');
        switch ($sortBy) {
            case 'price_low':
                $query->orderBy('price', 'asc');
                break;
            case 'price_high':
                $query->orderBy('price', 'desc');
                break;
            case 'rating_high':
                $query->orderByRaw('(
                    SELECT COALESCE(AVG(rating), 0)
                    FROM reviews
                    WHERE reviews.property_id = properties.id
                ) DESC');
                break;
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        $properties = $query->paginate($perPage);

        $priceRange = Property::where('status', 'Active')
            ->where('approval_status', PropertyStatus::APPROVED)
            ->selectRaw('MIN(price) as min_price, MAX(price) as max_price')
            ->first();

        return response()->json([
            'status' => 'success',
            'message' => 'Properties retrieved successfully',
            'data' => [
                'properties' => ListingResource::collection($properties->items()),
                'pagination' => [
                    'current_page' => $properties->currentPage(),
                    'last_page' => $properties->lastPage(),
                    'per_page' => $properties->perPage(),
                    'total' => $properties->total(),
                    'from' => $properties->firstItem(),
                    'to' => $properties->lastItem(),
                ],
                'filters' => [
                    'price_range' => [
                        'min' => (float) ($priceRange->min_price ?? 0),
                        'max' => (float) ($priceRange->max_price ?? 1000),
                    ],
                    'locations' => $this->getLocationGroups(),
                ],
            ],
        ], 200);
    }

    private function getLocationGroups(): array
    {
        $locations = Property::where('status', 'Active')
            ->where('approval_status', PropertyStatus::APPROVED)
            ->distinct()
            ->pluck('location')
            ->filter();

        $groups = [
            'North America' => 0,
            'South America' => 0,
            'Europe' => 0,
            'Africa' => 0,
            'Asia' => 0,
            'Australia' => 0,
            'Other' => 0,
        ];

        foreach ($locations as $location) {
            $lowerLocation = strtolower($location);
            
            if (str_contains($lowerLocation, 'north america') || 
                str_contains($lowerLocation, 'united states') || 
                str_contains($lowerLocation, 'canada') ||
                str_contains($lowerLocation, 'mexico') ||
                str_contains($lowerLocation, 'california') ||
                str_contains($lowerLocation, 'new york') ||
                str_contains($lowerLocation, 'texas') ||
                str_contains($lowerLocation, 'florida') ||
                str_contains($lowerLocation, 'illinois') ||
                str_contains($lowerLocation, 'nevada') ||
                str_contains($lowerLocation, 'colorado')) {
                $groups['North America']++;
            } elseif (str_contains($lowerLocation, 'south america') || 
                      str_contains($lowerLocation, 'brazil') ||
                      str_contains($lowerLocation, 'argentina') ||
                      str_contains($lowerLocation, 'chile')) {
                $groups['South America']++;
            } elseif (str_contains($lowerLocation, 'europe') || 
                      str_contains($lowerLocation, 'italy') ||
                      str_contains($lowerLocation, 'france') ||
                      str_contains($lowerLocation, 'spain') ||
                      str_contains($lowerLocation, 'germany') ||
                      str_contains($lowerLocation, 'uk') ||
                      str_contains($lowerLocation, 'united kingdom')) {
                $groups['Europe']++;
            } elseif (str_contains($lowerLocation, 'africa') || 
                      str_contains($lowerLocation, 'south africa') ||
                      str_contains($lowerLocation, 'egypt') ||
                      str_contains($lowerLocation, 'kenya')) {
                $groups['Africa']++;
            } elseif (str_contains($lowerLocation, 'asia') || 
                      str_contains($lowerLocation, 'china') ||
                      str_contains($lowerLocation, 'japan') ||
                      str_contains($lowerLocation, 'india') ||
                      str_contains($lowerLocation, 'indonesia') ||
                      str_contains($lowerLocation, 'bali') ||
                      str_contains($lowerLocation, 'thailand') ||
                      str_contains($lowerLocation, 'pakistan') ||
                      str_contains($lowerLocation, 'saudi arabia') ||
                      str_contains($lowerLocation, 'madinah') ||
                      str_contains($lowerLocation, 'makkah')) {
                $groups['Asia']++;
            } elseif (str_contains($lowerLocation, 'australia') || 
                      str_contains($lowerLocation, 'new zealand')) {
                $groups['Australia']++;
            } else {
                $groups['Other']++;
            }
        }

        $result = [];
        foreach ($groups as $name => $count) {
            if ($count > 0) {
                $result[] = ['name' => $name, 'count' => $count];
            }
        }

        return $result;
    }
}


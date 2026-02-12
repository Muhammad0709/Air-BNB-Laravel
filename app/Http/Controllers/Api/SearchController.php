<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SearchRequest;
use App\Http\Resources\ListingResource;
use App\Models\Property;
use App\Enums\PropertyStatus;
use Illuminate\Http\JsonResponse;

/**
 * @OA\Tag(
 *     name="Search",
 *     description="Property search (destination, dates, guests) – requires User auth"
 * )
 */
class SearchController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/search",
     *     summary="Search properties",
     *     description="Search properties by destination/location, check-in/check-out dates, guests. GET with query params. Requires Bearer token (User role). Same as Stays.",
     *     tags={"Search"},
     *     security={{"apiAuth": {}}},
     *     @OA\Parameter(name="location", in="query", required=false, @OA\Schema(type="string", example="California")),
     *     @OA\Parameter(name="checkin", in="query", required=false, @OA\Schema(type="string", format="date", example="2026-03-01")),
     *     @OA\Parameter(name="checkout", in="query", required=false, @OA\Schema(type="string", format="date", example="2026-03-07")),
     *     @OA\Parameter(name="adults", in="query", required=false, @OA\Schema(type="integer", example=2)),
     *     @OA\Parameter(name="children", in="query", required=false, @OA\Schema(type="integer", example=1)),
     *     @OA\Parameter(name="rooms", in="query", required=false, @OA\Schema(type="integer", example=1)),
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string", example="beachfront")),
     *     @OA\Parameter(name="min_price", in="query", required=false, @OA\Schema(type="number", example=100)),
     *     @OA\Parameter(name="max_price", in="query", required=false, @OA\Schema(type="number", example=500)),
     *     @OA\Parameter(name="sort_by", in="query", required=false, @OA\Schema(type="string", enum={"featured", "price_low", "price_high", "rating_high", "newest"}, example="featured")),
     *     @OA\Parameter(name="page", in="query", required=false, @OA\Schema(type="integer", example=1)),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", example=12)),
     *     @OA\Response(
     *         response=200,
     *         description="Search results",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Search results retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="properties",
     *                     type="array",
     *                     @OA\Items(ref="#/components/schemas/Property")
     *                 ),
     *                 @OA\Property(
     *                     property="pagination",
     *                     type="object",
     *                     @OA\Property(property="current_page", type="integer", example=1),
     *                     @OA\Property(property="last_page", type="integer", example=5),
     *                     @OA\Property(property="per_page", type="integer", example=12),
     *                     @OA\Property(property="total", type="integer", example=50),
     *                     @OA\Property(property="from", type="integer", example=1),
     *                     @OA\Property(property="to", type="integer", example=12)
     *                 ),
     *                 @OA\Property(property="checkin", type="string", nullable=true, example="2026-03-01"),
     *                 @OA\Property(property="checkout", type="string", nullable=true, example="2026-03-07"),
     *                 @OA\Property(property="nights", type="integer", nullable=true, example=6)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(@OA\Property(property="message", type="string", example="Unauthenticated."))
     *     ),
     *     @OA\Response(response=422, description="Validation error", @OA\JsonContent(
     *         @OA\Property(property="message", type="string"),
     *         @OA\Property(property="errors", type="object")
     *     ))
     * )
     */
    public function index(SearchRequest $request): JsonResponse
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

        if ($request->filled('location')) {
            $location = $request->input('location');
            $query->where('location', 'like', "%{$location}%");
        }

        if ($request->filled('locations') && is_array($request->input('locations'))) {
            $locations = array_filter($request->input('locations'), fn ($loc) => ! empty($loc));
            if (! empty($locations)) {
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

        $guests = $request->input('guests');
        if ($request->filled('adults') || $request->filled('children')) {
            $adults = (int) $request->input('adults', 0);
            $children = (int) $request->input('children', 0);
            $guests = max(1, $adults + $children);
        }
        if ($guests !== null && $guests >= 1) {
            $query->where('guests', '>=', $guests);
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
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        $properties = $query->paginate($perPage);

        $checkin = $request->input('checkin');
        $checkout = $request->input('checkout');
        $nights = null;
        if ($checkin && $checkout) {
            $start = new \DateTime($checkin);
            $end = new \DateTime($checkout);
            $nights = (int) $start->diff($end)->days;
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Search results retrieved successfully',
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
                'checkin' => $checkin,
                'checkout' => $checkout,
                'nights' => $nights,
            ],
        ], 200);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\HomeRequest;
use App\Http\Resources\PropertyResource;
use App\Models\Property;
use App\Enums\PropertyStatus;
use Illuminate\Http\JsonResponse;

/**
 * @OA\Tag(
 *     name="Home",
 *     description="API endpoints for home page data"
 * )
 */
class HomeController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/home",
     *     summary="Get home page data",
     *     description="Returns featured properties, popular stays, and favorites for the home page",
     *     tags={"Home"},
     *     security={{"apiAuth": {}}},
     *     @OA\Parameter(
     *         name="limit",
     *         in="query",
     *         description="Limit the number of properties returned per section (default: 10, max: 50)",
     *         required=false,
     *         @OA\Schema(type="integer", minimum=1, maximum=50, default=10)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Home page data retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Home data retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="hotels",
     *                     type="array",
     *                     description="Featured hotels/properties",
     *                     @OA\Items(
     *                         @OA\Property(property="id", type="integer", example=1),
     *                         @OA\Property(property="title", type="string", example="Luxury Beachfront Villa"),
     *                         @OA\Property(property="location", type="string", example="Malibu, California"),
     *                         @OA\Property(property="price", type="number", format="float", example=299.00),
     *                         @OA\Property(property="rating", type="number", format="float", example=4.93),
     *                         @OA\Property(property="reviews", type="integer", example=123),
     *                         @OA\Property(property="image", type="string", format="uri", example="http://localhost:8000/storage/properties/image.jpg"),
     *                         @OA\Property(property="isGuestFavorite", type="boolean", example=true)
     *                     )
     *                 ),
     *                 @OA\Property(
     *                     property="popular",
     *                     type="array",
     *                     description="Popular stays based on ratings and reviews",
     *                     @OA\Items(
     *                         @OA\Property(property="id", type="integer", example=1),
     *                         @OA\Property(property="title", type="string", example="Luxury Beachfront Villa"),
     *                         @OA\Property(property="location", type="string", example="Malibu, California"),
     *                         @OA\Property(property="price", type="number", format="float", example=299.00),
     *                         @OA\Property(property="rating", type="number", format="float", example=4.93),
     *                         @OA\Property(property="reviews", type="integer", example=123),
     *                         @OA\Property(property="image", type="string", format="uri", example="http://localhost:8000/storage/properties/image.jpg"),
     *                         @OA\Property(property="isGuestFavorite", type="boolean", example=true)
     *                     )
     *                 ),
     *                 @OA\Property(
     *                     property="favorites",
     *                     type="array",
     *                     description="Guest favorite properties",
     *                     @OA\Items(
     *                         @OA\Property(property="id", type="integer", example=1),
     *                         @OA\Property(property="title", type="string", example="Luxury Beachfront Villa"),
     *                         @OA\Property(property="location", type="string", example="Malibu, California"),
     *                         @OA\Property(property="price", type="number", format="float", example=299.00),
     *                         @OA\Property(property="rating", type="number", format="float", example=4.93),
     *                         @OA\Property(property="reviews", type="integer", example=123),
     *                         @OA\Property(property="image", type="string", format="uri", example="http://localhost:8000/storage/properties/image.jpg"),
     *                         @OA\Property(property="isGuestFavorite", type="boolean", example=true)
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
     *     )
     * )
     */
    public function index(HomeRequest $request): JsonResponse
    {
        $limit = $request->input('limit', 10);
        $baseQuery = Property::with(['reviews'])
            ->where('status', 'Active')
            ->where('approval_status', PropertyStatus::APPROVED);

        $hotels = (clone $baseQuery)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        $popular = (clone $baseQuery)
            ->get()
            ->map(function ($property) {
                $rating = $property->reviews->avg('rating') ?? 0;
                $reviewCount = $property->reviews->count();
                $property->popularity_score = ($rating / 5) * 0.7 + min($reviewCount / 100, 1) * 0.3;
                return $property;
            })
            ->sortByDesc('popularity_score')
            ->take($limit)
            ->values();

        $favorites = (clone $baseQuery)
            ->where('is_guest_favorite', true)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Home data retrieved successfully',
            'data' => [
                'hotels' => PropertyResource::collection($hotels),
                'popular' => PropertyResource::collection($popular),
                'favorites' => PropertyResource::collection($favorites),
            ],
        ], 200);
    }
}

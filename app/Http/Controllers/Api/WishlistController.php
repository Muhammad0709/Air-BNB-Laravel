<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\WishlistRequest;
use App\Http\Resources\PropertyResource;
use App\Models\Property;
use App\Enums\PropertyStatus;
use Illuminate\Http\JsonResponse;

/**
 * @OA\Tag(
 *     name="Wishlist",
 *     description="API endpoints for wishlist/favorite properties"
 * )
 */
class WishlistController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/wishlist",
     *     summary="Get wishlist properties",
     *     description="Returns guest favorite properties for the wishlist page",
     *     tags={"Wishlist"},
     *     security={{"apiAuth": {}}},
     *     @OA\Parameter(
     *         name="limit",
     *         in="query",
     *         description="Limit the number of properties returned (default: 10, max: 50)",
     *         required=false,
     *         @OA\Schema(type="integer", minimum=1, maximum=50, default=10)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Wishlist properties retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Wishlist properties retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="properties",
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
    public function index(WishlistRequest $request): JsonResponse
    {
        $limit = $request->input('limit', 10);
        
        $properties = Property::with(['reviews'])
            ->where('status', 'Active')
            ->where('approval_status', PropertyStatus::APPROVED)
            ->where('is_guest_favorite', true)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Wishlist properties retrieved successfully',
            'data' => [
                'properties' => PropertyResource::collection($properties),
            ],
        ], 200);
    }
}

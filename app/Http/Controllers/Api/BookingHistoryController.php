<?php

namespace App\Http\Controllers\Api;

use App\Enums\BookingStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\BookingHistoryRequest;
use App\Http\Resources\BookingHistoryResource;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

/**
 * @OA\Tag(
 *     name="Booking History",
 *     description="API endpoints for user booking history"
 * )
 */
class BookingHistoryController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/bookings",
     *     summary="Get user booking history",
     *     description="Returns all bookings for the authenticated user with filtering options",
     *     tags={"Booking History"},
     *     security={{"apiAuth": {}}},
     *     @OA\Parameter(
     *         name="type",
     *         in="query",
     *         description="Filter by booking type: upcoming, past, or all (default: all)",
     *         required=false,
     *         @OA\Schema(type="string", enum={"upcoming", "past", "all"}, default="all")
     *     ),
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search bookings by property name, location, or status",
     *         required=false,
     *         @OA\Schema(type="string", example="villa")
     *     ),
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Filter by booking status: pending, confirmed, cancelled, completed",
     *         required=false,
     *         @OA\Schema(type="string", enum={"pending", "confirmed", "cancelled", "completed"})
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Bookings retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Bookings retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="upcoming",
     *                     type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="id", type="integer", example=1),
     *                         @OA\Property(property="property", type="string", example="Luxury Beachfront Villa"),
     *                         @OA\Property(property="propertyLocation", type="string", example="Malibu, California"),
     *                         @OA\Property(property="image", type="string", format="uri", example="http://localhost:8000/storage/properties/image.jpg"),
     *                         @OA\Property(property="checkin", type="string", format="date", example="2025-04-01"),
     *                         @OA\Property(property="checkout", type="string", format="date", example="2025-04-07"),
     *                         @OA\Property(property="status", type="string", example="pending"),
     *                         @OA\Property(property="amount", type="string", example="$1,299"),
     *                         @OA\Property(property="nights", type="integer", example=6),
     *                         @OA\Property(property="guests", type="integer", example=2)
     *                     )
     *                 ),
     *                 @OA\Property(
     *                     property="past",
     *                     type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="id", type="integer", example=2),
     *                         @OA\Property(property="property", type="string", example="Modern Apartment"),
     *                         @OA\Property(property="propertyLocation", type="string", example="Los Angeles, California"),
     *                         @OA\Property(property="image", type="string", format="uri"),
     *                         @OA\Property(property="checkin", type="string", format="date"),
     *                         @OA\Property(property="checkout", type="string", format="date"),
     *                         @OA\Property(property="status", type="string", example="completed"),
     *                         @OA\Property(property="amount", type="string", example="$899"),
     *                         @OA\Property(property="nights", type="integer", example=4),
     *                         @OA\Property(property="guests", type="integer", example=3)
     *                     )
     *                 ),
     *                 @OA\Property(property="upcoming_count", type="integer", example=1),
     *                 @OA\Property(property="past_count", type="integer", example=5)
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
    public function index(BookingHistoryRequest $request): JsonResponse
    {
        $user = Auth::user();
        $type = $request->input('type', 'all');
        $search = $request->input('search');
        $statusFilter = $request->input('status');

        // Base query - get all bookings for authenticated user with property
        $baseQuery = Booking::with(['property'])
            ->where('user_id', $user->id);

        // Apply status filter if provided
        if ($statusFilter) {
            $baseQuery->where('status', $statusFilter);
        }

        // Apply search filter if provided
        if ($search) {
            $baseQuery->whereHas('property', function ($query) use ($search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            })->orWhere('status', 'like', "%{$search}%");
        }

        $allBookings = $baseQuery->get();

        // Separate upcoming and past by status only (not check-in/check-out dates)
        $upcomingStatuses = BookingStatus::upcoming();
        $pastStatuses = BookingStatus::past();
        $upcomingBookings = $allBookings->filter(fn ($b) => in_array($b->status->value, $upcomingStatuses, true));
        $pastBookings = $allBookings->filter(fn ($b) => in_array($b->status->value, $pastStatuses, true));

        // Apply type filter
        if ($type === 'upcoming') {
            $bookings = $upcomingBookings;
        } elseif ($type === 'past') {
            $bookings = $pastBookings;
        } else {
            $bookings = $allBookings;
        }

        // If type filter is applied, return only that type
        if ($type === 'upcoming') {
            return response()->json([
                'status' => 'success',
                'message' => 'Bookings retrieved successfully',
                'data' => [
                    'upcoming' => BookingHistoryResource::collection($upcomingBookings),
                    'upcoming_count' => $upcomingBookings->count(),
                    'past_count' => $pastBookings->count(),
                ],
            ], 200);
        } elseif ($type === 'past') {
            return response()->json([
                'status' => 'success',
                'message' => 'Bookings retrieved successfully',
                'data' => [
                    'past' => BookingHistoryResource::collection($pastBookings),
                    'upcoming_count' => $upcomingBookings->count(),
                    'past_count' => $pastBookings->count(),
                ],
            ], 200);
        }

        // Return both if type is 'all' or not specified
        return response()->json([
            'status' => 'success',
            'message' => 'Bookings retrieved successfully',
            'data' => [
                'upcoming' => BookingHistoryResource::collection($upcomingBookings),
                'past' => BookingHistoryResource::collection($pastBookings),
                'upcoming_count' => $upcomingBookings->count(),
                'past_count' => $pastBookings->count(),
            ],
        ], 200);
    }
}


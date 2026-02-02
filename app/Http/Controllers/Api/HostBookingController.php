<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\HostBookingRequest;
use App\Http\Resources\HostBookingResource;
use App\Models\Booking;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

/**
 * @OA\Tag(
 *     name="Host Bookings",
 *     description="API endpoints for host booking management"
 * )
 */
class HostBookingController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/host/bookings",
     *     summary="Get host bookings",
     *     description="Returns a paginated list of bookings for properties owned by the authenticated host",
     *     tags={"Host Bookings"},
     *     security={{"apiAuth": {}}},
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search query (searches in guest name, email, property title)",
     *         required=false,
     *         @OA\Schema(type="string", example="john")
     *     ),
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Filter by booking status",
     *         required=false,
     *         @OA\Schema(type="string", enum={"pending", "confirmed", "cancelled", "completed"})
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
     *         @OA\Schema(type="integer", minimum=1, maximum=50, default=10)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Bookings retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Host bookings retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="bookings",
     *                     type="array",
     *                     @OA\Items(ref="#/components/schemas/HostBooking")
     *                 ),
     *                 @OA\Property(property="current_page", type="integer", example=1),
     *                 @OA\Property(property="last_page", type="integer", example=5),
     *                 @OA\Property(property="per_page", type="integer", example=10),
     *                 @OA\Property(property="total", type="integer", example=50)
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
     *         response=403,
     *         description="Access denied - Host only",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Access denied. This resource is only available for Host accounts.")
     *         )
     *     )
     * )
     */
    public function index(HostBookingRequest $request): JsonResponse
    {
        $host = Auth::user();
        $perPage = $request->input('per_page', 10);
        
        $propertyIds = Property::where('user_id', $host->id)->pluck('id');
        
        $query = Booking::with('property')
            ->whereIn('property_id', $propertyIds);
        
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('property', function ($propertyQuery) use ($search) {
                      $propertyQuery->where('title', 'like', "%{$search}%");
                  });
            });
        }
        
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }
        
        $bookings = $query->latest()->paginate($perPage);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Host bookings retrieved successfully',
            'data' => [
                'bookings' => HostBookingResource::collection($bookings->items()),
                'current_page' => $bookings->currentPage(),
                'last_page' => $bookings->lastPage(),
                'per_page' => $bookings->perPage(),
                'total' => $bookings->total(),
            ],
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/host/bookings",
     *     summary="Create a new booking",
     *     description="Creates a new booking for a property owned by the authenticated host",
     *     tags={"Host Bookings"},
     *     security={{"apiAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"property_id", "guest", "email", "phone", "checkin", "checkout", "amount"},
     *             @OA\Property(property="property_id", type="integer", example=1),
     *             @OA\Property(property="guest", type="string", example="John Doe"),
     *             @OA\Property(property="email", type="string", format="email", example="john.doe@example.com"),
     *             @OA\Property(property="phone", type="string", example="+1 (555) 123-4567"),
     *             @OA\Property(property="checkin", type="string", format="date", example="2025-01-15"),
     *             @OA\Property(property="checkout", type="string", format="date", example="2025-01-20"),
     *             @OA\Property(property="amount", type="number", format="float", example=1495.00),
     *             @OA\Property(property="status", type="string", enum={"Pending", "Confirmed", "Cancelled"}, example="Pending")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Booking created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Booking created successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/HostBooking")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Access denied",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Access denied. This property does not belong to you.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Property not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Property not found")
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
    public function store(HostBookingRequest $request): JsonResponse
    {
        $host = Auth::user();
        
        $property = Property::where('id', $request->input('property_id'))
            ->where('user_id', $host->id)
            ->first();
        
        if (!$property) {
            return response()->json([
                'status' => 'error',
                'message' => 'Property not found or does not belong to you',
            ], 404);
        }
        
        $checkin = Carbon::parse($request->input('checkin'));
        $checkout = Carbon::parse($request->input('checkout'));
        $nights = $checkin->diffInDays($checkout);
        
        $totalAmount = (float) $request->input('amount');
        $nightlyRate = $property->price;
        $subtotal = $nightlyRate * $nights;
        $cleaningFee = 25.00;
        $serviceFee = round($subtotal * 0.12, 2);
        
        $phone = $request->input('phone');
        $phoneCode = '+1';
        $phoneNumber = $phone;
        
        if (preg_match('/^(\+\d{1,3})\s*(.+)$/', $phone, $matches)) {
            $phoneCode = $matches[1];
            $phoneNumber = $matches[2];
        }
        
        $guestUser = User::where('email', $request->input('email'))->first();
        if (!$guestUser) {
            $guestUser = User::create([
                'name' => $request->input('guest'),
                'email' => $request->input('email'),
                'password' => bcrypt(uniqid()),
                'type' => \App\Enums\UserType::USER,
            ]);
        }
        
        $status = strtolower($request->input('status', 'Pending'));
        
        $booking = Booking::create([
            'property_id' => $property->id,
            'user_id' => $guestUser->id,
            'name' => $request->input('guest'),
            'email' => $request->input('email'),
            'phone_code' => $phoneCode,
            'phone' => $phoneNumber,
            'check_in_date' => $checkin,
            'check_out_date' => $checkout,
            'nights' => $nights,
            'nightly_rate' => $nightlyRate,
            'cleaning_fee' => $cleaningFee,
            'service_fee' => $serviceFee,
            'total_amount' => $totalAmount,
            'status' => $status,
            'rooms' => 1,
            'adults' => 1,
            'children' => 0,
        ]);
        
        $booking->load('property');
        
        return response()->json([
            'status' => 'success',
            'message' => 'Booking created successfully',
            'data' => new HostBookingResource($booking),
        ], 201);
    }

    /**
     * @OA\Get(
     *     path="/api/host/bookings/{id}",
     *     summary="Get a specific booking",
     *     description="Returns details of a specific booking for a property owned by the authenticated host",
     *     tags={"Host Bookings"},
     *     security={{"apiAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Booking ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Booking retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Booking retrieved successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/HostBooking")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Access denied",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Access denied. This booking does not belong to your properties.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Booking not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Booking not found")
     *         )
     *     )
     * )
     */
    public function show($id): JsonResponse
    {
        $host = Auth::user();
        
        $propertyIds = Property::where('user_id', $host->id)->pluck('id');
        
        $booking = Booking::with('property')
            ->where('id', $id)
            ->whereIn('property_id', $propertyIds)
            ->first();
        
        if (!$booking) {
            return response()->json([
                'status' => 'error',
                'message' => 'Booking not found',
            ], 404);
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Booking retrieved successfully',
            'data' => new HostBookingResource($booking),
        ], 200);
    }

    /**
     * @OA\Put(
     *     path="/api/host/bookings/{id}",
     *     summary="Update a booking",
     *     description="Updates an existing booking for a property owned by the authenticated host",
     *     tags={"Host Bookings"},
     *     security={{"apiAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Booking ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="property_id", type="integer", example=1),
     *             @OA\Property(property="guest", type="string", example="John Doe"),
     *             @OA\Property(property="email", type="string", format="email", example="john.doe@example.com"),
     *             @OA\Property(property="phone", type="string", example="+1 (555) 123-4567"),
     *             @OA\Property(property="checkin", type="string", format="date", example="2025-01-15"),
     *             @OA\Property(property="checkout", type="string", format="date", example="2025-01-20"),
     *             @OA\Property(property="amount", type="number", format="float", example=1495.00),
     *             @OA\Property(property="status", type="string", enum={"Pending", "Confirmed", "Cancelled"}, example="Confirmed")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Booking updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Booking updated successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/HostBooking")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Access denied",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Access denied. This booking does not belong to your properties.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Booking not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Booking not found")
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
    public function update(HostBookingRequest $request, $id): JsonResponse
    {
        $host = Auth::user();
        
        $propertyIds = Property::where('user_id', $host->id)->pluck('id');
        
        $booking = Booking::with('property')
            ->where('id', $id)
            ->whereIn('property_id', $propertyIds)
            ->first();
        
        if (!$booking) {
            return response()->json([
                'status' => 'error',
                'message' => 'Booking not found',
            ], 404);
        }
        
        $data = [];
        
        if ($request->filled('property_id')) {
            $property = Property::where('id', $request->input('property_id'))
                ->where('user_id', $host->id)
                ->first();
            
            if (!$property) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Property not found or does not belong to you',
                ], 404);
            }
            $data['property_id'] = $property->id;
        }
        
        if ($request->filled('guest')) {
            $data['name'] = $request->input('guest');
        }
        
        if ($request->filled('email')) {
            $data['email'] = $request->input('email');
        }
        
        if ($request->filled('phone')) {
            $phone = $request->input('phone');
            $phoneCode = '+1';
            $phoneNumber = $phone;
            
            if (preg_match('/^(\+\d{1,3})\s*(.+)$/', $phone, $matches)) {
                $phoneCode = $matches[1];
                $phoneNumber = $matches[2];
            }
            
            $data['phone_code'] = $phoneCode;
            $data['phone'] = $phoneNumber;
        }
        
        if ($request->filled('checkin')) {
            $data['check_in_date'] = Carbon::parse($request->input('checkin'));
        }
        
        if ($request->filled('checkout')) {
            $data['check_out_date'] = Carbon::parse($request->input('checkout'));
        }
        
        if ($request->filled('checkin') || $request->filled('checkout')) {
            $checkin = $data['check_in_date'] ?? $booking->check_in_date;
            $checkout = $data['check_out_date'] ?? $booking->check_out_date;
            $data['nights'] = Carbon::parse($checkin)->diffInDays(Carbon::parse($checkout));
        }
        
        if ($request->filled('amount')) {
            $data['total_amount'] = (float) $request->input('amount');
        }
        
        if ($request->filled('status')) {
            $data['status'] = strtolower($request->input('status'));
        }
        
        $booking->update($data);
        $booking->load('property');
        
        return response()->json([
            'status' => 'success',
            'message' => 'Booking updated successfully',
            'data' => new HostBookingResource($booking),
        ], 200);
    }

    /**
     * @OA\Delete(
     *     path="/api/host/bookings/{id}",
     *     summary="Delete a booking",
     *     description="Deletes a booking for a property owned by the authenticated host",
     *     tags={"Host Bookings"},
     *     security={{"apiAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Booking ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Booking deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Booking deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Access denied",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Access denied. This booking does not belong to your properties.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Booking not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Booking not found")
     *         )
     *     )
     * )
     */
    public function destroy($id): JsonResponse
    {
        $host = Auth::user();
        
        $propertyIds = Property::where('user_id', $host->id)->pluck('id');
        
        $booking = Booking::where('id', $id)
            ->whereIn('property_id', $propertyIds)
            ->first();
        
        if (!$booking) {
            return response()->json([
                'status' => 'error',
                'message' => 'Booking not found',
            ], 404);
        }
        
        $booking->delete();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Booking deleted successfully',
        ], 200);
    }
}

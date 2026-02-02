<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BookingRequest;
use App\Http\Resources\PropertyResource;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Models\Property;
use App\Enums\PropertyStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

/**
 * @OA\Tag(
 *     name="Booking",
 *     description="API endpoints for booking properties"
 * )
 */
class BookingController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/booking/{property_id}",
     *     summary="Get property details for booking",
     *     description="Returns property details and booking summary information",
     *     tags={"Booking"},
     *     security={{"apiAuth": {}}},
     *     @OA\Parameter(
     *         name="property_id",
     *         in="path",
     *         description="Property ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Parameter(
     *         name="check_in",
     *         in="query",
     *         description="Check-in date (YYYY-MM-DD)",
     *         required=false,
     *         @OA\Schema(type="string", format="date", example="2026-01-15")
     *     ),
     *     @OA\Parameter(
     *         name="check_out",
     *         in="query",
     *         description="Check-out date (YYYY-MM-DD)",
     *         required=false,
     *         @OA\Schema(type="string", format="date", example="2026-01-22")
     *     ),
     *     @OA\Parameter(
     *         name="nights",
     *         in="query",
     *         description="Number of nights",
     *         required=false,
     *         @OA\Schema(type="integer", example=7)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Property booking details retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Property details retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="property",
     *                     type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="title", type="string", example="Luxury Beachfront Villa"),
     *                     @OA\Property(property="location", type="string", example="Malibu, California"),
     *                     @OA\Property(property="price", type="number", format="float", example=299.00),
     *                     @OA\Property(property="rating", type="number", format="float", example=4.93),
     *                     @OA\Property(property="reviews", type="integer", example=123),
     *                     @OA\Property(property="image", type="string", format="uri", example="http://localhost:8000/storage/properties/image.jpg"),
     *                     @OA\Property(property="isGuestFavorite", type="boolean", example=true)
     *                 ),
     *                 @OA\Property(
     *                     property="booking_summary",
     *                     type="object",
     *                     @OA\Property(property="nightly_rate", type="number", format="float", example=87.00),
     *                     @OA\Property(property="nights", type="integer", example=7),
     *                     @OA\Property(property="subtotal", type="number", format="float", example=609.00),
     *                     @OA\Property(property="cleaning_fee", type="number", format="float", example=25.00),
     *                     @OA\Property(property="service_fee", type="number", format="float", example=71.00),
     *                     @OA\Property(property="total_amount", type="number", format="float", example=705.00)
     *                 ),
     *                 @OA\Property(
     *                     property="rules",
     *                     type="array",
     *                     @OA\Items(type="string", example="Check-in: 3:00 PM - 10:00 PM")
     *                 )
     *             )
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
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated.")
     *         )
     *     )
     * )
     */
    public function show($propertyId): JsonResponse
    {
        $property = Property::with(['reviews', 'user'])
            ->where('id', $propertyId)
            ->where('status', 'Active')
            ->where('approval_status', PropertyStatus::APPROVED)
            ->first();

        if (!$property) {
            return response()->json([
                'status' => 'error',
                'message' => 'Property not found',
            ], 404);
        }

        $nights = request()->input('nights', 7);
        $nightlyRate = (float) $property->price;
        $subtotal = $nightlyRate * $nights;
        $cleaningFee = 25.00; // Can be configured per property later
        $serviceFee = round($subtotal * 0.12, 2); // 12% service fee
        $totalAmount = $subtotal + $cleaningFee + $serviceFee;

        // Default rules - can be moved to property settings later
        $rules = [
            'Check-in: 3:00 PM - 10:00 PM',
            'Check-out: 11:00 AM',
            'No parties or events allowed',
            'Pets allowed (with prior notification)',
            'No smoking indoors',
        ];

        return response()->json([
            'status' => 'success',
            'message' => 'Property details retrieved successfully',
            'data' => [
                'property' => new PropertyResource($property),
                'booking_summary' => [
                    'nightly_rate' => $nightlyRate,
                    'nights' => $nights,
                    'subtotal' => round($subtotal, 2),
                    'cleaning_fee' => $cleaningFee,
                    'service_fee' => $serviceFee,
                    'total_amount' => round($totalAmount, 2),
                ],
                'rules' => $rules,
            ],
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/booking",
     *     summary="Create a new booking",
     *     description="Creates a new booking for a property",
     *     tags={"Booking"},
     *     security={{"apiAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"property_id", "name", "email", "phone", "rooms", "adults", "children", "nights"},
     *             @OA\Property(property="property_id", type="integer", example=1),
     *             @OA\Property(property="name", type="string", example="John Doe"),
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com"),
     *             @OA\Property(property="phone_code", type="string", example="+31"),
     *             @OA\Property(property="phone", type="string", example="1234567890"),
     *             @OA\Property(property="rooms", type="integer", example=1),
     *             @OA\Property(property="adults", type="integer", example=2),
     *             @OA\Property(property="children", type="integer", example=1),
     *             @OA\Property(property="nights", type="integer", example=7),
     *             @OA\Property(property="check_in_date", type="string", format="date", example="2026-01-15"),
     *             @OA\Property(property="check_out_date", type="string", format="date", example="2026-01-22"),
     *             @OA\Property(property="payment_method", type="string", example="credit_card"),
     *             @OA\Property(property="card_last_four", type="string", example="1234")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Booking created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Booking created successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="booking",
     *                     type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="property_id", type="integer", example=1),
     *                     @OA\Property(property="name", type="string", example="John Doe"),
     *                     @OA\Property(property="email", type="string", example="john@example.com"),
     *                     @OA\Property(property="status", type="string", example="pending"),
     *                     @OA\Property(property="total_amount", type="number", format="float", example=705.00),
     *                     @OA\Property(property="created_at", type="string", format="date-time")
     *                 )
     *             )
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
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(
     *                 property="errors",
     *                 type="object"
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
    public function store(BookingRequest $request): JsonResponse
    {
        $user = Auth::user();
        $propertyId = $request->input('property_id');

        $property = Property::where('id', $propertyId)
            ->where('status', 'Active')
            ->where('approval_status', PropertyStatus::APPROVED)
            ->first();

        if (!$property) {
            return response()->json([
                'status' => 'error',
                'message' => 'Property not found',
            ], 404);
        }

        $nights = $request->input('nights', 1);
        $nightlyRate = (float) $property->price;
        $subtotal = $nightlyRate * $nights;
        $cleaningFee = 25.00;
        $serviceFee = round($subtotal * 0.12, 2);
        $totalAmount = $subtotal + $cleaningFee + $serviceFee;

        $booking = Booking::create([
            'property_id' => $propertyId,
            'user_id' => $user->id,
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'phone_code' => $request->input('phone_code', '+31'),
            'phone' => $request->input('phone'),
            'rooms' => $request->input('rooms', 1),
            'adults' => $request->input('adults', 1),
            'children' => $request->input('children', 0),
            'check_in_date' => $request->input('check_in_date'),
            'check_out_date' => $request->input('check_out_date'),
            'nights' => $nights,
            'nightly_rate' => $nightlyRate,
            'cleaning_fee' => $cleaningFee,
            'service_fee' => $serviceFee,
            'total_amount' => $totalAmount,
            'status' => 'pending',
            'payment_method' => $request->input('payment_method', 'credit_card'),
            'card_last_four' => $request->input('card_last_four'),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Booking created successfully',
            'data' => [
                'booking' => new BookingResource($booking),
            ],
        ], 201);
    }
}


<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\Property;
use App\Models\PropertyBlockedDate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * @OA\Tag(
 *     name="Host Availability",
 *     description="API endpoints for managing property blocked dates"
 * )
 */
class HostAvailabilityController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/host/properties/{property}/blocked-dates",
     *     summary="Block a date range for a property",
     *     description="Creates a blocked-date range on the host's property. Validates against existing confirmed/pending bookings and existing blocks.",
     *     tags={"Host Availability"},
     *     security={{"apiAuth": {}}},
     *     @OA\Parameter(name="property", in="path", required=true, description="Property ID", @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"start_date","end_date"},
     *             @OA\Property(property="start_date", type="string", format="date", example="2026-09-01"),
     *             @OA\Property(property="end_date", type="string", format="date", example="2026-09-07"),
     *             @OA\Property(property="reason", type="string", nullable=true, example="Maintenance")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Dates blocked successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Dates blocked successfully."),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="blocked_date", type="object",
     *                     @OA\Property(property="id", type="integer"),
     *                     @OA\Property(property="property_id", type="integer"),
     *                     @OA\Property(property="start_date", type="string"),
     *                     @OA\Property(property="end_date", type="string"),
     *                     @OA\Property(property="reason", type="string", nullable=true)
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=404, description="Property not found"),
     *     @OA\Response(response=422, description="Validation error / overlap conflict")
     * )
     */
    public function store(Request $request, $propertyId): JsonResponse
    {
        $property = Property::find($propertyId);

        if (! $property) {
            return response()->json(['status' => 'error', 'message' => 'Property not found.'], 404);
        }

        if ($property->user_id !== Auth::id()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date'   => ['required', 'date', 'after_or_equal:start_date'],
            'reason'     => ['nullable', 'string', 'max:255'],
        ]);

        $startDate = $validated['start_date'];
        $endDate   = $validated['end_date'];

        // Overlaps with a confirmed/pending booking?
        $overlapsBooking = Booking::where('property_id', $property->id)
            ->whereIn('status', [BookingStatus::PENDING->value, BookingStatus::CONFIRMED->value])
            ->whereDate('check_in_date', '<=', $endDate)
            ->whereDate('check_out_date', '>', $startDate)
            ->exists();

        if ($overlapsBooking) {
            return response()->json([
                'status'  => 'error',
                'message' => 'The selected dates overlap with an existing confirmed or pending booking.',
            ], 422);
        }

        // Overlaps with an existing block?
        $overlapsBlock = PropertyBlockedDate::where('property_id', $property->id)
            ->whereDate('start_date', '<=', $endDate)
            ->whereDate('end_date', '>=', $startDate)
            ->exists();

        if ($overlapsBlock) {
            return response()->json([
                'status'  => 'error',
                'message' => 'The selected dates overlap with an existing blocked period.',
            ], 422);
        }

        $blockedDate = $property->blockedDates()->create($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Dates blocked successfully.',
            'data'    => [
                'blocked_date' => [
                    'id'          => $blockedDate->id,
                    'property_id' => $blockedDate->property_id,
                    'start_date'  => $blockedDate->start_date,
                    'end_date'    => $blockedDate->end_date,
                    'reason'      => $blockedDate->reason,
                ],
            ],
        ], 201);
    }

    /**
     * @OA\Delete(
     *     path="/api/host/properties/{property}/blocked-dates/{blockedDate}",
     *     summary="Unblock a date range",
     *     description="Removes a previously blocked date range from the host's property.",
     *     tags={"Host Availability"},
     *     security={{"apiAuth": {}}},
     *     @OA\Parameter(name="property", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="blockedDate", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Dates unblocked successfully"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=404, description="Not found")
     * )
     */
    public function destroy($propertyId, $blockedDateId): JsonResponse
    {
        $property = Property::find($propertyId);

        if (! $property) {
            return response()->json(['status' => 'error', 'message' => 'Property not found.'], 404);
        }

        if ($property->user_id !== Auth::id()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized.'], 403);
        }

        $blockedDate = PropertyBlockedDate::where('id', $blockedDateId)
            ->where('property_id', $property->id)
            ->first();

        if (! $blockedDate) {
            return response()->json(['status' => 'error', 'message' => 'Blocked date not found.'], 404);
        }

        $blockedDate->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Dates unblocked successfully.',
        ], 200);
    }
}

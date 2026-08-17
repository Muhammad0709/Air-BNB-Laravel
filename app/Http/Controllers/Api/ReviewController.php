<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Enums\BookingStatus;
use App\Models\AuditLog;
use App\Models\Booking;
use App\Models\Review;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * @OA\Tag(
 *     name="Reviews",
 *     description="API endpoints for property reviews"
 * )
 */
class ReviewController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/reviews",
     *     summary="Submit a property review",
     *     description="Authenticated user submits a review for a property they have completed a stay at. One review per property per user.",
     *     tags={"Reviews"},
     *     security={{"apiAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"property_id","rating"},
     *             @OA\Property(property="property_id", type="integer", example=1),
     *             @OA\Property(property="rating", type="integer", minimum=1, maximum=5, example=5),
     *             @OA\Property(property="comment", type="string", nullable=true, example="Amazing place!")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Review submitted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Review submitted successfully"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="review", type="object",
     *                     @OA\Property(property="id", type="integer"),
     *                     @OA\Property(property="property_id", type="integer"),
     *                     @OA\Property(property="user_id", type="integer"),
     *                     @OA\Property(property="rating", type="integer"),
     *                     @OA\Property(property="comment", type="string"),
     *                     @OA\Property(property="created_at", type="string")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=403, description="Not eligible to review"),
     *     @OA\Response(response=404, description="Property not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'property_id' => 'required|exists:properties,id',
            'rating'      => 'required|integer|min:1|max:5',
            'comment'     => 'nullable|string|max:5000',
        ]);

        $property = Property::where('id', $request->property_id)
            ->where('status', 'Active')
            ->where('approval_status', 'Approved')
            ->first();

        if (! $property) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Property not found or not available for reviews.',
            ], 404);
        }

        // Must have completed a stay
        $hasCompletedStay = Booking::where('property_id', $request->property_id)
            ->where('user_id', Auth::id())
            ->where('status', BookingStatus::COMPLETED->value)
            ->exists();

        if (! $hasCompletedStay) {
            return response()->json([
                'status'  => 'error',
                'message' => 'You can only review a property after completing a stay there.',
            ], 403);
        }

        // One review per property per user
        $existingReview = Review::where('property_id', $request->property_id)
            ->where('user_id', Auth::id())
            ->first();

        if ($existingReview) {
            return response()->json([
                'status'  => 'error',
                'message' => 'You have already reviewed this property.',
            ], 403);
        }

        $review = Review::create([
            'property_id' => $request->property_id,
            'user_id'     => Auth::id(),
            'rating'      => $request->rating,
            'comment'     => $request->comment,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Review submitted successfully',
            'data'    => [
                'review' => [
                    'id'          => $review->id,
                    'property_id' => $review->property_id,
                    'user_id'     => $review->user_id,
                    'rating'      => $review->rating,
                    'comment'     => $review->comment,
                    'created_at'  => $review->created_at->toISOString(),
                ],
            ],
        ], 201);
    }

    /**
     * @OA\Delete(
     *     path="/api/reviews/{id}",
     *     summary="Delete a review (Admin only)",
     *     description="Admin can delete any review. Logs the action to the audit trail.",
     *     tags={"Reviews"},
     *     security={{"apiAuth": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Review deleted successfully"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=404, description="Review not found")
     * )
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        // Admin-only action
        $user = Auth::user();
        if (! in_array($user->type->value, ['admin', 'moderator'])) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Forbidden. Admin privileges required.',
            ], 403);
        }

        $review = Review::find($id);

        if (! $review) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Review not found.',
            ], 404);
        }

        $propertyTitle = $review->property?->title ?? "Property #{$review->property_id}";
        $comment       = $review->comment;

        $review->delete();

        AuditLog::record($user, 'review_deleted', $propertyTitle, $comment);

        return response()->json([
            'status'  => 'success',
            'message' => 'Review deleted successfully.',
        ], 200);
    }
}

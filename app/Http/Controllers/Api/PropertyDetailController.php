<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Property;
use App\Models\Review;
use App\Enums\BookingStatus;
use App\Enums\CancellationPolicy;
use App\Enums\PropertyStatus;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

/**
 * @OA\Tag(
 *     name="Properties",
 *     description="API endpoints for property details"
 * )
 */
class PropertyDetailController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/properties/{id}",
     *     summary="Get property detail",
     *     description="Returns full detail of a single active/approved property including reviews, host info, related properties, and the authenticated user's review eligibility.",
     *     tags={"Properties"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Property ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Parameter(name="adults", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="children", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="rooms", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Property detail retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Property retrieved successfully"),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Property not found")
     * )
     */
    public function show(Request $request, $id): JsonResponse
    {
        $property = Property::with(['user', 'reviews.user'])
            ->where('status', 'Active')
            ->where('approval_status', PropertyStatus::APPROVED)
            ->find($id);

        if (! $property) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Property not found',
            ], 404);
        }

        // Images
        $images = [];
        if ($property->images) {
            $arr = is_array($property->images) ? $property->images : json_decode($property->images, true);
            foreach ((array) $arr as $img) {
                if ($img) $images[] = Storage::url($img);
            }
        }
        if (empty($images) && $property->image) {
            $images[] = Storage::url($property->image);
        }

        // Amenities
        $amenities = [];
        if ($property->amenities) {
            if (is_array($property->amenities)) {
                $amenities = $property->amenities;
            } elseif (is_string($property->amenities)) {
                $decoded = json_decode($property->amenities, true);
                $amenities = (json_last_error() === JSON_ERROR_NONE && is_array($decoded))
                    ? $decoded
                    : array_map('trim', explode(',', $property->amenities));
            }
        }

        // Reviews
        $reviews = $property->reviews
            ->sortByDesc('created_at')
            ->values()
            ->map(function ($review) {
                $profilePicture = null;
                if ($review->user->profile_picture) {
                    $profilePicture = filter_var($review->user->profile_picture, FILTER_VALIDATE_URL)
                        ? $review->user->profile_picture
                        : Storage::url($review->user->profile_picture);
                }

                return [
                    'id'         => $review->id,
                    'rating'     => $review->rating,
                    'comment'    => $review->comment,
                    'created_at' => $review->created_at->format('d M, Y'),
                    'user'       => [
                        'id'              => $review->user->id,
                        'name'            => $review->user->name,
                        'profile_picture' => $profilePicture,
                    ],
                ];
            });

        $totalReviews  = $reviews->count();
        $averageRating = $totalReviews > 0 ? round($reviews->avg('rating'), 1) : 0;

        $ratingBreakdown = [
            5 => $reviews->where('rating', 5)->count(),
            4 => $reviews->where('rating', 4)->count(),
            3 => $reviews->where('rating', 3)->count(),
            2 => $reviews->where('rating', 2)->count(),
            1 => $reviews->where('rating', 1)->count(),
        ];

        // Property data
        $propertyData = [
            'id'                           => $property->id,
            'title'                        => $property->title,
            'location'                     => $property->location,
            'timezone'                     => $property->timezone ?? 'UTC',
            'cancellation_policy'          => $property->cancellation_policy ?? CancellationPolicy::MODERATE->value,
            'cancellation_policy_description' => CancellationPolicy::tryFrom($property->cancellation_policy ?? '')?->description()
                ?? CancellationPolicy::MODERATE->description(),
            'price'                        => (float) $property->price,
            'bedrooms'                     => $property->bedrooms,
            'bathrooms'                    => $property->bathrooms,
            'guests'                       => $property->guests,
            'property_type'                => $property->property_type,
            'listing_category'             => $property->listing_category?->value ?? 'stay',
            'duration_hours'               => $property->duration_hours,
            'description'                  => $property->description,
            'amenities'                    => $amenities,
            'image'                        => $property->image ? Storage::url($property->image) : null,
            'images'                       => $images,
            'airport_pickup_enabled'       => (bool) ($property->airport_pickup_enabled ?? false),
            'airport'                      => $property->airport,
            'pickup_start_time'            => $property->pickup_start_time
                ? Carbon::parse($property->pickup_start_time)->format('H:i') : null,
            'pickup_end_time'              => $property->pickup_end_time
                ? Carbon::parse($property->pickup_end_time)->format('H:i') : null,
            'airport_pickup_price'         => $property->airport_pickup_price !== null
                ? (float) $property->airport_pickup_price : null,
            'guided_tours_enabled'         => (bool) ($property->guided_tours_enabled ?? false),
            'guided_tours_description'     => $property->guided_tours_description,
            'guided_tours_duration'        => $property->guided_tours_duration,
            'guided_tours_price'           => $property->guided_tours_price !== null
                ? (float) $property->guided_tours_price : null,
            'min_participants'             => $property->min_participants,
            'guide_language'               => $property->guide_language,
            'group_size'                   => $property->group_size,
            'meeting_point'                => $property->meeting_point,
            'included_services'            => is_array($property->included_services)
                ? $property->included_services : [],
            'safety_info'                  => $property->safety_info,
            'host' => [
                'id'              => $property->user->id,
                'name'            => $property->user->name,
                'profile_picture' => $property->user->profile_picture ?? null,
                'created_at'      => $property->user->created_at->toDateTimeString(),
            ],
        ];

        // Related properties (top 3 by rating, excluding current)
        $relatedProperties = Property::with('reviews')
            ->where('status', 'Active')
            ->where('approval_status', PropertyStatus::APPROVED)
            ->where('id', '!=', $property->id)
            ->get()
            ->map(function ($prop) {
                $avg = $prop->reviews->count() > 0 ? round($prop->reviews->avg('rating'), 2) : 0;

                return [
                    'id'       => $prop->id,
                    'title'    => $prop->title,
                    'location' => $prop->location,
                    'price'    => (float) $prop->price,
                    'image'    => $prop->image ? Storage::url($prop->image) : null,
                    'rating'   => (float) $avg,
                ];
            })
            ->sortByDesc('rating')
            ->take(3)
            ->values();

        // Review eligibility
        $reviewEligibility = 'guest';
        if (Auth::check()) {
            $alreadyReviewed = Review::where('property_id', $property->id)
                ->where('user_id', Auth::id())
                ->exists();

            if ($alreadyReviewed) {
                $reviewEligibility = 'already_reviewed';
            } else {
                $hasCompletedStay = Booking::where('property_id', $property->id)
                    ->where('user_id', Auth::id())
                    ->where('status', BookingStatus::COMPLETED->value)
                    ->exists();
                $reviewEligibility = $hasCompletedStay ? 'eligible' : 'no_completed_stay';
            }
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Property retrieved successfully',
            'data'    => [
                'property'           => $propertyData,
                'related_properties' => $relatedProperties,
                'reviews'            => $reviews,
                'rating_stats'       => [
                    'average'   => $averageRating,
                    'total'     => $totalReviews,
                    'breakdown' => $ratingBreakdown,
                ],
                'default_checkin'    => Carbon::today()->format('Y-m-d'),
                'default_checkout'   => Carbon::today()->addDays(7)->format('Y-m-d'),
                'search_guests'      => [
                    'adults'   => $request->query('adults'),
                    'children' => $request->query('children'),
                    'rooms'    => $request->query('rooms'),
                ],
                'review_eligibility' => $reviewEligibility,
            ],
        ], 200);
    }
}

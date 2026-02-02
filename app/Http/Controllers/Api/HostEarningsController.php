<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\HostEarningsRequest;
use App\Http\Resources\HostEarningResource;
use App\Http\Resources\HostPayoutResource;
use App\Models\Booking;
use App\Models\Payout;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

/**
 * @OA\Tag(
 *     name="Host Earnings",
 *     description="API endpoints for host earnings and payouts management"
 * )
 */
class HostEarningsController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/host/earnings",
     *     summary="Get host earnings and stats",
     *     description="Returns earnings statistics and paginated list of earnings from bookings",
     *     tags={"Host Earnings"},
     *     security={{"apiAuth": {}}},
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search earnings by booking ID, guest name, or property title",
     *         required=false,
     *         @OA\Schema(type="string", example="BK-001")
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
     *         description="Earnings retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Earnings retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="stats",
     *                     type="object",
     *                     @OA\Property(property="totalEarnings", type="number", example=24560.00),
     *                     @OA\Property(property="availableBalance", type="number", example=8450.00),
     *                     @OA\Property(property="pendingPayouts", type="number", example=3200.00)
     *                 ),
     *                 @OA\Property(
     *                     property="earnings",
     *                     type="array",
     *                     @OA\Items(
     *                         type="object",
     *                         @OA\Property(property="id", type="integer", example=1),
     *                         @OA\Property(property="bookingId", type="string", example="BK-000001"),
     *                         @OA\Property(property="guest", type="string", example="John Doe"),
     *                         @OA\Property(property="property", type="string", example="Luxury Beachfront Villa"),
     *                         @OA\Property(property="propertyId", type="integer", example=1),
     *                         @OA\Property(property="date", type="string", example="2025-01-15"),
     *                         @OA\Property(property="amount", type="string", example="$1,495.00"),
     *                         @OA\Property(property="status", type="string", example="Paid"),
     *                         @OA\Property(property="payoutDate", type="string", example="2025-01-20"),
     *                         @OA\Property(property="nights", type="integer", example=5),
     *                         @OA\Property(property="commission", type="string", example="$149.50"),
     *                         @OA\Property(property="netAmount", type="string", example="$1,345.50"),
     *                         @OA\Property(property="checkin", type="string", example="2025-01-15"),
     *                         @OA\Property(property="checkout", type="string", example="2025-01-20")
     *                     )
     *                 ),
     *                 @OA\Property(property="current_page", type="integer", example=1),
     *                 @OA\Property(property="last_page", type="integer", example=5),
     *                 @OA\Property(property="per_page", type="integer", example=10),
     *                 @OA\Property(property="total", type="integer", example=50)
     *             )
     *         )
     *     )
     * )
     */
    public function index(HostEarningsRequest $request): JsonResponse
    {
        $host = Auth::user();
        $perPage = $request->input('per_page', 10);
        
        $propertyIds = Property::where('user_id', $host->id)->pluck('id');
        
        // Calculate stats
        $totalEarnings = Booking::whereIn('property_id', $propertyIds)
            ->where('status', 'completed')
            ->sum('total_amount');
        
        $completedPayouts = Payout::where('user_id', $host->id)
            ->where('status', 'completed')
            ->sum('amount');
        
        $pendingPayouts = Payout::where('user_id', $host->id)
            ->whereIn('status', ['pending', 'processing'])
            ->sum('amount');
        
        $commissionRate = 0.10;
        $totalNetEarnings = $totalEarnings * (1 - $commissionRate);
        $availableBalance = $totalNetEarnings - $completedPayouts - $pendingPayouts;
        
        // Get earnings (bookings)
        $query = Booking::with('property')
            ->whereIn('property_id', $propertyIds)
            ->whereIn('status', ['confirmed', 'completed']);
        
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
        
        $earnings = $query->latest()->paginate($perPage);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Earnings retrieved successfully',
            'data' => [
                'stats' => [
                    'totalEarnings' => round($totalEarnings, 2),
                    'availableBalance' => round(max(0, $availableBalance), 2),
                    'pendingPayouts' => round($pendingPayouts, 2),
                ],
                'earnings' => HostEarningResource::collection($earnings->items()),
                'current_page' => $earnings->currentPage(),
                'last_page' => $earnings->lastPage(),
                'per_page' => $earnings->perPage(),
                'total' => $earnings->total(),
            ],
        ], 200);
    }

    /**
     * @OA\Get(
     *     path="/api/host/earnings/show/{id}",
     *     summary="Get a specific earning",
     *     description="Returns details of a specific earning from a booking",
     *     tags={"Host Earnings"},
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
     *         description="Earning retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Earning retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="bookingId", type="string", example="BK-000001"),
     *                 @OA\Property(property="guest", type="string", example="John Doe"),
     *                 @OA\Property(property="property", type="string", example="Luxury Beachfront Villa"),
     *                 @OA\Property(property="propertyId", type="integer", example=1),
     *                 @OA\Property(property="date", type="string", example="2025-01-15"),
     *                 @OA\Property(property="amount", type="string", example="$1,495.00"),
     *                 @OA\Property(property="status", type="string", example="Paid"),
     *                 @OA\Property(property="payoutDate", type="string", example="2025-01-20"),
     *                 @OA\Property(property="nights", type="integer", example=5),
     *                 @OA\Property(property="commission", type="string", example="$149.50"),
     *                 @OA\Property(property="netAmount", type="string", example="$1,345.50"),
     *                 @OA\Property(property="checkin", type="string", example="2025-01-15"),
     *                 @OA\Property(property="checkout", type="string", example="2025-01-20")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Earning not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Earning not found")
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
                'message' => 'Earning not found',
            ], 404);
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Earning retrieved successfully',
            'data' => new HostEarningResource($booking),
        ], 200);
    }

    /**
     * @OA\Get(
     *     path="/api/host/earnings/payouts",
     *     summary="Get host payouts",
     *     description="Returns a paginated list of payouts for the authenticated host",
     *     tags={"Host Earnings"},
     *     security={{"apiAuth": {}}},
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
     *         description="Payouts retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Payouts retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="payouts",
     *                     type="array",
     *                     @OA\Items(
     *                         type="object",
     *                         @OA\Property(property="id", type="integer", example=1),
     *                         @OA\Property(property="payoutId", type="string", example="PO-001"),
     *                         @OA\Property(property="amount", type="string", example="$5,200.00"),
     *                         @OA\Property(property="date", type="string", example="2025-01-20"),
     *                         @OA\Property(property="method", type="string", example="Bank Transfer"),
     *                         @OA\Property(property="status", type="string", example="Completed"),
     *                         @OA\Property(property="account", type="string", example="****1234"),
     *                         @OA\Property(property="transactionId", type="string", nullable=true, example="TXN-20250120-001"),
     *                         @OA\Property(property="processedDate", type="string", nullable=true, example="2025-01-20")
     *                     )
     *                 ),
     *                 @OA\Property(property="current_page", type="integer", example=1),
     *                 @OA\Property(property="last_page", type="integer", example=5),
     *                 @OA\Property(property="per_page", type="integer", example=10),
     *                 @OA\Property(property="total", type="integer", example=50)
     *             )
     *         )
     *     )
     * )
     */
    public function payouts(HostEarningsRequest $request): JsonResponse
    {
        $host = Auth::user();
        $perPage = $request->input('per_page', 10);
        
        $payouts = Payout::where('user_id', $host->id)
            ->latest()
            ->paginate($perPage);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Payouts retrieved successfully',
            'data' => [
                'payouts' => HostPayoutResource::collection($payouts->items()),
                'current_page' => $payouts->currentPage(),
                'last_page' => $payouts->lastPage(),
                'per_page' => $payouts->perPage(),
                'total' => $payouts->total(),
            ],
        ], 200);
    }

    /**
     * @OA\Get(
     *     path="/api/host/earnings/payout/{id}",
     *     summary="Get a specific payout",
     *     description="Returns details of a specific payout",
     *     tags={"Host Earnings"},
     *     security={{"apiAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Payout ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Payout retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Payout retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="payoutId", type="string", example="PO-001"),
     *                 @OA\Property(property="amount", type="string", example="$5,200.00"),
     *                 @OA\Property(property="date", type="string", example="2025-01-20"),
     *                 @OA\Property(property="method", type="string", example="Bank Transfer"),
     *                 @OA\Property(property="status", type="string", example="Completed"),
     *                 @OA\Property(property="account", type="string", example="****1234"),
     *                 @OA\Property(property="transactionId", type="string", nullable=true, example="TXN-20250120-001"),
     *                 @OA\Property(property="processedDate", type="string", nullable=true, example="2025-01-20"),
     *                 @OA\Property(property="accountName", type="string", nullable=true, example="John Doe"),
     *                 @OA\Property(property="bankName", type="string", nullable=true, example="Chase Bank"),
     *                 @OA\Property(property="notes", type="string", nullable=true),
     *                 @OA\Property(property="created_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Payout not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Payout not found")
     *         )
     *     )
     * )
     */
    public function showPayout($id): JsonResponse
    {
        $host = Auth::user();
        
        $payout = Payout::where('id', $id)
            ->where('user_id', $host->id)
            ->first();
        
        if (!$payout) {
            return response()->json([
                'status' => 'error',
                'message' => 'Payout not found',
            ], 404);
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Payout retrieved successfully',
            'data' => new HostPayoutResource($payout),
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/host/earnings/payouts",
     *     summary="Request a payout",
     *     description="Creates a new payout request for the authenticated host",
     *     tags={"Host Earnings"},
     *     security={{"apiAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"amount", "method"},
     *             @OA\Property(property="amount", type="number", format="float", example=1000.00),
     *             @OA\Property(property="method", type="string", enum={"bank_transfer", "paypal"}, example="bank_transfer"),
     *             @OA\Property(property="account_name", type="string", example="John Doe"),
     *             @OA\Property(property="bank_name", type="string", example="Chase Bank"),
     *             @OA\Property(property="account_number", type="string", example="1234567890"),
     *             @OA\Property(property="routing_number", type="string", example="021000021"),
     *             @OA\Property(property="paypal_email", type="string", format="email", example="host@example.com"),
     *             @OA\Property(property="notes", type="string", example="Monthly payout request")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Payout requested successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Payout requested successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="payoutId", type="string", example="PO-001"),
     *                 @OA\Property(property="amount", type="string", example="$1,000.00"),
     *                 @OA\Property(property="date", type="string", example="2025-01-20"),
     *                 @OA\Property(property="method", type="string", example="Bank Transfer"),
     *                 @OA\Property(property="status", type="string", example="Pending"),
     *                 @OA\Property(property="account", type="string", example="****1234"),
     *                 @OA\Property(property="transactionId", type="string", nullable=true),
     *                 @OA\Property(property="processedDate", type="string", nullable=true),
     *                 @OA\Property(property="accountName", type="string", nullable=true, example="John Doe"),
     *                 @OA\Property(property="bankName", type="string", nullable=true, example="Chase Bank"),
     *                 @OA\Property(property="notes", type="string", nullable=true),
     *                 @OA\Property(property="created_at", type="string", format="date-time")
     *             )
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
    public function requestPayout(HostEarningsRequest $request): JsonResponse
    {
        $host = Auth::user();
        
        $validated = $request->validated();
        
        // Check available balance
        $propertyIds = Property::where('user_id', $host->id)->pluck('id');
        $totalEarnings = Booking::whereIn('property_id', $propertyIds)
            ->where('status', 'completed')
            ->sum('total_amount');
        
        $commissionRate = 0.10;
        $totalNetEarnings = $totalEarnings * (1 - $commissionRate);
        
        $completedPayouts = Payout::where('user_id', $host->id)
            ->where('status', 'completed')
            ->sum('amount');
        
        $pendingPayouts = Payout::where('user_id', $host->id)
            ->whereIn('status', ['pending', 'processing'])
            ->sum('amount');
        
        $availableBalance = $totalNetEarnings - $completedPayouts - $pendingPayouts;
        
        if ($validated['amount'] > $availableBalance) {
            return response()->json([
                'status' => 'error',
                'message' => 'Requested amount exceeds available balance',
            ], 422);
        }
        
        // Generate unique payout ID
        $payoutId = 'PO-' . str_pad(Payout::max('id') + 1, 3, '0', STR_PAD_LEFT);
        
        $payout = Payout::create([
            'user_id' => $host->id,
            'payout_id' => $payoutId,
            'amount' => $validated['amount'],
            'method' => $validated['method'],
            'account_name' => $validated['account_name'] ?? null,
            'bank_name' => $validated['bank_name'] ?? null,
            'account_number' => $validated['account_number'] ?? null,
            'routing_number' => $validated['routing_number'] ?? null,
            'paypal_email' => $validated['paypal_email'] ?? null,
            'status' => 'pending',
            'notes' => $validated['notes'] ?? null,
        ]);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Payout requested successfully',
            'data' => new HostPayoutResource($payout),
        ], 201);
    }
}

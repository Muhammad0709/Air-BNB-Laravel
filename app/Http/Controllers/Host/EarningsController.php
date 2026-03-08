<?php

namespace App\Http\Controllers\Host;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payout;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EarningsController extends Controller
{
    public function index(Request $request)
    {
        $hostId = auth()->id();
        
        $bookings = Booking::whereHas('property', fn($q) => $q->where('user_id', $hostId))
            ->with(['property', 'user'])
            ->when($request->search, function($q, $search) {
                $q->where(fn($q) => $q->where('id', 'like', "%{$search}%")
                    ->orWhereHas('user', fn($q) => $q->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('property', fn($q) => $q->where('title', 'like', "%{$search}%")));
            })
            ->latest()
            ->get();
        
        $totalEarnings = Booking::whereHas('property', fn($q) => $q->where('user_id', $hostId))
            ->whereIn('status', ['completed', 'confirmed'])
            ->sum('total_amount');
        
        $paidOut = Payout::where('user_id', $hostId)->where('status', 'completed')->sum('amount');
        $payouts = Payout::where('user_id', $hostId)->pluck('processed_at', 'booking_id');
        
        $earnings = $bookings->map(fn($b) => [
            'id' => $b->id,
            'bookingId' => 'BK-' . str_pad($b->id, 3, '0', STR_PAD_LEFT),
            'guest' => $b->user->name ?? $b->name,
            'property' => $b->property->title ?? 'N/A',
            'date' => $b->check_in_date->format('Y-m-d'),
            'amount' => '$' . number_format($b->total_amount, 0),
            'status' => in_array($b->status->value, ['completed', 'confirmed']) ? 'Paid' : 'Pending',
            'payoutDate' => isset($payouts[$b->id]) ? $payouts[$b->id]->format('Y-m-d') : '-',
        ]);
        
        return Inertia::render('Host/Earnings/Index', [
            'earnings' => $earnings,
            'totalEarnings' => '$' . number_format($totalEarnings, 0),
            'availableBalance' => '$' . number_format($totalEarnings - $paidOut, 0),
        ]);
    }

    public function show(string $id)
    {
        $booking = Booking::with(['property', 'user'])->findOrFail($id);
        
        // Check if this booking belongs to host's property
        if ($booking->property->user_id !== auth()->id()) {
            abort(403);
        }
        
        $payout = Payout::where('booking_id', $id)->first();
        $commission = $booking->total_amount * 0.15; // 15% commission
        $netAmount = $booking->total_amount - $commission;
        
        $nights = $booking->check_in_date->diffInDays($booking->check_out_date);
        
        return Inertia::render('Host/Earnings/Show', [
            'earning' => [
                'id' => $booking->id,
                'bookingId' => 'BK-' . str_pad($booking->id, 3, '0', STR_PAD_LEFT),
                'guest' => $booking->user->name ?? $booking->name,
                'property' => $booking->property->title,
                'date' => $booking->check_in_date->format('F d, Y'),
                'amount' => '$' . number_format($booking->total_amount, 0),
                'status' => in_array($booking->status->value, ['completed', 'confirmed']) ? 'Paid' : 'Pending',
                'payoutDate' => $payout && $payout->processed_at ? $payout->processed_at->format('F d, Y') : '-',
                'nights' => $nights,
                'commission' => '$' . number_format($commission, 2),
                'netAmount' => '$' . number_format($netAmount, 2),
            ]
        ]);
    }
}

<?php

namespace App\Http\Controllers\Host;

use App\Http\Controllers\Controller;
use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\Property;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $host = Auth::user();
        $propertyIds = Property::where('user_id', $host->id)->pluck('id');

        $bookingsQuery = Booking::whereIn('property_id', $propertyIds);

        $stats = [
            'total_properties' => $propertyIds->count(),
            'total_bookings' => (clone $bookingsQuery)->count(),
            'revenue' => '$' . number_format((float) (clone $bookingsQuery)->whereIn('status', BookingStatus::paid())->sum('total_amount'), 2),
            'upcoming_bookings' => (clone $bookingsQuery)->where('check_in_date', '>', now()->startOfDay())->whereIn('status', BookingStatus::upcoming())->count(),
        ];

        $recentBookings = Booking::query()
            ->whereIn('property_id', $propertyIds)
            ->with(['property:id,title', 'user:id,name'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn (Booking $b) => [
                'id' => $b->id,
                'guest' => $b->name ?: $b->user?->name ?? '—',
                'property' => $b->property?->title ?? '—',
                'checkin' => $b->check_in_date->format('Y-m-d'),
                'checkout' => $b->check_out_date->format('Y-m-d'),
                'status' => $b->status->value,
                'amount' => '$' . number_format((float) $b->total_amount, 2),
            ]);

        return Inertia::render('Host/Dashboard', [
            'stats' => $stats,
            'recentBookings' => $recentBookings,
            'host' => ['name' => $host->name, 'email' => $host->email],
        ]);
    }
}

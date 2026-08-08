<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Enums\BookingStatus;
use App\Enums\PaymentStatus;
use App\Enums\PropertyStatus;
use App\Enums\UserType;
use App\Models\Booking;
use App\Models\Payout;
use App\Models\Property;
use App\Models\Review;
use App\Models\User;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index()
    {
        $stats = [
            'totalBookings' => Booking::count(),
            'totalUsers' => User::where('type', '!=', UserType::ADMIN)->count(),
            'totalProperties' => Property::count(),
            'revenue' => (float) Booking::where('payment_status', PaymentStatus::PAID->value)->sum('total_amount'),
            'pendingApprovals' => Property::where('approval_status', PropertyStatus::PENDING->value)->count(),
            'pendingBookings' => Booking::where('status', BookingStatus::PENDING->value)->count(),
            'activeHosts' => User::where('type', UserType::HOST)->count(),
            'averageRating' => round((float) Review::avg('rating'), 1),
            'pendingPayouts' => (float) Payout::whereIn('status', ['pending', 'processing'])->sum('amount'),
        ];

        $recentBookings = Booking::query()
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

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentBookings' => $recentBookings,
        ]);
    }
}


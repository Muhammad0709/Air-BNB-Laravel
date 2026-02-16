<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Enums\BookingStatus;
use App\Enums\UserType;
use App\Models\Booking;
use App\Models\Property;
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
            'revenue' => (float) Booking::whereIn('status', BookingStatus::paid())->sum('total_amount'),
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


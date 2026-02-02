<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index()
    {
        // Get statistics
        $stats = [
            'totalBookings' => 0, // TODO: Implement when bookings are added
            'totalUsers' => User::count(),
            'totalProperties' => Property::count(),
            'revenue' => 0, // TODO: Implement when bookings are added
        ];

        // Get recent bookings (empty for now)
        $recentBookings = [];

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentBookings' => $recentBookings,
        ]);
    }
}


<?php

namespace App\Http\Controllers\Host;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $host = Auth::user();
        
        // Get all properties for this host
        $properties = Property::where('user_id', $host->id)->get();
        
        // For now, we'll use mock booking data since bookings table doesn't exist yet
        // In a real application, you would fetch from a bookings table
        $mockBookings = [
            [
                'id' => 1,
                'guest' => 'John Doe',
                'property' => 'Luxury Beachfront Villa',
                'checkin' => '2025-01-20',
                'checkout' => '2025-01-25',
                'status' => 'Confirmed',
                'amount' => '$1,495'
            ],
            [
                'id' => 2,
                'guest' => 'Jane Smith',
                'property' => 'Modern Apartment',
                'checkin' => '2025-01-22',
                'checkout' => '2025-01-26',
                'status' => 'Pending',
                'amount' => '$799'
            ],
            [
                'id' => 3,
                'guest' => 'Mike Johnson',
                'property' => 'Cozy Studio',
                'checkin' => '2025-01-25',
                'checkout' => '2025-01-30',
                'status' => 'Confirmed',
                'amount' => '$625'
            ],
            [
                'id' => 4,
                'guest' => 'Sarah Williams',
                'property' => 'Luxury Beachfront Villa',
                'checkin' => '2025-01-28',
                'checkout' => '2025-02-02',
                'status' => 'Confirmed',
                'amount' => '$1,495'
            ],
        ];
        
        // Calculate dynamic stats based on actual data
        $totalBookings = count($mockBookings);
        $confirmedBookings = count(array_filter($mockBookings, fn($b) => $b['status'] === 'Confirmed'));
        $totalRevenue = array_sum(array_map(fn($b) => (int)str_replace(['$', ','], '', $b['amount']), $mockBookings));
        $upcomingBookings = count(array_filter($mockBookings, fn($b) => strtotime($b['checkin']) > time()));
        
        $stats = [
            'total_properties' => $properties->count(),
            'total_bookings' => $totalBookings,
            'revenue' => '$' . number_format($totalRevenue),
            'upcoming_bookings' => $upcomingBookings,
        ];
        
        return Inertia::render('Host/Dashboard', [
            'stats' => $stats,
            'recentBookings' => $mockBookings,
            'host' => $host,
        ]);
    }
}

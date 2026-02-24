<?php

namespace App\Http\Controllers\Host;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $propertyIds = Property::where('user_id', Auth::id())->pluck('id');

        $query = Booking::query()
            ->with(['property:id,title', 'user:id,name'])
            ->whereIn('property_id', $propertyIds)
            ->orderByDesc('created_at');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('property', fn ($pq) => $pq->where('title', 'like', "%{$search}%"))
                    ->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', "%{$search}%"));
            });
        }

        $bookings = $query->paginate(10);

        $bookings->getCollection()->transform(fn (Booking $b) => [
            'id' => $b->id,
            'guest' => $b->name ?: $b->user?->name ?? '—',
            'property' => $b->property?->title ?? '—',
            'checkin' => $b->check_in_date->format('Y-m-d'),
            'checkout' => $b->check_out_date->format('Y-m-d'),
            'status' => $b->status->value,
            'amount' => '$' . number_format((float) $b->total_amount, 2),
        ]);

        return Inertia::render('Host/Bookings/Index', [
            'bookings' => $bookings,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        $properties = Property::where('user_id', Auth::id())
            ->orderBy('title')
            ->get(['id', 'title', 'location']);

        return Inertia::render('Host/Bookings/Create', [
            'properties' => $properties,
        ]);
    }

    public function show(string $id)
    {
        $propertyIds = Property::where('user_id', Auth::id())->pluck('id');

        $booking = Booking::with('property:id,title,location')
            ->where('id', $id)
            ->whereIn('property_id', $propertyIds)
            ->firstOrFail();

        $guestName = $booking->name ?: $booking->user?->name ?? '—';

        return Inertia::render('Host/Bookings/Show', [
            'booking' => [
                'id' => (string) $booking->id,
                'guest' => $guestName,
                'guestEmail' => $booking->email ?? '',
                'guestPhone' => $booking->phone ? (($booking->phone_code ?? '') . ' ' . $booking->phone) : '',
                'property' => $booking->property?->title ?? '—',
                'propertyLocation' => $booking->property?->location ?? '',
                'checkin' => $booking->check_in_date->format('Y-m-d'),
                'checkout' => $booking->check_out_date->format('Y-m-d'),
                'status' => $booking->status->label(),
                'amount' => '$' . number_format((float) $booking->total_amount, 2),
                'nights' => $booking->nights,
                'createdAt' => $booking->created_at->format('Y-m-d'),
            ],
        ]);
    }

    public function edit(string $id)
    {
        $propertyIds = Property::where('user_id', Auth::id())->pluck('id');

        $booking = Booking::with('property:id,title')
            ->where('id', $id)
            ->whereIn('property_id', $propertyIds)
            ->firstOrFail();

        $properties = Property::where('user_id', Auth::id())
            ->orderBy('title')
            ->get(['id', 'title', 'location']);

        return Inertia::render('Host/Bookings/Edit', [
            'booking' => [
                'id' => (string) $booking->id,
                'guest' => $booking->name ?: $booking->user?->name ?? '',
                'guestEmail' => $booking->email ?? '',
                'guestPhone' => $booking->phone ?? '',
                'propertyId' => $booking->property_id,
                'property' => $booking->property?->title ?? '',
                'checkin' => $booking->check_in_date->format('Y-m-d'),
                'checkout' => $booking->check_out_date->format('Y-m-d'),
                'status' => $booking->status->value,
                'amount' => (string) $booking->total_amount,
            ],
            'properties' => $properties,
        ]);
    }
}

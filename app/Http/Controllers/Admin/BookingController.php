<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::query()
            ->with(['property:id,title', 'user:id,name'])
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

        return Inertia::render('Admin/Bookings/Index', [
            'bookings' => $bookings,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Bookings/Create');
    }

    public function show(string $id)
    {
        return Inertia::render('Admin/Bookings/Show', ['id' => $id]);
    }

    public function edit(string $id)
    {
        return Inertia::render('Admin/Bookings/Edit', ['id' => $id]);
    }
}

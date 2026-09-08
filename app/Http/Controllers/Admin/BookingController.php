<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateBookingRequest;
use App\Models\Booking;
use App\Models\Property;
use Carbon\Carbon;
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
            'reference' => $b->reference,
            'guest' => $b->name ?: $b->user?->name ?? '—',
            'property' => $b->property?->title ?? '—',
            'checkin' => $b->check_in_date->format('Y-m-d'),
            'checkout' => $b->check_out_date->format('Y-m-d'),
            'status' => $b->status->value,
            'payment_status' => $b->payment_status,
            'amount' => '$' . number_format((float) $b->total_amount, 2),
        ]);

        return Inertia::render('Admin/Bookings/Index', [
            'bookings' => $bookings,
            'filters' => $request->only(['search']),
        ]);
    }

    public function show(string $id)
    {
        $booking = Booking::with(['property:id,title,location'])->findOrFail($id);

        $guestName = $booking->name ?: $booking->user?->name ?? '—';

        return Inertia::render('Admin/Bookings/Show', [
            'id' => (string) $booking->id,
            'booking' => [
                'id' => (string) $booking->id,
                'guest' => $guestName,
                'guestEmail' => $booking->email ?? '',
                'guestPhone' => $booking->phone ? (($booking->phone_code ?? '') . ' ' . $booking->phone) : '',
                'property' => $booking->property?->title ?? '—',
                'propertyLocation' => $booking->property?->location ?? '',
                'checkin' => $booking->check_in_date->format('Y-m-d'),
                'checkout' => $booking->check_out_date->format('Y-m-d'),
                'status' => $booking->status->value,
                'paymentStatus' => $booking->payment_status,
                'amount' => '$' . number_format((float) $booking->total_amount, 2),
                'nights' => $booking->nights,
                'createdAt' => $booking->created_at->format('Y-m-d'),
            ],
        ]);
    }

    public function edit(string $id)
    {
        $booking = Booking::with('property:id,title')->findOrFail($id);
        $properties = Property::orderBy('title')->get(['id', 'title', 'location']);

        return Inertia::render('Admin/Bookings/Edit', [
            'id' => (string) $booking->id,
            'booking' => [
                'guest' => $booking->name ?: $booking->user?->name ?? '',
                'guestEmail' => $booking->email ?? '',
                'guestPhone' => $booking->phone ?? '',
                'property' => (string) $booking->property_id,
                'checkin' => $booking->check_in_date->format('Y-m-d'),
                'checkout' => $booking->check_out_date->format('Y-m-d'),
                'status' => $booking->status->value,
                'amount' => (string) $booking->total_amount,
            ],
            'properties' => $properties,
        ]);
    }

    public function update(UpdateBookingRequest $request, string $id)
    {
        $booking = Booking::findOrFail($id);
        $v = $request->validated();

        $data = [];

        if (isset($v['property_id'])) {
            $property = Property::findOrFail($v['property_id']);
            $data['property_id'] = $property->id;
        }
        if (isset($v['guest'])) {
            $data['name'] = $v['guest'];
        }
        if (isset($v['guestEmail'])) {
            $data['email'] = $v['guestEmail'];
        }
        if (isset($v['guestPhone'])) {
            $phone = $v['guestPhone'];
            $phoneCode = '+1';
            $phoneNumber = $phone;
            if (preg_match('/^(\+\d{1,3})\s*(.+)$/', trim($phone), $matches)) {
                $phoneCode = $matches[1];
                $phoneNumber = $matches[2];
            }
            $data['phone_code'] = $phoneCode;
            $data['phone'] = $phoneNumber;
        }
        if (isset($v['checkin'])) {
            $data['check_in_date'] = Carbon::parse($v['checkin']);
        }
        if (isset($v['checkout'])) {
            $data['check_out_date'] = Carbon::parse($v['checkout']);
        }
        if (isset($data['check_in_date']) || isset($data['check_out_date'])) {
            $checkin = $data['check_in_date'] ?? $booking->check_in_date;
            $checkout = $data['check_out_date'] ?? $booking->check_out_date;
            $data['nights'] = Carbon::parse($checkin)->diffInDays(Carbon::parse($checkout));
        }
        if (isset($v['amount'])) {
            $data['total_amount'] = (float) $v['amount'];
        }
        if (isset($v['status'])) {
            $data['status'] = strtolower($v['status']);
        }

        $booking->update($data);

        return redirect()->route('admin.bookings.index')->with('success', __('admin.bookings.updated_success'));
    }

    public function destroy(string $id)
    {
        Booking::findOrFail($id)->delete();

        return redirect()->route('admin.bookings.index')->with('success', __('admin.bookings.deleted_success'));
    }
}

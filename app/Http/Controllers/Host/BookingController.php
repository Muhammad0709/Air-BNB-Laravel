<?php

namespace App\Http\Controllers\Host;

use App\Enums\BookingStatus;
use App\Enums\DepositStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Host\StoreBookingRequest;
use App\Http\Requests\Host\StoreGuestReviewRequest;
use App\Http\Requests\Host\UpdateBookingRequest;
use App\Http\Requests\Host\UpdateBookingStatusRequest;
use App\Http\Requests\Host\UpdateDepositStatusRequest;
use App\Models\Booking;
use App\Models\GuestReview;
use App\Models\Property;
use App\Models\User;
use Carbon\Carbon;
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
            'reference' => $b->reference,
            'guest' => $b->name ?: $b->user?->name ?? '—',
            'property' => $b->property?->title ?? '—',
            'checkin' => $b->check_in_date->format('Y-m-d'),
            'checkout' => $b->check_out_date->format('Y-m-d'),
            'status' => $b->status->value,
            'payment_status' => $b->payment_status,
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

    public function store(StoreBookingRequest $request)
    {
        $v = $request->validated();
        $host = Auth::user();

        $property = Property::where('id', $v['property_id'])
            ->where('user_id', $host->id)
            ->firstOrFail();

        $checkin = Carbon::parse($v['checkin']);
        $checkout = Carbon::parse($v['checkout']);
        $nights = $checkin->diffInDays($checkout);

        $totalAmount = (float) $v['amount'];
        $nightlyRate = (float) $property->price;
        $subtotal = $nightlyRate * $nights;
        $cleaningFee = 25.00;
        $serviceFee = round($subtotal * 0.12, 2);
        $depositAmount = (float) ($property->deposit_amount ?? 0);

        $phone = $v['phone'];
        $phoneCode = '+1';
        $phoneNumber = $phone;
        if (preg_match('/^(\+\d{1,3})\s*(.+)$/', trim($phone), $matches)) {
            $phoneCode = $matches[1];
            $phoneNumber = $matches[2];
        }

        $guestUser = User::where('email', $v['email'])->first();
        if (! $guestUser) {
            $guestUser = User::create([
                'name' => $v['guest'],
                'email' => $v['email'],
                'password' => bcrypt(uniqid()),
                'type' => \App\Enums\UserType::USER,
            ]);
        }

        $status = strtolower($v['status'] ?? 'pending');

        Booking::create([
            'property_id' => $property->id,
            'user_id' => $guestUser->id,
            'name' => $v['guest'],
            'email' => $v['email'],
            'phone_code' => $phoneCode,
            'phone' => $phoneNumber,
            'check_in_date' => $checkin,
            'check_out_date' => $checkout,
            'nights' => $nights,
            'nightly_rate' => $nightlyRate,
            'cleaning_fee' => $cleaningFee,
            'service_fee' => $serviceFee,
            'total_amount' => $totalAmount,
            'deposit_amount' => $depositAmount,
            'deposit_status' => $depositAmount > 0 ? DepositStatus::HELD->value : null,
            'status' => $status,
            'rooms' => 1,
            'adults' => 1,
            'children' => 0,
        ]);

        return redirect()->route('host.bookings.index')->with('success', __('host.bookings.created_success'));
    }

    public function show(string $id)
    {
        $propertyIds = Property::where('user_id', Auth::id())->pluck('id');

        $booking = Booking::with(['property:id,title,location', 'guestReview'])
            ->where('id', $id)
            ->whereIn('property_id', $propertyIds)
            ->firstOrFail();

        $guestName = $booking->name ?: $booking->user?->name ?? '—';

        return Inertia::render('Host/Bookings/Show', [
            'booking' => [
                'id' => (string) $booking->id,
                'reference' => $booking->reference,
                'guest' => $guestName,
                'guestEmail' => $booking->email ?? '',
                'guestPhone' => $booking->phone ? (($booking->phone_code ?? '') . ' ' . $booking->phone) : '',
                'property' => $booking->property?->title ?? '—',
                'propertyLocation' => $booking->property?->location ?? '',
                'checkin' => $booking->check_in_date->format('Y-m-d'),
                'checkout' => $booking->check_out_date->format('Y-m-d'),
                'status' => $booking->status->value,
                'statusLabel' => $booking->status->label(),
                'paymentStatus' => $booking->payment_status,
                'amount' => '$' . number_format((float) $booking->total_amount, 2),
                'nights' => $booking->nights,
                'createdAt' => $booking->created_at->format('Y-m-d'),
                'depositAmount' => (float) $booking->deposit_amount,
                'depositStatus' => $booking->deposit_status?->value,
                'depositDisputeReason' => $booking->deposit_dispute_reason,
            ],
            'canReviewGuest' => $booking->status === BookingStatus::COMPLETED
                && $booking->user_id !== null
                && ! $booking->guestReview,
            'guestReview' => $booking->guestReview ? [
                'rating' => $booking->guestReview->rating,
                'comment' => $booking->guestReview->comment,
                'createdAt' => $booking->guestReview->created_at->format('Y-m-d'),
            ] : null,
            'canManageDeposit' => (float) $booking->deposit_amount > 0
                && $booking->status === BookingStatus::COMPLETED
                && $booking->deposit_status === DepositStatus::HELD,
        ]);
    }

    public function updateDepositStatus(UpdateDepositStatusRequest $request, string $id)
    {
        $propertyIds = Property::where('user_id', Auth::id())->pluck('id');

        $booking = Booking::where('id', $id)
            ->whereIn('property_id', $propertyIds)
            ->firstOrFail();

        abort_unless((float) $booking->deposit_amount > 0, 403, 'This booking has no deposit to manage.');
        abort_unless($booking->deposit_status === DepositStatus::HELD, 403, 'This deposit has already been resolved.');

        $booking->update([
            'deposit_status' => $request->validated('deposit_status'),
            'deposit_dispute_reason' => $request->validated('deposit_status') === DepositStatus::DISPUTED->value
                ? $request->validated('deposit_dispute_reason')
                : null,
        ]);

        return redirect()->back()->with('success', __('host.bookings.deposit_status_updated'));
    }

    public function storeGuestReview(StoreGuestReviewRequest $request, string $id)
    {
        $propertyIds = Property::where('user_id', Auth::id())->pluck('id');

        $booking = Booking::where('id', $id)
            ->whereIn('property_id', $propertyIds)
            ->firstOrFail();

        abort_unless($booking->status === BookingStatus::COMPLETED, 403, 'Only completed stays can be reviewed.');
        abort_unless($booking->user_id, 403, 'This booking has no registered guest to review.');
        abort_if($booking->guestReview()->exists(), 403, 'This guest has already been reviewed for this booking.');

        GuestReview::create([
            'booking_id' => $booking->id,
            'host_id' => Auth::id(),
            'guest_id' => $booking->user_id,
            'rating' => $request->validated('rating'),
            'comment' => $request->validated('comment'),
        ]);

        return redirect()->back()->with('success', __('host.bookings.guest_review_submitted'));
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
                'status' => $booking->status->label(),
                'amount' => (string) $booking->total_amount,
            ],
            'properties' => $properties,
        ]);
    }

    public function update(UpdateBookingRequest $request, string $id)
    {
        $v = $request->validated();
        $host = Auth::user();
        $propertyIds = Property::where('user_id', $host->id)->pluck('id');

        $booking = Booking::where('id', $id)
            ->whereIn('property_id', $propertyIds)
            ->firstOrFail();

        $data = [];

        if (isset($v['property_id'])) {
            $property = Property::where('id', $v['property_id'])
                ->where('user_id', $host->id)
                ->firstOrFail();
            $data['property_id'] = $property->id;
        }

        if (isset($v['guest'])) {
            $data['name'] = $v['guest'];
        }
        if (isset($v['email'])) {
            $data['email'] = $v['email'];
        }
        if (isset($v['phone'])) {
            $phone = $v['phone'];
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

        return redirect()->route('host.bookings.index')->with('success', __('host.bookings.updated_success'));
    }

    public function updateStatus(UpdateBookingStatusRequest $request, string $id)
    {
        $propertyIds = Property::where('user_id', Auth::id())->pluck('id');

        $booking = Booking::with(['user', 'property'])
            ->where('id', $id)
            ->whereIn('property_id', $propertyIds)
            ->firstOrFail();

        $newStatus = $request->validated('status');
        $oldStatus = $booking->status->value;
        
        $booking->update([
            'status' => $newStatus,
        ]);

        // Send notification to user based on status change
        $guest = $booking->user;
        if ($guest && $oldStatus !== $newStatus) {
            $notificationType = match ($newStatus) {
                'confirmed'              => 'booking_confirmed',
                'completed'              => 'booking_completed',
                'cancelled'              => 'booking_cancelled',
                'refunded'               => 'booking_cancelled',  // reuse cancelled template
                default                  => null,
            };

            if ($notificationType) {
                event(new \App\Events\NotificationEvent(
                    $booking,
                    $notificationType,
                    ['user' => $guest]
                ));
            }
        }

        return redirect()->back()->with('success', __('host.bookings.status_updated_success'));
    }
}

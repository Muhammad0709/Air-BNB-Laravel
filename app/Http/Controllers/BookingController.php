<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookingRequest;
use App\Enums\BookingStatus;
use App\Enums\CancellationPolicy;
use App\Enums\PropertyStatus;
use App\Enums\UserType;
use App\Models\Booking;
use App\Models\Property;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BookingController extends Controller
{
    /**
     * Validate/fix checkin & checkout on the backend and redirect to the booking page.
     * Used when navigating from Listing Detail "Book" so date logic stays on the server.
     */
    public function redirectToBooking(Request $request)
    {
        $propertyId = $request->query('property_id');
        $checkin = $request->query('checkin');
        $checkout = $request->query('checkout');

        $today = Carbon::today()->format('Y-m-d');
        $defaultCheckout = Carbon::today()->addDays(7)->format('Y-m-d');

        if (! $checkin || ! preg_match('/^\d{4}-\d{2}-\d{2}$/', $checkin)) {
            $checkin = $today;
        }
        if (! $checkout || ! preg_match('/^\d{4}-\d{2}-\d{2}$/', $checkout)) {
            $checkout = $defaultCheckout;
        }
        try {
            if (Carbon::parse($checkout)->lte(Carbon::parse($checkin))) {
                $checkout = Carbon::parse($checkin)->addDay()->format('Y-m-d');
            }
        } catch (\Exception $e) {
            $checkout = Carbon::parse($checkin)->addDay()->format('Y-m-d');
        }

        $params = array_filter([
            'property_id' => $propertyId,
            'checkin' => $checkin,
            'checkout' => $checkout,
        ]);

        foreach (['adults', 'children', 'rooms'] as $key) {
            if ($request->has($key) && $request->query($key) !== null && $request->query($key) !== '') {
                $params[$key] = $request->query($key);
            }
        }

        return redirect()->route('booking', $params);
    }

    public function index(Request $request)
    {
        $propertyId = $request->query('property_id');
        $checkin = $request->query('checkin');
        $checkout = $request->query('checkout');

        // Default dates from backend: today and today + 7 days
        $today = Carbon::today()->format('Y-m-d');
        $defaultCheckout = Carbon::today()->addDays(7)->format('Y-m-d');
        if (! $checkin) {
            $checkin = $today;
        }
        if (! $checkout) {
            $checkout = $defaultCheckout;
        }
        // Ensure checkout is after checkin
        if (Carbon::parse($checkout)->lte(Carbon::parse($checkin))) {
            $checkout = Carbon::parse($checkin)->addDay()->format('Y-m-d');
        }

        $propertyData = null;
        $property = null;
        $nights = 7;
        $costs = [];
        $totalAmount = 0;
        $cancellationPolicy = CancellationPolicy::MODERATE;
        $rules = [
            'Check-in: 3:00 PM - 10:00 PM',
            'Check-out: 11:00 AM',
            'No parties or events allowed',
            'Pets allowed (with prior notification)',
            'No smoking indoors',
        ];

        if ($propertyId) {
            $property = Property::withCount('reviews')
                ->withAvg('reviews', 'rating')
                ->where('status', 'Active')
                ->where('approval_status', PropertyStatus::APPROVED)
                ->find($propertyId);

            if ($property) {
                $cancellationPolicy = CancellationPolicy::tryFrom($property->cancellation_policy ?? '') ?? CancellationPolicy::MODERATE;
                $image = $property->getPrimaryImageUrl() ?? '/images/popular-stay-1.svg';

                try {
                    $start = Carbon::parse($checkin);
                    $end = Carbon::parse($checkout);
                    $nights = max(1, (int) $start->diffInDays($end));
                } catch (\Exception $e) {
                    $nights = 7;
                }

                $pricePerNight = (float) $property->price;
                $cleaningFee = 25;
                $serviceFeePercent = 10;
                $subtotal = round($pricePerNight * $nights, 2);
                $serviceFee = round($subtotal * ($serviceFeePercent / 100), 2);
                $totalAmount = round($subtotal + $cleaningFee + $serviceFee, 2);

                $costs = [
                    ['label' => number_format($pricePerNight, 0) . ' × ' . $nights . ' night' . ($nights !== 1 ? 's' : ''), 'amount' => $subtotal],
                    ['label' => 'Cleaning fee', 'amount' => $cleaningFee],
                    ['label' => 'Service fee', 'amount' => $serviceFee],
                ];

                $propertyData = [
                    'id' => $property->id,
                    'title' => $property->title,
                    'location' => $property->location,
                    'image' => $image,
                    'price' => $pricePerNight,
                    'bedrooms' => $property->bedrooms,
                    'bathrooms' => $property->bathrooms,
                    'guests' => $property->guests,
                    'reviews_count' => $property->reviews_count ?? 0,
                    'rating' => round((float) ($property->reviews_avg_rating ?? 0), 1),
                ];
            }
        }

        if ($propertyData === null) {
            $nights = 7;
            $costs = [
                ['label' => '87 × 7 nights', 'amount' => 585],
                ['label' => 'Cleaning fee', 'amount' => 25],
                ['label' => 'Service fee', 'amount' => 71],
            ];
            $totalAmount = 631;
        }

        $guestPrefill = $this->resolveGuestPrefillForBooking($property, $request);

        return Inertia::render('Booking', [
            'property' => $propertyData,
            'nights' => $nights,
            'checkin' => $checkin,
            'checkout' => $checkout,
            'costs' => $costs,
            'totalAmount' => $totalAmount,
            'rules' => $rules,
            'cancellationPolicy' => $cancellationPolicy->value,
            'cancellationPolicyDescription' => $cancellationPolicy->description(),
            'guestPrefill' => $guestPrefill,
        ]);
    }

    /**
     * When adults/children/rooms appear on the booking URL (e.g. from search → listing → book),
     * return validated numbers for the form. Otherwise leave null so the UI keeps empty placeholders.
     *
     * @return array{prefill: bool, adults: int|null, children: int|null, rooms: int|null}
     */
    private function resolveGuestPrefillForBooking(?Property $property, Request $request): array
    {
        $hasGuestQuery = $request->has('adults') || $request->has('children') || $request->has('rooms');

        if (! $hasGuestQuery) {
            return [
                'prefill' => false,
                'adults' => null,
                'children' => null,
                'rooms' => null,
            ];
        }

        $maxGuestCap = $property ? max(1, (int) $property->guests) : 10;
        $bedrooms = $property ? max(1, (int) ($property->bedrooms ?: 1)) : 1;
        $maxRooms = min(20, max($bedrooms, 1));

        $adults = $request->has('adults') ? (int) $request->query('adults') : 1;
        $children = $request->has('children') ? (int) $request->query('children') : 0;
        $rooms = $request->has('rooms') ? (int) $request->query('rooms') : $bedrooms;

        $adults = max(1, min(10, $adults));
        $children = max(0, min(10, $children));
        $rooms = max(1, min($maxRooms, $rooms));

        if ($property) {
            if ($adults + $children > $maxGuestCap) {
                $children = max(0, min($children, $maxGuestCap - $adults));
                if ($adults + $children > $maxGuestCap) {
                    $adults = max(1, min($adults, $maxGuestCap));
                    $children = max(0, $maxGuestCap - $adults);
                }
            }
            $rooms = min($rooms, $bedrooms);
        }

        return [
            'prefill' => true,
            'adults' => $adults,
            'children' => $children,
            'rooms' => $rooms,
        ];
    }

    /**
     * Save booking to DB and redirect to confirmation (web flow).
     */
    public function store(StoreBookingRequest $request)
    {
        $validated = $request->validated();

        $property = Property::where('id', $validated['property_id'])
            ->where('status', 'Active')
            ->where('approval_status', PropertyStatus::APPROVED)
            ->firstOrFail();

        $checkin = Carbon::parse($validated['checkin']);
        $checkout = Carbon::parse($validated['checkout']);
        $nights = max(1, (int) $checkin->diffInDays($checkout));

        $nightlyRate = (float) $property->price;
        $cleaningFee = 25.00;
        $subtotal = round($nightlyRate * $nights, 2);
        $serviceFeePercent = 10;
        $serviceFee = round($subtotal * ($serviceFeePercent / 100), 2);
        $totalAmount = round($subtotal + $cleaningFee + $serviceFee, 2);

        $user = Auth::user();
        if (! $user) {
            $user = User::where('email', $validated['email'])->first();
            if (! $user) {
                $user = User::create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'password' => bcrypt(str()->random(32)),
                    'type' => UserType::USER,
                ]);
            }
        }

        $phoneCode = $validated['phone_code'] ?? '+31';

        $booking = Booking::create([
            'property_id' => $property->id,
            'user_id' => $user->id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone_code' => $phoneCode,
            'phone' => $validated['phone'],
            'rooms' => $validated['rooms'] ?? 1,
            'adults' => $validated['adults'] ?? 1,
            'children' => $validated['children'] ?? 0,
            'check_in_date' => $checkin,
            'check_out_date' => $checkout,
            'nights' => $nights,
            'nightly_rate' => $nightlyRate,
            'cleaning_fee' => $cleaningFee,
            'service_fee' => $serviceFee,
            'total_amount' => $totalAmount,
            'status' => BookingStatus::PENDING,
        ]);
        
        // Send notification to property host
        $host = $property->user;
        if ($host) {
            event(new \App\Events\NotificationEvent(
                $booking,
                'booking_created',
                ['host' => $host]
            ));
        }
        
        // Send notification to all admins
        $admins = User::where('type', UserType::ADMIN->value)->get();
        if ($admins->isNotEmpty()) {
            event(new \App\Events\NotificationEvent(
                $booking,
                'booking_created',
                ['admins' => $admins]
            ));
        }

        return redirect()->route('confirmation', [
            'property_id' => $property->id,
            'checkin' => $validated['checkin'],
            'checkout' => $validated['checkout'],
            'booking' => $booking->id,
        ]);
    }
}

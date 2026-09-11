<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookingRequest;
use App\Enums\BookingStatus;
use App\Enums\CancellationPolicy;
use App\Enums\DepositStatus;
use App\Enums\PropertyStatus;
use App\Enums\UserType;
use App\Models\Booking;
use App\Models\Property;
use App\Models\User;
use App\Services\MpesaService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
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
        $depositAmount = 0;
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
                $depositAmount = (float) ($property->deposit_amount ?? 0);
                $image = $property->getPrimaryImageUrl() ?? '/images/popular-stay-1.svg';

                try {
                    $start = Carbon::parse($checkin);
                    $end = Carbon::parse($checkout);
                    $nights = max(1, (int) $start->diffInDays($end));
                } catch (\Exception $e) {
                    $nights = 7;
                }

                $isExperience = $property->isExperience();
                if ($isExperience) {
                    $availableDates = collect($property->experience_available_dates ?? [])
                        ->filter(fn ($date) => $date >= Carbon::today()->format('Y-m-d'))
                        ->values();

                    if ($availableDates->isNotEmpty() && ! $availableDates->contains($checkin)) {
                        $checkin = $availableDates->first();
                        $checkout = Carbon::parse($checkin)->addDay()->format('Y-m-d');
                    }
                    $nights = 1;
                }
                $attendees = max(1, (int) $request->query('adults', 1) + (int) $request->query('children', 0));
                $pricePerUnit = (float) $property->price;
                $cleaningFee = $isExperience ? 0 : 25;
                $serviceFeePercent = 10;
                $subtotal = $isExperience
                    ? round($pricePerUnit * $attendees, 2)
                    : round($pricePerUnit * $nights, 2);
                $serviceFee = round($subtotal * ($serviceFeePercent / 100), 2);
                $totalAmount = round($subtotal + $cleaningFee + $serviceFee, 2);

                $costs = $isExperience
                    ? [
                        ['label' => number_format($pricePerUnit, 0) . ' × ' . $attendees . ' guest' . ($attendees !== 1 ? 's' : ''), 'amount' => $subtotal],
                        ['label' => 'Service fee', 'amount' => $serviceFee],
                    ]
                    : [
                        ['label' => number_format($pricePerUnit, 0) . ' × ' . $nights . ' night' . ($nights !== 1 ? 's' : ''), 'amount' => $subtotal],
                        ['label' => 'Cleaning fee', 'amount' => $cleaningFee],
                        ['label' => 'Service fee', 'amount' => $serviceFee],
                    ];

                $propertyData = [
                    'id' => $property->id,
                    'title' => $property->title,
                    'location' => $property->location,
                    'image' => $image,
                    'price' => $pricePerUnit,
                    'bedrooms' => $property->bedrooms,
                    'bathrooms' => $property->bathrooms,
                    'guests' => $property->guests,
                    'listing_category' => $property->listing_category?->value ?? 'stay',
                    'duration_hours' => $property->duration_hours,
                    'experience_available_dates' => $property->experience_available_dates ?? [],
                    'experience_available_times' => $property->experience_available_times ?? [],
                    'experience_booking_paused' => (bool) $property->experience_booking_paused,
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
            'depositAmount' => $depositAmount,
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
        $isExperience = $property->isExperience();
        $checkout = $isExperience
            ? $checkin->copy()->addDay()
            : Carbon::parse($validated['checkout']);
        $nights = $isExperience ? 1 : max(1, (int) $checkin->diffInDays($checkout));
        $attendees = max(1, (int) ($validated['adults'] ?? 1) + (int) ($validated['children'] ?? 0));
        $nightlyRate = (float) $property->price;
        $cleaningFee = $isExperience ? 0.00 : 25.00;
        $subtotal = $isExperience
            ? round($nightlyRate * $attendees, 2)
            : round($nightlyRate * $nights, 2);
        $serviceFeePercent = 10;
        $serviceFee = round($subtotal * ($serviceFeePercent / 100), 2);
        $totalAmount = round($subtotal + $cleaningFee + $serviceFee, 2);
        $depositAmount = (float) ($property->deposit_amount ?? 0);

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

        $phoneCode     = $validated['phone_code'] ?? '+31';
        $paymentMethod = $validated['payment_method'] ?? 'cod';

        $booking = DB::transaction(function () use (
            $property,
            $isExperience,
            $validated,
            $user,
            $phoneCode,
            $checkin,
            $checkout,
            $nights,
            $nightlyRate,
            $cleaningFee,
            $serviceFee,
            $totalAmount,
            $depositAmount,
            $paymentMethod,
        ) {
            $lockedProperty = Property::query()->lockForUpdate()->findOrFail($property->id);

            if ($isExperience) {
                $experienceTime = $validated['experience_time'] ?? null;
                if ($lockedProperty->experience_booking_paused) {
                    throw ValidationException::withMessages([
                        'checkin' => 'Bookings for this experience are currently paused.',
                    ]);
                }
                if ($lockedProperty->experience_available_dates
                    && ! in_array($checkin->format('Y-m-d'), $lockedProperty->experience_available_dates, true)) {
                    throw ValidationException::withMessages([
                        'checkin' => 'Please select one of the available experience dates.',
                    ]);
                }
                if ($lockedProperty->experience_available_times
                    && ! in_array($experienceTime, $lockedProperty->experience_available_times, true)) {
                    throw ValidationException::withMessages([
                        'experience_time' => 'Please select one of the available experience times.',
                    ]);
                }
                $bookedGuests = Booking::where('property_id', $lockedProperty->id)
                    ->whereDate('check_in_date', $checkin->format('Y-m-d'))
                    ->where('experience_time', $experienceTime)
                    ->whereIn('status', BookingStatus::upcoming())
                    ->get()
                    ->sum(fn (Booking $existing) => (int) $existing->adults + (int) $existing->children);
                $requestedGuests = max(1, (int) ($validated['adults'] ?? 1) + (int) ($validated['children'] ?? 0));

                if ($bookedGuests + $requestedGuests > (int) $lockedProperty->guests) {
                    throw ValidationException::withMessages([
                        'adults' => 'This experience is full for the selected date and time.',
                    ]);
                }
            }

            return Booking::create([
                'property_id'    => $lockedProperty->id,
                'user_id'        => $user->id,
                'name'           => $validated['name'],
                'email'          => $validated['email'],
                'phone_code'     => $phoneCode,
                'phone'          => $validated['phone'],
                'rooms'          => $validated['rooms'] ?? 1,
                'adults'         => $validated['adults'] ?? 1,
                'children'       => $validated['children'] ?? 0,
                'check_in_date'  => $checkin,
                'check_out_date' => $checkout,
                'experience_time' => $isExperience ? ($validated['experience_time'] ?? null) : null,
                'nights'         => $nights,
                'nightly_rate'   => $nightlyRate,
                'cleaning_fee'   => $cleaningFee,
                'service_fee'    => $serviceFee,
                'total_amount'   => $totalAmount,
                'deposit_amount' => $depositAmount,
                'deposit_status' => $depositAmount > 0 ? DepositStatus::HELD->value : null,
                'status'         => BookingStatus::PENDING,
                'payment_method' => $paymentMethod,
            ]);
        });

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

        // If M-Pesa online payment — trigger STK Push immediately
        $mpesaError = null;
        if ($paymentMethod === 'online_mpesa') {
            $mpesaPhone = $validated['mpesa_phone'] ?? $validated['phone'];
            try {
                app(MpesaService::class)->lipaNaMpesaOnline(
                    phoneNumber: $mpesaPhone,
                    amount: $totalAmount,
                    bookingId: $booking->id,
                );
                Log::info('STK Push triggered for booking #' . $booking->id);
            } catch (\Exception $e) {
                Log::error('STK Push failed for booking #' . $booking->id . ': ' . $e->getMessage());
                $mpesaError = $e->getMessage();
            }
        }

        return redirect()->route('confirmation', [
            'property_id'    => $property->id,
            'checkin'        => $validated['checkin'],
            'checkout'       => $validated['checkout'],
            'booking'        => $booking->id,
            'payment_method' => $paymentMethod,
            'mpesa_phone'    => $validated['mpesa_phone'] ?? null,
            'mpesa_error'    => $mpesaError,
        ]);
    }
}

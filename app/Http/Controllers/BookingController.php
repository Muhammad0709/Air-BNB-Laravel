<?php

namespace App\Http\Controllers;

use App\Enums\BookingStatus;
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
        $nights = 7;
        $costs = [];
        $totalAmount = 0;
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
                $image = null;
                if ($property->images) {
                    $imagesRaw = $property->images;
                    $imagesArray = is_array($imagesRaw) ? $imagesRaw : (is_string($imagesRaw) ? json_decode($imagesRaw, true) : []);
                    if (is_array($imagesArray) && !empty($imagesArray)) {
                        $image = Storage::url($imagesArray[0]);
                    }
                }
                if (!$image && $property->image) {
                    $image = Storage::url($property->image);
                }
                if (!$image) {
                    $image = '/images/popular-stay-1.svg';
                }

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
                $totalAmount = '$' . number_format($subtotal + $cleaningFee + $serviceFee, 0);

                $costs = [
                    ['label' => '$' . number_format($pricePerNight, 0) . ' × ' . $nights . ' night' . ($nights !== 1 ? 's' : ''), 'amount' => '$' . number_format($subtotal, 0)],
                    ['label' => 'Cleaning fee', 'amount' => '$' . number_format($cleaningFee, 0)],
                    ['label' => 'Service fee', 'amount' => '$' . number_format($serviceFee, 0)],
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
                ['label' => '$87 × 7 nights', 'amount' => '$585'],
                ['label' => 'Cleaning fee', 'amount' => '$25'],
                ['label' => 'Service fee', 'amount' => '$71'],
            ];
            $totalAmount = '$631';
        }

        return Inertia::render('Booking', [
            'property' => $propertyData,
            'nights' => $nights,
            'checkin' => $checkin,
            'checkout' => $checkout,
            'costs' => $costs,
            'totalAmount' => $totalAmount,
            'rules' => $rules,
        ]);
    }

    /**
     * Save booking to DB and redirect to confirmation (web flow).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'property_id' => 'required|integer|exists:properties,id',
            'checkin' => 'required|date',
            'checkout' => 'required|date|after:checkin',
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone_code' => 'nullable|string|max:10',
            'phone' => 'required|string|max:20',
            'rooms' => 'nullable|integer|min:1|max:20',
            'adults' => 'nullable|integer|min:1|max:50',
            'children' => 'nullable|integer|min:0|max:20',
        ]);

        $property = Property::where('id', $validated['property_id'])
            ->where('status', 'Active')
            ->where('approval_status', PropertyStatus::APPROVED)
            ->firstOrFail();

        $checkin = Carbon::parse($validated['checkin']);
        $checkout = Carbon::parse($validated['checkout']);
        $nights = max(1, (int) $checkin->diffInDays($checkout));

        $nightlyRate = (float) $property->price;
        $cleaningFee = 25.00;
        $serviceFee = round($nightlyRate * $nights * 0.12, 2);
        $totalAmount = $nightlyRate * $nights + $cleaningFee + $serviceFee;

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
        $cardLastFour = null;
        if ($request->filled('card_last_four')) {
            $cardLastFour = preg_replace('/\D/', '', $request->input('card_last_four'));
            $cardLastFour = strlen($cardLastFour) >= 4 ? substr($cardLastFour, -4) : null;
        }

        Booking::create([
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
            'payment_method' => $request->input('payment_method', 'credit_card'),
            'card_last_four' => $cardLastFour,
        ]);

        return redirect()->route('confirmation', [
            'property_id' => $property->id,
            'checkin' => $validated['checkin'],
            'checkout' => $validated['checkout'],
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Enums\PropertyStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

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
}

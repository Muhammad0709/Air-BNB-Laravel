<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Property;
use App\Enums\CancellationPolicy;
use App\Enums\PropertyStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ConfirmationController extends Controller
{
    public function index(Request $request)
    {
        $propertyId = $request->query('property_id');
        $checkin = $request->query('checkin');
        $checkout = $request->query('checkout');

        if (! $propertyId) {
            return redirect()->route('home')->with('error', __('confirmation.no_booking_data'));
        }

        $property = Property::withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->where('status', 'Active')
            ->where('approval_status', PropertyStatus::APPROVED)
            ->find($propertyId);

        if (! $property) {
            return redirect()->route('home')->with('error', __('confirmation.property_not_found'));
        }

        $today = Carbon::today()->format('Y-m-d');
        $defaultCheckout = Carbon::today()->addDays(7)->format('Y-m-d');
        $checkin = $checkin && preg_match('/^\d{4}-\d{2}-\d{2}$/', $checkin) ? $checkin : $today;
        $checkout = $checkout && preg_match('/^\d{4}-\d{2}-\d{2}$/', $checkout) ? $checkout : $defaultCheckout;
        try {
            if (Carbon::parse($checkout)->lte(Carbon::parse($checkin))) {
                $checkout = Carbon::parse($checkin)->addDay()->format('Y-m-d');
            }
        } catch (\Exception $e) {
            $checkout = Carbon::parse($checkin)->addDay()->format('Y-m-d');
        }

        $start = Carbon::parse($checkin);
        $end = Carbon::parse($checkout);
        $nights = max(1, (int) $start->diffInDays($end));

        $pricePerNight = (float) $property->price;
        $cleaningFee = 25.0;
        $serviceFeePercent = 10;
        $subtotal = round($pricePerNight * $nights, 2);
        $serviceFee = round($subtotal * ($serviceFeePercent / 100), 2);
        $totalAmount = round($subtotal + $cleaningFee + $serviceFee, 2);

        $costs = [
            ['label' => number_format($pricePerNight, 0) . ' × ' . $nights . ' night' . ($nights !== 1 ? 's' : ''), 'amount' => $subtotal],
            ['label' => 'Cleaning fee', 'amount' => $cleaningFee],
            ['label' => 'Service fee', 'amount' => $serviceFee],
        ];

        $rules = [
            'Check-in: 3:00 PM - 10:00 PM',
            'Check-out: 11:00 AM',
            'No parties or events allowed',
            'Pets allowed (with prior notification)',
            'No smoking indoors',
        ];

        $cancellationPolicy = CancellationPolicy::tryFrom($property->cancellation_policy ?? '') ?? CancellationPolicy::MODERATE;
        $depositAmount = (float) ($property->deposit_amount ?? 0);

        $bookingReference = null;
        $bookingStatus = null;
        $bookingId = $request->query('booking');
        if ($bookingId) {
            $booking = Booking::where('id', $bookingId)
                ->where('property_id', $propertyId)
                ->first(['reference', 'status']);
            $bookingReference = $booking?->reference;
            $bookingStatus = $booking?->status->value;
        }

        $image = $property->getPrimaryImageUrl() ?? '/images/popular-stay-1.svg';
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

        return Inertia::render('Confirmation', [
            'property' => $propertyData,
            'nights' => $nights,
            'checkin' => $checkin,
            'checkout' => $checkout,
            'costs' => $costs,
            'totalAmount' => $totalAmount,
            'rules' => $rules,
            'cancellationPolicy' => $cancellationPolicy->value,
            'cancellationPolicyDescription' => $cancellationPolicy->description(),
            'bookingReference' => $bookingReference,
            'bookingStatus' => $bookingStatus,
            'depositAmount' => $depositAmount,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Property;
use App\Enums\CancellationPolicy;
use App\Enums\PropertyStatus;
use App\Support\StayNights;
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

        $bookingId = $request->query('booking');
        $booking = $bookingId
            ? Booking::where('id', $bookingId)->where('property_id', $propertyId)->first(['id', 'reference', 'status', 'total_amount', 'check_in_date', 'check_out_date'])
            : null;

        $today = Carbon::today()->format('Y-m-d');
        $hasSavedDates = StayNights::between($property->check_in_date, $property->check_out_date)
            && $property->check_in_date->gte(Carbon::today());
        $defaultCheckin = $hasSavedDates ? $property->check_in_date->format('Y-m-d') : $today;
        $defaultCheckout = $hasSavedDates
            ? $property->check_out_date->format('Y-m-d')
            : Carbon::parse($defaultCheckin)->addDay()->format('Y-m-d');

        if ($booking && StayNights::between($booking->check_in_date, $booking->check_out_date)) {
            $checkin = $booking->check_in_date->format('Y-m-d');
            $checkout = $booking->check_out_date->format('Y-m-d');
        } elseif (! StayNights::between($checkin, $checkout)) {
            $checkin = $defaultCheckin;
            $checkout = $defaultCheckout;
        }
        try {
            if (Carbon::parse($checkout)->lte(Carbon::parse($checkin))) {
                $checkout = Carbon::parse($checkin)->addDay()->format('Y-m-d');
            }
        } catch (\Exception $e) {
            $checkout = Carbon::parse($checkin)->addDay()->format('Y-m-d');
        }

        $start = Carbon::parse($checkin);
        $end = Carbon::parse($checkout);
        $nights = StayNights::between($start, $end) ?? 1;

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
        $bookingStatus    = null;
        $paymentMethod    = $request->query('payment_method', 'cod');
        $mpesaPhone       = $request->query('mpesa_phone');

        if ($booking) {
            $bookingReference = $booking?->reference;
            $bookingStatus    = $booking?->status->value;
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
            'property'                    => $propertyData,
            'nights'                      => $nights,
            'checkin'                     => $checkin,
            'checkout'                    => $checkout,
            'costs'                       => $costs,
            'totalAmount'                 => $totalAmount,
            'rules'                       => $rules,
            'cancellationPolicy'          => $cancellationPolicy->value,
            'cancellationPolicyDescription' => $cancellationPolicy->description(),
            'bookingReference'            => $bookingReference,
            'bookingStatus'               => $bookingStatus,
            'depositAmount'               => $depositAmount,
            'bookingId'                   => $bookingId ? (int) $bookingId : null,
            'paymentMethod'               => $paymentMethod,
            'mpesaPhone'                  => $mpesaPhone,
        ]);
    }
}

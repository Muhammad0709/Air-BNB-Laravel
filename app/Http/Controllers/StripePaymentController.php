<?php

namespace App\Http\Controllers;

use App\Enums\BookingStatus;
use App\Enums\DepositStatus;
use App\Enums\PaymentStatus;
use App\Enums\UserType;
use App\Models\Booking;
use App\Models\Property;
use App\Models\PropertyBlockedDate;
use App\Models\User;
use App\Services\StripeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Checkout\Session;

class StripePaymentController extends Controller
{
    /**
     * Browser redirect back from Stripe after a successful payment.
     * The webhook is the source of truth, but we also finalize here (idempotently)
     * since webhook delivery can lag behind the browser redirect.
     */
    public function success(Request $request, StripeService $stripe)
    {
        $sessionId = $request->query('session_id');

        if (! $sessionId) {
            return redirect('/')->with('error', __('booking.payment_missing_session'));
        }

        $session = $stripe->retrieveSession($sessionId);

        if ($session->payment_status !== 'paid') {
            return redirect('/')->with('error', __('booking.payment_not_completed'));
        }

        $booking = $this->finalizeBooking($session, $stripe);

        if (! $booking) {
            return redirect('/')->with('error', __('booking.payment_dates_unavailable'));
        }

        return redirect()->route('confirmation', [
            'property_id' => $booking->property_id,
            'checkin' => $booking->check_in_date->format('Y-m-d'),
            'checkout' => $booking->check_out_date->format('Y-m-d'),
            'booking' => $booking->id,
        ]);
    }

    /**
     * Guest cancelled or abandoned Stripe Checkout. No booking was ever created.
     */
    public function cancel(Request $request)
    {
        return redirect()->route('booking', [
            'property_id' => $request->query('property_id'),
            'checkin' => $request->query('checkin'),
            'checkout' => $request->query('checkout'),
        ])->with('error', __('booking.payment_cancelled'));
    }

    /**
     * Stripe webhook: source of truth for payment confirmation.
     */
    public function webhook(Request $request, StripeService $stripe)
    {
        try {
            $event = $stripe->constructWebhookEvent($request->getContent(), $request->header('Stripe-Signature', ''));
        } catch (\Exception $e) {
            Log::warning('Stripe webhook signature verification failed', ['error' => $e->getMessage()]);

            return response('Invalid signature', 400);
        }

        if ($event->type === 'checkout.session.completed') {
            $session = $event->data->object;

            if ($session->payment_status === 'paid') {
                $this->finalizeBooking($session, $stripe);
            }
        }

        return response('OK', 200);
    }

    /**
     * Create the Booking row from a paid Checkout Session, idempotently.
     * Re-validates availability at the moment payment succeeded (time has passed
     * since the guest started checkout); refunds automatically on conflict.
     */
    private function finalizeBooking(Session $session, StripeService $stripe): ?Booking
    {
        $existing = Booking::where('stripe_checkout_session_id', $session->id)->first();
        if ($existing) {
            return $existing;
        }

        $meta = $session->metadata;
        $propertyId = (int) $meta->property_id;
        $checkin = $meta->check_in_date;
        $checkout = $meta->check_out_date;

        $property = Property::find($propertyId);
        if (! $property) {
            return null;
        }

        $overlapsBooking = Booking::where('property_id', $propertyId)
            ->whereIn('status', [BookingStatus::PENDING->value, BookingStatus::CONFIRMED->value])
            ->whereDate('check_in_date', '<', $checkout)
            ->whereDate('check_out_date', '>', $checkin)
            ->exists();

        $overlapsBlockedDate = PropertyBlockedDate::where('property_id', $propertyId)
            ->whereDate('start_date', '<', $checkout)
            ->whereDate('end_date', '>=', $checkin)
            ->exists();

        if ($overlapsBooking || $overlapsBlockedDate) {
            if ($session->payment_intent) {
                $stripe->refund($session->payment_intent);
            }
            Log::warning('Stripe payment succeeded but dates became unavailable; refunded automatically.', [
                'session_id' => $session->id,
                'property_id' => $propertyId,
            ]);

            return null;
        }

        $depositAmount = (float) $meta->deposit_amount;

        $booking = Booking::create([
            'property_id' => $propertyId,
            'user_id' => (int) $meta->user_id,
            'name' => $meta->name,
            'email' => $meta->email,
            'phone_code' => $meta->phone_code,
            'phone' => $meta->phone,
            'rooms' => (int) $meta->rooms,
            'adults' => (int) $meta->adults,
            'children' => (int) $meta->children,
            'check_in_date' => $checkin,
            'check_out_date' => $checkout,
            'nights' => (int) $meta->nights,
            'nightly_rate' => (float) $meta->nightly_rate,
            'cleaning_fee' => (float) $meta->cleaning_fee,
            'service_fee' => (float) $meta->service_fee,
            'total_amount' => (float) $meta->total_amount,
            'deposit_amount' => $depositAmount,
            'deposit_status' => $depositAmount > 0 ? DepositStatus::HELD->value : null,
            'status' => BookingStatus::PENDING->value,
            'payment_status' => PaymentStatus::PAID->value,
            'stripe_checkout_session_id' => $session->id,
            'stripe_payment_intent_id' => $session->payment_intent,
        ]);

        $host = $property->user;
        if ($host) {
            event(new \App\Events\NotificationEvent($booking, 'booking_created', ['host' => $host]));
        }

        $admins = User::where('type', UserType::ADMIN->value)->get();
        if ($admins->isNotEmpty()) {
            event(new \App\Events\NotificationEvent($booking, 'booking_created', ['admins' => $admins]));
        }

        return $booking;
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\MpesaTransaction;
use App\Services\MpesaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MpesaController extends Controller
{
    public function __construct(protected MpesaService $mpesa) {}

    /**
     * Initiate STK Push for a booking.
     * Called via POST /mpesa/pay
     * Expects: { booking_id, phone }
     */
    public function initiate(Request $request)
    {
        $request->validate([
            'booking_id' => ['required', 'integer', 'exists:bookings,id'],
            'phone'      => ['required', 'string', 'min:9', 'max:15'],
        ]);

        $booking = Booking::findOrFail($request->booking_id);

        // Prevent duplicate STK push if already paid
        if (in_array($booking->status->value, \App\Enums\BookingStatus::paid(), true)) {
            return response()->json([
                'success' => false,
                'message' => 'Booking is already paid.',
            ], 422);
        }

        // Check for a recent pending transaction (avoid duplicate pushes)
        $recent = MpesaTransaction::where('booking_id', $booking->id)
            ->whereNull('result_code')
            ->where('created_at', '>=', now()->subMinutes(2))
            ->exists();

        if ($recent) {
            return response()->json([
                'success' => false,
                'message' => 'A payment request was already sent. Please check your phone.',
            ], 422);
        }

        try {
            $result = $this->mpesa->lipaNaMpesaOnline(
                phoneNumber: $request->phone,
                amount: (float) $booking->total_amount,
                bookingId: $booking->id,
            );

            return response()->json([
                'success'             => true,
                'message'             => 'STK Push sent! Check your phone to confirm payment.',
                'checkout_request_id' => $result['CheckoutRequestID'] ?? null,
            ]);
        } catch (\Exception $e) {
            Log::error('MpesaController@initiate error', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Callback from Safaricom Daraja after payment.
     * POST /mpesa/callback  (no CSRF — exempt in VerifyCsrfToken)
     */
    public function callback(Request $request)
    {
        $payload = $request->all();
        Log::info('M-Pesa callback received', $payload);

        $this->mpesa->processCallback($payload);

        // Daraja expects a 200 JSON acknowledgement
        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
    }

    /**
     * Poll payment status for a booking.
     * GET /mpesa/status/{bookingId}
     * Frontend calls this every few seconds to check if payment succeeded.
     */
    public function status(int $bookingId)
    {
        $booking = Booking::select('id', 'status', 'reference')->findOrFail($bookingId);

        $transaction = MpesaTransaction::where('booking_id', $bookingId)
            ->latest()
            ->first(['result_code', 'result_desc', 'mpesa_receipt_number', 'checkout_request_id']);

        $paid = in_array($booking->status->value, \App\Enums\BookingStatus::paid(), true);

        return response()->json([
            'booking_status'       => $booking->status->value,
            'booking_reference'    => $booking->reference,
            'paid'                 => $paid,
            'result_code'          => $transaction?->result_code,
            'result_desc'          => $transaction?->result_desc,
            'mpesa_receipt_number' => $transaction?->mpesa_receipt_number,
            'checkout_request_id'  => $transaction?->checkout_request_id,
        ]);
    }
}

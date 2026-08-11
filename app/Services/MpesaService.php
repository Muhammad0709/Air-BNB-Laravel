<?php

namespace App\Services;

use App\Models\MpesaTransaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MpesaService
{
    private string $consumerKey;
    private string $consumerSecret;
    private string $shortcode;
    private string $passkey;
    private string $initiator;
    private string $initiatorPassword;
    private string $environment;

    public function __construct()
    {
        $this->consumerKey      = config('mpesa.consumer_key', '');
        $this->consumerSecret   = config('mpesa.consumer_secret', '');
        $this->shortcode        = config('mpesa.shortcode', '174379');
        $this->passkey          = config('mpesa.passkey', '');
        $this->initiator        = config('mpesa.initiator', 'testapi');
        $this->initiatorPassword = config('mpesa.initiator_password', '');
        $this->environment      = config('mpesa.environment', 'sandbox');
    }

    /**
     * Sandbox or production base URL.
     */
    public function getBaseUrl(): string
    {
        return $this->environment === 'production'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';
    }

    /**
     * Generate STK Push password: base64(shortcode + passkey + timestamp)
     * Returns ['password' => ..., 'timestamp' => ...]
     */
    public function generatePassword(): array
    {
        $timestamp   = now()->format('YmdHis');
        $rawPassword = $this->shortcode . $this->passkey . $timestamp;
        $password    = base64_encode($rawPassword);

        return [
            'password'  => $password,
            'timestamp' => $timestamp,
        ];
    }

    /**
     * OAuth2 access token from Daraja.
     */
    public function getAccessToken(): string
    {
        $response = Http::withBasicAuth($this->consumerKey, $this->consumerSecret)
            ->get($this->getBaseUrl() . '/oauth/v1/generate', ['grant_type' => 'client_credentials']);

        if ($response->failed()) {
            Log::error('M-Pesa: token request failed', ['body' => $response->body()]);
            throw new \Exception('Failed to get M-Pesa access token: ' . $response->body());
        }

        $token = $response->json('access_token');
        if (! $token) {
            throw new \Exception('M-Pesa access token missing in response: ' . $response->body());
        }

        return $token;
    }

    /**
     * Initiate STK Push (Lipa Na M-Pesa Online).
     * Returns the full Daraja response array.
     */
    public function lipaNaMpesaOnline(string $phoneNumber, float $amount, int $bookingId): array
    {
        $accessToken = $this->getAccessToken();
        $pw          = $this->generatePassword();

        $callbackUrl = url('/mpesa/callback');   // absolute URL, no named route needed yet

        $response = Http::withToken($accessToken)
            ->post($this->getBaseUrl() . '/mpesa/stkpush/v1/processrequest', [
                'BusinessShortCode' => $this->shortcode,
                'Password'          => $pw['password'],
                'Timestamp'         => $pw['timestamp'],
                'TransactionType'   => 'CustomerPayBillOnline',
                'Amount'            => (int) ceil($amount),   // M-Pesa requires integer
                'PartyA'            => $this->formatPhoneNumber($phoneNumber),
                'PartyB'            => $this->shortcode,
                'PhoneNumber'       => $this->formatPhoneNumber($phoneNumber),
                'CallBackURL'       => $callbackUrl,
                'AccountReference'  => 'BOOKING' . $bookingId,
                'TransactionDesc'   => 'Booking Payment #' . $bookingId,
            ]);

        $result = $response->json() ?? [];

        Log::info('M-Pesa STK Push response', $result);

        // Daraja returns ResponseCode = "0" (string) on success
        $responseCode = $result['ResponseCode'] ?? null;
        if ($response->failed() || (string) $responseCode !== '0') {
            $errorMessage = $result['errorMessage']
                ?? $result['ResultDesc']
                ?? $result['ResponseDescription']
                ?? 'STK Push failed';
            Log::error('M-Pesa STK Push failed', $result);
            throw new \Exception($errorMessage);
        }

        // Persist the pending transaction — callback will update it
        MpesaTransaction::create([
            'booking_id'          => $bookingId,
            'merchant_request_id' => $result['MerchantRequestID'],
            'checkout_request_id' => $result['CheckoutRequestID'],
            'phone_number'        => $phoneNumber,
            'amount'              => $amount,
        ]);

        return $result;
    }

    /**
     * Format phone to international format: 2547XXXXXXXX
     */
    public function formatPhoneNumber(string $phone): string
    {
        // Strip all non-digits
        $phone = preg_replace('/[^0-9]/', '', $phone);

        if (str_starts_with($phone, '254')) {
            return $phone;                      // already 254XXXXXXXXX
        }

        if (str_starts_with($phone, '0')) {
            return '254' . substr($phone, 1);   // 07XX → 2547XX
        }

        if (str_starts_with($phone, '7') || str_starts_with($phone, '1')) {
            return '254' . $phone;              // 7XX → 2547XX
        }

        return $phone;
    }

    /**
     * Process the callback payload from Daraja and update the transaction record.
     * Returns true on success, false on failure.
     */
    public function processCallback(array $callbackData): bool
    {
        try {
            $body        = $callbackData['Body']['stkCallback'] ?? $callbackData;
            $merchantId  = $body['MerchantRequestID'] ?? null;
            $checkoutId  = $body['CheckoutRequestID'] ?? null;
            $resultCode  = $body['ResultCode'] ?? null;
            $resultDesc  = $body['ResultDesc'] ?? null;

            $transaction = MpesaTransaction::where('checkout_request_id', $checkoutId)
                ->orWhere('merchant_request_id', $merchantId)
                ->first();

            if (! $transaction) {
                Log::warning('M-Pesa callback: transaction not found', compact('checkoutId', 'merchantId'));
                return false;
            }

            $updateData = [
                'result_code' => (string) $resultCode,
                'result_desc' => $resultDesc,
            ];

            // ResultCode 0 = success
            if ((string) $resultCode === '0') {
                $items = collect($body['CallbackMetadata']['Item'] ?? []);

                $mpesaCode = $items->firstWhere('Name', 'MpesaReceiptNumber')['Value'] ?? null;
                $txDate    = $items->firstWhere('Name', 'TransactionDate')['Value'] ?? null;
                $amount    = $items->firstWhere('Name', 'Amount')['Value'] ?? null;

                $updateData['mpesa_receipt_number'] = $mpesaCode;
                $updateData['transaction_date']     = $txDate
                    ? \Carbon\Carbon::createFromFormat('YmdHis', (string) $txDate)
                    : null;

                if ($amount) {
                    $updateData['amount'] = $amount;
                }

                // Mark booking as confirmed
                $transaction->booking?->update([
                    'status' => \App\Enums\BookingStatus::CONFIRMED->value,
                ]);

                Log::info('M-Pesa payment confirmed', ['receipt' => $mpesaCode, 'booking_id' => $transaction->booking_id]);
            } else {
                Log::warning('M-Pesa payment failed/cancelled', compact('resultCode', 'resultDesc'));
            }

            $transaction->update($updateData);

            return (string) $resultCode === '0';
        } catch (\Throwable $e) {
            Log::error('M-Pesa callback processing error', ['error' => $e->getMessage()]);
            return false;
        }
    }
}

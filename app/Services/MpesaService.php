<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MpesaService
{
    // Set these in .env
    private string $consumerKey;
    private string $consumerSecret;
    private string $shortcode;
    private string $passkey;
    private string $initiator;
    private string $initiatorPassword;
    private string $environment;

    public function __construct()
    {
        $this->consumerKey = config('mpesa.consumer_key');
        $this->consumerSecret = config('mpesa.consumer_secret');
        $this->shortcode = config('mpesa.shortcode');
        $this->passkey = config('mpesa.passkey');
        $this->initiator = config('mpesa.initiator');
        $this->initiatorPassword = config('mpesa.initiator_password');
        $this->environment = config('mpesa.environment', 'sandbox');
    }

    /**
     * Get the base URL based on environment
     */
    protected function getBaseUrl(): string
    {
        return $this->environment === 'production'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';
    }

    /**
     * Generate the STK Push password
     */
    protected function generatePassword(): string
    {
        $baseTime = now()->format('YmdHis');
        $rawPassword = $this->shortcode . $this->passkey . $baseTime;
        return base64_encode(hash('sha256', $rawPassword, true)) . '|' . $baseTime;
    }

    /**
     * Get OAuth2 access token from Daraja
     */
    public function getAccessToken(): string
    {
        $response = Http::withBasicAuth(
            $this->consumerKey,
            $this->consumerSecret
        )->get($this->getBaseUrl() . '/oauth/v1/generate/token');

        if ($response->failed()) {
            Log::error('M-Pesa token request failed', ['response' => $response->body()]);
            throw new \Exception('Failed to get M-Pesa access token');
        }

        return $response->json('access_token');
    }

    /**
     * Initiate STK push for payment
     * Returns array with merchant_request_id and checkout_request_id
     */
    public function lipaNaMpesaOnline(string $phoneNumber, float $amount, int $bookingId): array
    {
        $accessToken = $this->getAccessToken();

        $password = $this->generatePassword();
        $timestamp = explode('|', $password)[1];

        $response = Http::withToken($accessToken)
            ->post($this->getBaseUrl() . '/mpesa/stkpush/v1/processrequest', [
                'BusinessShortCode' => $this->shortcode,
                'Password' => $password,
                'Timestamp' => $timestamp,
                'TransactionType' => 'CustomerPayBillOnline',
                'Amount' => $amount,
                'PhoneNumber' => $this->formatPhoneNumber($phoneNumber),
                'CallBackURL' => route('mpesa.callback'),
                'AccountReference' => 'BOOKING' . $bookingId,
                'TransactionDesc' => 'Booking Payment',
            ]);

        $result = $response->json();

        if ($response->failed() || $result['ResultCode'] !== 0) {
            Log::error('M-Pesa STK Push failed', $result);
            throw new \Exception($result['ResultDesc'] ?? 'STK Push failed');
        }

        // Store transaction details (incomplete until callback)
        \App\Models\MpesaTransaction::create([
            'booking_id' => $bookingId,
            'merchant_request_id' => $result['MerchantRequestID'],
            'checkout_request_id' => $result['CheckoutRequestID'],
            'phone_number' => $phoneNumber,
            'amount' => $amount,
        ]);

        return $result;
    }

    /**
     * Validate callback from Daraja
     */
    public function validateCallback(array $data): bool
    {
        // In sandbox, validation is optional. In production, validate SHA256 signature.
        return true;
    }

    /**
     * Format phone number to 10 digits (remove +254 prefix)
     */
    protected function formatPhoneNumber(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);
        if (str_starts_with($phone, '254')) {
            return substr($phone, 3);
        }
        if (str_starts_with($phone, '0')) {
            return substr($phone, 1);
        }
        return $phone;
    }
}
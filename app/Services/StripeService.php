<?php

namespace App\Services;

use Stripe\Checkout\Session;
use Stripe\StripeClient;
use Stripe\Webhook;

class StripeService
{
    private ?StripeClient $client = null;

    public function isConfigured(): bool
    {
        return filled(config('services.stripe.secret')) && filled(config('services.stripe.key'));
    }

    private function client(): StripeClient
    {
        abort_unless($this->isConfigured(), 503, 'Payments are not configured yet. Please contact the site administrator.');

        return $this->client ??= new StripeClient(config('services.stripe.secret'));
    }

    /**
     * Create a one-time-payment Checkout Session for a booking that has not been
     * created yet. The booking is only inserted once payment actually succeeds
     * (see StripeWebhookController), so we thread everything needed to build it
     * through as session metadata rather than a foreign key.
     *
     * @param  array<string, string>  $metadata
     */
    public function createBookingCheckoutSession(
        array $metadata,
        float $totalAmount,
        string $propertyTitle,
        string $successUrl,
        string $cancelUrl
    ): Session {
        return $this->client()->checkout->sessions->create([
            'mode' => 'payment',
            'payment_method_types' => ['card'],
            'customer_email' => $metadata['email'] ?? null,
            'line_items' => [[
                'price_data' => [
                    'currency' => 'usd',
                    'unit_amount' => (int) round($totalAmount * 100),
                    'product_data' => [
                        'name' => $propertyTitle,
                    ],
                ],
                'quantity' => 1,
            ]],
            'metadata' => $metadata,
            'success_url' => $successUrl.'?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => $cancelUrl,
        ]);
    }

    public function retrieveSession(string $sessionId): Session
    {
        return $this->client()->checkout->sessions->retrieve($sessionId);
    }

    public function refund(string $paymentIntentId): void
    {
        $this->client()->refunds->create(['payment_intent' => $paymentIntentId]);
    }

    public function constructWebhookEvent(string $payload, string $signature): \Stripe\Event
    {
        return Webhook::constructEvent($payload, $signature, config('services.stripe.webhook_secret'));
    }
}

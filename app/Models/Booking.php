<?php

namespace App\Models;

use App\Enums\BookingStatus;
use App\Enums\DepositStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Booking extends Model
{
    protected $fillable = [
        'reference',
        'property_id',
        'user_id',
        'name',
        'email',
        'phone_code',
        'phone',
        'rooms',
        'adults',
        'children',
        'check_in_date',
        'check_out_date',
        'nights',
        'nightly_rate',
        'cleaning_fee',
        'service_fee',
        'total_amount',
        'deposit_amount',
        'deposit_status',
        'deposit_dispute_reason',
        'status',
    ];

    protected $casts = [
        'check_in_date' => 'date',
        'check_out_date' => 'date',
        'nightly_rate' => 'decimal:2',
        'cleaning_fee' => 'decimal:2',
        'service_fee' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
        'deposit_status' => DepositStatus::class,
        'rooms' => 'integer',
        'adults' => 'integer',
        'children' => 'integer',
        'nights' => 'integer',
        'status' => BookingStatus::class,
    ];

    /**
     * Derived from booking status since there's no payment gateway yet:
     * pending bookings haven't been confirmed/paid, confirmed/completed ones have,
     * cancelled ones never completed a payment.
     */
    public function getPaymentStatusAttribute(): string
    {
        if ($this->status === BookingStatus::CANCELLED) {
            return 'unpaid';
        }

        return in_array($this->status->value, BookingStatus::paid(), true) ? 'paid' : 'pending';
    }

    /**
     * Generate a unique booking reference before creation.
     */
    protected static function booted(): void
    {
        static::creating(function (Booking $booking) {
            if (empty($booking->reference)) {
                do {
                    $reference = 'BK-' . strtoupper(Str::random(8));
                } while (static::where('reference', $reference)->exists());

                $booking->reference = $reference;
            }
        });
    }

    /**
     * Get the property that this booking belongs to.
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    /**
     * Get the user that made this booking.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the host's review of the guest for this booking, if one exists.
     */
    public function guestReview(): HasOne
    {
        return $this->hasOne(GuestReview::class);
    }

    /**
     * Get notification templates for booking events
     */
    public static function getNotificationTemplates(): array
    {
        return [
            'booking_created' => [
                'host' => [
                    'title' => __('notifications.booking_created.host.title'),
                    'body' => __('notifications.booking_created.host.body'),
                    'image' => null,
                ],
                'admin' => [
                    'title' => __('notifications.booking_created.admin.title'),
                    'body' => __('notifications.booking_created.admin.body'),
                    'image' => null,
                ],
            ],
            'booking_confirmed' => [
                'user' => [
                    'title' => __('notifications.booking_confirmed.user.title'),
                    'body' => __('notifications.booking_confirmed.user.body'),
                    'image' => null,
                ],
            ],
            'booking_completed' => [
                'user' => [
                    'title' => __('notifications.booking_completed.user.title'),
                    'body' => __('notifications.booking_completed.user.body'),
                    'image' => null,
                ],
            ],
            'booking_cancelled' => [
                'user' => [
                    'title' => __('notifications.booking_cancelled.user.title'),
                    'body' => __('notifications.booking_cancelled.user.body'),
                    'image' => null,
                ],
            ],
        ];
    }

    /**
     * Get placeholders for notification templates
     */
    public function getNotificationPlaceholders($recipient, $recipientType): array
    {
        $property = $this->property;
        
        return [
            '{guest_name}' => $this->name,
            '{property_title}' => $property ? $property->title : 'Property',
            '{check_in_date}' => $this->check_in_date->format('M d, Y'),
            '{check_out_date}' => $this->check_out_date->format('M d, Y'),
            '{nights}' => $this->nights,
            '{total_amount}' => number_format($this->total_amount, 2),
        ];
    }
}

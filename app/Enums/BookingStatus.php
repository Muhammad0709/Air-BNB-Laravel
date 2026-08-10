<?php

namespace App\Enums;

enum BookingStatus: string
{
    case PENDING = 'pending';
    case WAITING_FOR_DELIVERY_PAYMENT = 'waiting_for_delivery_payment';
    case CONFIRMED = 'confirmed';
    case PAID = 'paid';
    case CANCELLED = 'cancelled';
    case COMPLETED = 'completed';

    /**
     * Statuses that count as paid/revenue.
     */
    public static function paid(): array
    {
        return [self::CONFIRMED->value, self::PAID->value, self::COMPLETED->value];
    }

    /**
     * Statuses that count as upcoming (not yet stayed).
     */
    public static function upcoming(): array
    {
        return [self::PENDING->value, self::CONFIRMED->value, self::WAITING_FOR_DELIVERY_PAYMENT->value];
    }

    /**
     * Statuses that count as past (stayed or cancelled).
     */
    public static function past(): array
    {
        return [self::COMPLETED->value, self::CANCELLED->value];
    }

    /**
     * Human-readable label for the status.
     */
    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::WAITING_FOR_DELIVERY_PAYMENT => 'Waiting for Delivery Payment',
            self::CONFIRMED => 'Confirmed',
            self::PAID => 'Paid',
            self::CANCELLED => 'Cancelled',
            self::COMPLETED => 'Completed',
        };
    }

    /**
     * All values for validation rules.
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
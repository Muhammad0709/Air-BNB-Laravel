<?php

namespace App\Enums;

enum BookingStatus: string
{
    case PENDING                = 'pending';
    case AWAITING_HOST_RESPONSE = 'awaiting_host_response';
    case AWAITING_PAYMENT       = 'awaiting_payment';
    case CONFIRMED              = 'confirmed';
    case CANCELLED              = 'cancelled';
    case COMPLETED              = 'completed';
    case EXPIRED                = 'expired';
    case REFUNDED               = 'refunded';
    case DISPUTED               = 'disputed';

    /** Statuses that count as paid / revenue. */
    public static function paid(): array
    {
        return [
            self::CONFIRMED->value,
            self::COMPLETED->value,
        ];
    }

    /** Statuses that count as "upcoming" (not yet stayed / in progress). */
    public static function upcoming(): array
    {
        return [
            self::PENDING->value,
            self::AWAITING_HOST_RESPONSE->value,
            self::AWAITING_PAYMENT->value,
            self::CONFIRMED->value,
        ];
    }

    /** Statuses that count as "past" (stay finished or booking terminated). */
    public static function past(): array
    {
        return [
            self::COMPLETED->value,
            self::CANCELLED->value,
            self::EXPIRED->value,
            self::REFUNDED->value,
            self::DISPUTED->value,
        ];
    }

    /** Terminal / resolved statuses. */
    public static function terminal(): array
    {
        return [
            self::COMPLETED->value,
            self::CANCELLED->value,
            self::EXPIRED->value,
            self::REFUNDED->value,
            self::DISPUTED->value,
        ];
    }

    /** All values for validation rules. */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /** Human-readable label for the status. */
    public function label(): string
    {
        return match ($this) {
            self::PENDING                => 'Pending',
            self::AWAITING_HOST_RESPONSE => 'Awaiting Host Response',
            self::AWAITING_PAYMENT       => 'Awaiting Payment',
            self::CONFIRMED              => 'Confirmed',
            self::CANCELLED              => 'Cancelled',
            self::COMPLETED              => 'Completed',
            self::EXPIRED                => 'Expired',
            self::REFUNDED               => 'Refunded',
            self::DISPUTED               => 'Disputed',
        };
    }

    /** Hex color for badge display. */
    public function color(): string
    {
        return match ($this) {
            self::PENDING                => '#F59E0B',
            self::AWAITING_HOST_RESPONSE => '#F97316',
            self::AWAITING_PAYMENT       => '#EAB308',
            self::CONFIRMED              => '#10B981',
            self::CANCELLED              => '#EF4444',
            self::COMPLETED              => '#6366F1',
            self::EXPIRED                => '#9CA3AF',
            self::REFUNDED               => '#3B82F6',
            self::DISPUTED               => '#8B5CF6',
        };
    }
}

<?php

namespace App\Enums;

enum BookingStatus: string
{
    case PENDING = 'pending';
    case CONFIRMED = 'confirmed';
    case CANCELLED = 'cancelled';
    case COMPLETED = 'completed';

    /**
     * Statuses that count as paid/revenue.
     */
    public static function paid(): array
    {
        return [self::CONFIRMED->value, self::COMPLETED->value];
    }

    /**
     * Statuses that count as upcoming (not yet stayed).
     */
    public static function upcoming(): array
    {
        return [self::PENDING->value, self::CONFIRMED->value];
    }

    /**
     * All values for validation rules.
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

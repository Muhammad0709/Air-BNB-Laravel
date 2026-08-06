<?php

namespace App\Enums;

enum CancellationPolicy: string
{
    case FLEXIBLE = 'flexible';
    case MODERATE = 'moderate';
    case STRICT = 'strict';

    public function label(): string
    {
        return match ($this) {
            self::FLEXIBLE => 'Flexible',
            self::MODERATE => 'Moderate',
            self::STRICT => 'Strict',
        };
    }

    /**
     * Guest-facing description of what the policy means.
     */
    public function description(): string
    {
        return match ($this) {
            self::FLEXIBLE => 'Full refund if cancelled at least 24 hours before check-in.',
            self::MODERATE => 'Full refund if cancelled at least 5 days before check-in.',
            self::STRICT => 'Full refund if cancelled within 48 hours of booking, and at least 14 days before check-in.',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

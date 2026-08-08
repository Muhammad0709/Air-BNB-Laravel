<?php

namespace App\Enums;

enum DepositStatus: string
{
    case HELD = 'held';
    case RETURNED = 'returned';
    case DISPUTED = 'disputed';

    public function label(): string
    {
        return match ($this) {
            self::HELD => 'Held',
            self::RETURNED => 'Returned',
            self::DISPUTED => 'Disputed',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

<?php

namespace App\Enums;

enum ListingCategory: string
{
    case STAY = 'stay';
    case EXPERIENCE = 'experience';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

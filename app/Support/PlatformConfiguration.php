<?php

namespace App\Support;

use App\Enums\PropertyType;
use App\Models\Setting;
use Throwable;

final class PlatformConfiguration
{
    private static function defaults(string $key): array
    {
        return match ($key) {
            'countries' => ['KE', 'TZ', 'UG', 'NG', 'ZA'],
            'languages' => ['en', 'ar', 'ur', 'fa', 'tr', 'ku'],
            'currencies' => config('currencies.supported', ['USD']),
            'property_types' => array_column(PropertyType::cases(), 'value'),
            'amenities' => ['WiFi', 'Pool', 'Parking', 'Air conditioning', 'Kitchen'],
            default => [],
        };
    }

    public static function list(string $key, ?array $default = null): array
    {
        $default ??= self::defaults($key);

        try {
            $value = Setting::get($key);
        } catch (Throwable) {
            $value = null;
        }

        if (! is_string($value) || trim($value) === '') {
            return $default;
        }

        $values = array_values(array_unique(array_filter(array_map('trim', preg_split('/[,\n]+/', $value) ?: []))));

        return $values ?: $default;
    }

    public static function text(string $key): string
    {
        return implode(', ', self::list($key));
    }

    public static function propertyTypes(): array
    {
        return array_map('strtolower', self::list('property_types'));
    }

    public static function amenities(): array
    {
        return self::list('amenities');
    }
}

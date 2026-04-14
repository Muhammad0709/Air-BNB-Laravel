<?php

namespace App\Support;

/**
 * Supported display / profile currency codes (ISO 4217).
 *
 * @see config/currencies.php and env SUPPORTED_CURRENCIES
 */
final class SupportedCurrencies
{
    /**
     * @return list<string>
     */
    public static function codes(): array
    {
        $raw = config('currencies.supported', ['USD']);
        if (! is_array($raw) || $raw === []) {
            return ['USD'];
        }

        $normalized = array_values(array_unique(array_filter(array_map(
            static fn (mixed $c): string => strtoupper(trim((string) $c)),
            $raw
        ))));

        return $normalized !== [] ? $normalized : ['USD'];
    }
}

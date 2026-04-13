<?php

namespace App\Support;

/**
 * Allowed user profile / display currency codes (3-letter ISO).
 * Keep in sync with resources/js/utils/currency.ts (CurrencyCode).
 */
final class SupportedCurrencies
{
    public const CODES = ['IQD', 'TRY', 'PKR', 'EUR', 'USD', 'GBP'];
}

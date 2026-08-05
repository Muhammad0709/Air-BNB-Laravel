<?php

$default = 'IQD,TRY,PKR,EUR,USD,GBP,SEK,NOK,DKK,CAD';
$parts = array_filter(array_map('trim', explode(',', (string) env('SUPPORTED_CURRENCIES', $default))));

return [
    /**
     * ISO 4217 codes shown in the currency picker and accepted on profile.
     * Override via env SUPPORTED_CURRENCIES (comma-separated).
     */
    'supported' => $parts !== []
        ? array_values(array_unique(array_map('strtoupper', $parts)))
        : ['USD'],
];

<?php

namespace App\Services;

use App\Support\SupportedCurrencies;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * USD-base rates (units of foreign currency per 1 USD) from a live API.
 * On API failure, uses the last successful snapshot (no hardcoded FX map).
 * Amounts in the database remain in USD.
 */
final class ExchangeRateService
{
    private const API_URL = 'https://open.er-api.com/v6/latest/USD';

    /** Short-lived cache to batch fresh API calls. */
    private const FRESH_CACHE_KEY = 'exchange_rates_fresh_v1';

    /** Last good rates from API (survives until overwritten). */
    private const LAST_GOOD_KEY = 'exchange_rates_last_good_v1';

    private const FRESH_TTL_SECONDS = 3600;

    /**
     * @return array<string, float> Use > 0 as a valid rate; 0 means unknown (client shows USD).
     */
    public function getRates(): array
    {
        return Cache::remember(self::FRESH_CACHE_KEY, self::FRESH_TTL_SECONDS, function () {
            $fetched = $this->fetchFromApi();
            if ($fetched !== null) {
                Cache::forever(self::LAST_GOOD_KEY, $fetched);

                return $fetched;
            }

            $last = Cache::get(self::LAST_GOOD_KEY);
            if (is_array($last) && $last !== []) {
                return $last;
            }

            Log::warning('Exchange rates: API failed and no last-good snapshot exists; serving USD-only.');

            return $this->usdOnlyRates();
        });
    }

    /**
     * @return array<string, float>|null
     */
    private function fetchFromApi(): ?array
    {
        try {
            $response = Http::timeout(15)
                ->retry(3, 250)
                ->acceptJson()
                ->get(self::API_URL);

            if (! $response->successful()) {
                return null;
            }

            $data = $response->json();
            if (($data['result'] ?? '') !== 'success' || ! isset($data['rates']) || ! is_array($data['rates'])) {
                return null;
            }

            $apiRates = $data['rates'];
            $lastGood = Cache::get(self::LAST_GOOD_KEY);
            $lastGood = is_array($lastGood) ? $lastGood : [];

            $out = [];
            foreach (SupportedCurrencies::codes() as $code) {
                if ($code === 'USD') {
                    $out['USD'] = 1.0;

                    continue;
                }
                if (isset($apiRates[$code]) && is_numeric($apiRates[$code])) {
                    $out[$code] = (float) $apiRates[$code];
                } elseif (isset($lastGood[$code]) && is_numeric($lastGood[$code]) && (float) $lastGood[$code] > 0) {
                    $out[$code] = (float) $lastGood[$code];
                } else {
                    $out[$code] = 0.0;
                }
            }

            if (! $this->hasAnyLiveFx($out)) {
                return null;
            }

            return $out;
        } catch (\Throwable $e) {
            Log::warning('Exchange rate fetch failed', ['message' => $e->getMessage()]);

            return null;
        }
    }

    /**
     * @param  array<string, float>  $out
     */
    private function hasAnyLiveFx(array $out): bool
    {
        foreach (SupportedCurrencies::codes() as $code) {
            if ($code === 'USD') {
                continue;
            }
            if (isset($out[$code]) && $out[$code] > 0) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return array<string, float>
     */
    private function usdOnlyRates(): array
    {
        $out = [];
        foreach (SupportedCurrencies::codes() as $code) {
            $out[$code] = $code === 'USD' ? 1.0 : 0.0;
        }

        return $out;
    }
}

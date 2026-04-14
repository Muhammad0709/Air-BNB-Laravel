<?php

namespace App\Http\Middleware;

use App\Services\ExchangeRateService;
use App\Support\SupportedCurrencies;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'errors' => fn () => $request->session()->get('errors')
                ? $request->session()->get('errors')->getBag('default')->getMessages()
                : (object) [],
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'type' => $user->type->value,
                    'phone' => $user->phone,
                    'currency' => $user->currency ?? 'USD',
                    'profile_picture' => $user->profile_picture
                        ? (filter_var($user->profile_picture, FILTER_VALIDATE_URL)
                            ? $user->profile_picture
                            : asset(Storage::url($user->profile_picture)))
                        : null,
                ] : null,
            ],
            'locale' => fn () => $request->session()->get('locale', config('app.locale', 'en')),
            /** ISO 4217 codes allowed in UI / profile (from config / env). */
            'supportedCurrencies' => fn () => SupportedCurrencies::codes(),
            /** Units of each currency per 1 USD (for display; storage stays USD). */
            'exchangeRates' => fn () => app(ExchangeRateService::class)->getRates(),
            /** Session-only host UI preview for customers (account type stays User). */
            'host_panel_preview' => fn () => $user
                ? (bool) $request->session()->get('host_panel_preview', false)
                : false,
        ];
    }
}

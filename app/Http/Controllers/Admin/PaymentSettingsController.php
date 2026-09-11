<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CountryPaymentSetting;
use App\Support\PlatformConfiguration;

class PaymentSettingsController extends Controller
{
    public function index()
    {
        $settings = CountryPaymentSetting::orderBy('country_code')->get();

        $known = $settings->pluck('country_code')->map('strtoupper')->all();

        $names = [
            'KE' => 'Kenya',
            'TZ' => 'Tanzania',
            'UG' => 'Uganda',
            'NG' => 'Nigeria',
            'ZA' => 'South Africa',
        ];
        $available = collect(PlatformConfiguration::list('countries'))
            ->mapWithKeys(fn ($code) => [$code => $names[$code] ?? $code])
            ->reject(fn ($name, $code) => in_array($code, $known, true))
            ->all();

        return view('admin.payment-settings.index', compact('settings', 'available'));
    }

    public function update(Request $request)
    {
        $request->validate([
            'country' => 'array',
            'country.*.enable_cod' => 'boolean',
            'country.*.enable_mpesa_delivery' => 'boolean',
        ]);

        foreach ($request->input('country', []) as $code => $data) {
            $setting = CountryPaymentSetting::firstOrNew('country_code', $code);
            $setting->fill([
                'enable_cod' => (bool) ($data['enable_cod'] ?? false),
                'enable_mpesa_delivery' => (bool) ($data['enable_mpesa_delivery'] ?? false),
            ]);
            $setting->save();
        }

        return redirect()
            ->route('admin.payment.settings.index')
            ->with('success', 'Payment settings saved successfully.');
    }
}

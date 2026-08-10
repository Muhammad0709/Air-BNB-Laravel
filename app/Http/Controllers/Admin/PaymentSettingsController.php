<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CountryPaymentSetting;

class PaymentSettingsController extends Controller
{
    public function index()
    {
        $settings = CountryPaymentSetting::orderBy('country_code')->get();

        // If you want a quick way to add new countries on the fly
        $known = $settings->pluck('country_code')->toArray();

        $allCountries = [
            'KE' => 'Kenya',
            'TZ' => 'Tanzania',
            'UG' => 'Uganda',
            'NG' => 'Nigeria',
            'ZA' => 'South Africa',
        ];

        $available = array_filter($allCountries, fn ($c) => !in_array($c, $known) ? $c : null, ARRAY_FILTER_USEKEY);

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
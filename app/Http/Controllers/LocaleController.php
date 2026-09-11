<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use App\Support\PlatformConfiguration;

class LocaleController extends Controller
{
    protected const ALLOWED_LOCALES = ['en', 'ar', 'ur', 'fa', 'tr', 'ku'];

    public function switch(Request $request, string $locale): \Illuminate\Http\RedirectResponse
    {
        $allowedLocales = array_values(array_intersect(
            PlatformConfiguration::list('languages', self::ALLOWED_LOCALES),
            self::ALLOWED_LOCALES
        )) ?: ['en'];

        if (! in_array($locale, $allowedLocales, true)) {
            $locale = config('app.locale', 'en');
        }

        $request->session()->put('locale', $locale);
        App::setLocale($locale);

        if ($request->user()) {
            $request->user()->update(['language' => $locale]);
        }

        return redirect()->back();
    }
}

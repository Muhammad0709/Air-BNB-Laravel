<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

class LocaleController extends Controller
{
    protected const ALLOWED_LOCALES = ['en', 'ar', 'ur', 'fa', 'tr', 'ku'];

    public function switch(Request $request, string $locale): \Illuminate\Http\RedirectResponse
    {
        if (! in_array($locale, self::ALLOWED_LOCALES)) {
            $locale = config('app.locale', 'en');
        }

        $request->session()->put('locale', $locale);
        App::setLocale($locale);

        return redirect()->back();
    }
}

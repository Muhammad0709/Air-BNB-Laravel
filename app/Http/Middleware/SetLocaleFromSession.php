<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocaleFromSession
{
    protected const ALLOWED_LOCALES = ['en', 'ar', 'ur', 'fa', 'tr', 'ku'];

    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->session()->get('locale', config('app.locale', 'en'));
        if (in_array($locale, self::ALLOWED_LOCALES)) {
            App::setLocale($locale);
        }

        return $next($request);
    }
}

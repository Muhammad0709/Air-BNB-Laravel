<!DOCTYPE html>
@php
    $rtlLocales = ['ar', 'ur', 'fa'];
    $isRtlDoc = in_array(app()->getLocale(), $rtlLocales, true);
@endphp
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="{{ $isRtlDoc ? 'rtl' : 'ltr' }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title inertia>{{ config('app.name', 'LipaBnb') }}</title>
        <meta name="google-site-verification" content="YSRuX7fcHi58eURq9yMhU3wwVG-5PYkVfOzAYN8hjU4" />
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>


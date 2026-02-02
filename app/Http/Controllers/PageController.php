<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class PageController extends Controller
{
    public function about()
    {
        return Inertia::render('About');
    }

    public function chat()
    {
        return Inertia::render('Chat');
    }

    public function customerBookings()
    {
        return Inertia::render('CustomerBookings');
    }

    public function privacyPolicy()
    {
        return Inertia::render('PrivacyPolicy');
    }

    public function terms()
    {
        return Inertia::render('TermsOfService');
    }

    public function search()
    {
        return Inertia::render('SearchResults');
    }

    public function welcome()
    {
        return Inertia::render('Welcome');
    }
}

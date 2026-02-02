<?php

namespace App\Http\Controllers\Host;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function index()
    {
        return Inertia::render('Host/Bookings/Index');
    }

    public function create()
    {
        return Inertia::render('Host/Bookings/Create');
    }

    public function show(string $id)
    {
        return Inertia::render('Host/Bookings/Show', ['id' => $id]);
    }

    public function edit(string $id)
    {
        return Inertia::render('Host/Bookings/Edit', ['id' => $id]);
    }
}

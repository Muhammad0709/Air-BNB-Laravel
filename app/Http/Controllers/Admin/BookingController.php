<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Bookings/Index');
    }

    public function create()
    {
        return Inertia::render('Admin/Bookings/Create');
    }

    public function show(string $id)
    {
        return Inertia::render('Admin/Bookings/Show', ['id' => $id]);
    }

    public function edit(string $id)
    {
        return Inertia::render('Admin/Bookings/Edit', ['id' => $id]);
    }
}

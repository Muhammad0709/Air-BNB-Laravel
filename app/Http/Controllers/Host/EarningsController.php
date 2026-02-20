<?php

namespace App\Http\Controllers\Host;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class EarningsController extends Controller
{
    public function index()
    {
        return Inertia::render('Host/Earnings/Index');
    }

    public function show(string $id)
    {
        return Inertia::render('Host/Earnings/Show', ['id' => $id]);
    }
}

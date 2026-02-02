<?php

namespace App\Http\Controllers\Host;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function index()
    {
        return Inertia::render('Host/Chat/Index');
    }
}

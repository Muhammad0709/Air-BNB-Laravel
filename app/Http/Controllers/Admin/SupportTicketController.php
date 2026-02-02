<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class SupportTicketController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/SupportTickets/Index');
    }

    public function create()
    {
        return Inertia::render('Admin/SupportTickets/Create');
    }

    public function show(string $id)
    {
        return Inertia::render('Admin/SupportTickets/Show', ['id' => $id]);
    }

    public function edit(string $id)
    {
        return Inertia::render('Admin/SupportTickets/Edit', ['id' => $id]);
    }
}

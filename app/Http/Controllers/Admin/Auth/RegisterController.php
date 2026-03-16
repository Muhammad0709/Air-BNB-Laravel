<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Auth\RegisterRequest;
use App\Models\User;
use App\Enums\UserType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class RegisterController extends Controller
{
    /**
     * Show the host registration form.
     */
    public function create()
    {
        return Inertia::render('Admin/Auth/SignUp');
    }

    /**
     * Handle an incoming host registration request.
     */
    public function store(RegisterRequest $request)
    {
        $validated = $request->validated();
        $user = User::create([
            'name' => $validated['firstName'] . ' ' . $validated['lastName'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'type' => UserType::HOST,
        ]);

        auth()->login($user);

        return redirect()->intended('/host/dashboard');
    }
}

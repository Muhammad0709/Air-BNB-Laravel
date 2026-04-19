<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use App\Enums\UserType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class RegisterController extends Controller
{
    /**
     * Show the registration form.
     */
    public function create()
    {
        return Inertia::render('Auth/SignUp');
    }

    /**
     * Handle an incoming registration request.
     */
    public function store(RegisterRequest $request)
    {
        $validated = $request->validated();
        $type = $validated['type'] === 'host' ? UserType::HOST : UserType::USER;

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'type' => $type,
        ]);

        auth()->login($user);

        $msg = __('auth.signup.toast_registered');

        return $type === UserType::HOST
            ? redirect()->intended(route('host.dashboard'))->with('success', $msg)
            : redirect()->intended('/')->with('success', $msg);
    }
}

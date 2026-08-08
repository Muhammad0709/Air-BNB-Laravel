<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LoginController extends Controller
{
    /**
     * Show the login form.
     */
    public function create(Request $request)
    {
        return Inertia::render('Auth/SignIn', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request (customer, host, and admin).
     */
    public function store(LoginRequest $request)
    {
        $request->validated();

        if (Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            $user = Auth::user();

            if ($user->hasTwoFactorEnabled()) {
                $remember = $request->boolean('remember');
                Auth::logout();
                $request->session()->put('two_factor_challenge_user_id', $user->id);
                $request->session()->put('two_factor_challenge_remember', $remember);

                return redirect()->route('two-factor.challenge');
            }

            $request->session()->regenerate();

            $msg = __('auth.signin.toast_signed_in');

            return match ($user->type) {
                UserType::ADMIN => redirect()->intended(route('admin.dashboard'))->with('success', $msg),
                UserType::HOST => redirect()->intended(route('host.dashboard'))->with('success', $msg),
                UserType::USER => redirect()->intended('/')->with('success', $msg),
            };
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    /**
     * Log the user out.
     */
    public function destroy(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}

<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Auth\LoginRequest;
use App\Enums\UserType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LoginController extends Controller
{
    /**
     * Show the admin login form.
     */
    public function create()
    {
        return Inertia::render('Admin/Auth/Login');
    }

    /**
     * Handle an incoming admin authentication request.
     */
    public function store(LoginRequest $request)
    {
        $request->validated();

        $credentials = array_merge($request->only('email', 'password'), [
            'type' => UserType::ADMIN->value,
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $user = Auth::user();

            if ($user->hasTwoFactorEnabled()) {
                Auth::logout();
                $request->session()->regenerate();
                $request->session()->put('two_factor_challenge_user_id', $user->id);
                $request->session()->put('two_factor_challenge_remember', $request->boolean('remember'));

                return redirect()->route('two-factor.challenge');
            }

            $request->session()->regenerate();

            return redirect()->intended(route('admin.dashboard'))
                ->with('success', __('auth.signin.toast_signed_in'));
        }

        return back()->withErrors([
            'email' => __('admin.auth.invalid_credentials'),
        ])->onlyInput('email');
    }

    /**
     * Log the admin out.
     */
    public function destroy(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return $request->routeIs('admin.logout')
            ? redirect()->route('admin.login')
            : redirect('/');
    }
}

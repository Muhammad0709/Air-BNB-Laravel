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

        if (Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            $user = Auth::user();
            // Only allow Admin or Host to log in here; customers must use /login
            if ($user->type === UserType::USER) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                return back()->withErrors([
                    'email' => __('admin.auth.customer_sign_in_required'),
                ])->onlyInput('email');
            }
            $request->session()->regenerate();
            if ($user->type === UserType::ADMIN) {
                return redirect()->intended('/admin/dashboard');
            }
            return redirect()->intended('/host/dashboard');
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
        return redirect('/login');
    }
}

<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Enums\UserType;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Redirect to Google OAuth.
     * If intent=admin is passed (from admin login page), store in session for callback.
     */
    public function redirect()
    {
        if (request()->query('intent') === 'admin') {
            request()->session()->put('google_login_intent', 'admin');
        }
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle callback from Google; find or create user, log in, redirect by intent and user type.
     */
    public function callback()
    {
        $intent = request()->session()->pull('google_login_intent');

        $googleUser = Socialite::driver('google')->user();

        $user = User::where('google_id', $googleUser->getId())->first()
            ?? User::where('email', $googleUser->getEmail())->first();

        if (!$user) {
            $user = User::create([
                'name' => $googleUser->getName() ?? $googleUser->getEmail(),
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'password' => Hash::make(Str::random(32)),
                'type' => UserType::USER,
            ]);
        } else {
            if (empty($user->google_id)) {
                $user->update(['google_id' => $googleUser->getId()]);
            }
        }

        Auth::login($user, true);
        request()->session()->regenerate();

        // Admin login page: redirect Admin to dashboard, Host to host panel; reject USER type
        if ($intent === 'admin') {
            if ($user->type === UserType::ADMIN) {
                return redirect()->intended('/admin/dashboard');
            }
            if ($user->type === UserType::HOST) {
                return redirect()->intended('/host/dashboard');
            }
            Auth::logout();
            request()->session()->invalidate();
            request()->session()->regenerateToken();
            return redirect()->route('admin.login')->withErrors([
                'email' => 'Please use the main site to sign in as a customer.',
            ])->onlyInput('email');
        }

        return redirect()->intended('/');
    }
}

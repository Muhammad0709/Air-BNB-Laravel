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
     * intent=admin or intent=host is passed via OAuth state (survives cross-domain callback).
     */
    public function redirect()
    {
        $intent = request()->query('intent');
        if (in_array($intent, ['admin', 'host'], true)) {
            $state = $intent . '.' . Str::random(40);
            return Socialite::driver('google')->stateless()->with(['state' => $state])->redirect();
        }
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle callback from Google; find or create user, log in, redirect by intent and user type.
     * Intent is read from OAuth state (state param survives when session is lost on callback domain).
     */
    public function callback()
    {
        $stateParam = request()->input('state');
        if ($stateParam && str_contains($stateParam, '.')) {
            $parts = explode('.', $stateParam, 2);
            $intent = in_array($parts[0], ['admin', 'host'], true) ? $parts[0] : null;
            $googleUser = Socialite::driver('google')->stateless()->user();
        } else {
            $intent = request()->session()->pull('google_login_intent');
            $googleUser = Socialite::driver('google')->user();
        }

        $user = User::where('google_id', $googleUser->getId())->first()
            ?? User::where('email', $googleUser->getEmail())->first();

        $isNewUser = false;
        if (!$user) {
            $userType = $intent === 'host' ? UserType::HOST : UserType::USER;
            $user = User::create([
                'name' => $googleUser->getName() ?? $googleUser->getEmail(),
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'password' => Hash::make(Str::random(32)),
                'type' => $userType,
            ]);
            $isNewUser = true;
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

        // Host register page: new users become HOST → host dashboard; existing USER rejected
        if ($intent === 'host') {
            if ($user->type === UserType::HOST || $user->type === UserType::ADMIN) {
                return redirect()->intended($user->type === UserType::ADMIN ? '/admin/dashboard' : '/host/dashboard');
            }
            if ($user->type === UserType::USER && !$isNewUser) {
                Auth::logout();
                request()->session()->invalidate();
                request()->session()->regenerateToken();
                return redirect()->route('host.register')->withErrors([
                    'email' => 'You already have a customer account. Please use the main site to sign in as a customer.',
                ])->onlyInput('email');
            }
            return redirect()->intended('/host/dashboard');
        }

        return redirect()->intended('/');
    }
}

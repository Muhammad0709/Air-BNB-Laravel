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
     * Callback URL must match the current request host so session is preserved.
     * Ensure this exact URL is allowed in Google Cloud Console (APIs & Services → Credentials).
     */
    protected function getRedirectUrl(): string
    {
        return url('/auth/google/callback');
    }

    /**
     * Redirect to Google OAuth.
     * intent=admin or intent=host stored in session; callback URL set from current host so session works.
     */
    public function redirect()
    {
        $intent = request()->query('intent');
        if (in_array($intent, ['admin', 'host'], true)) {
            request()->session()->put('google_login_intent', $intent);
        }
        return Socialite::driver('google')
            ->redirectUrl($this->getRedirectUrl())
            ->redirect();
    }

    /**
     * Handle callback from Google; find or create user, log in, redirect by intent and user type.
     */
    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')
                ->redirectUrl($this->getRedirectUrl())
                ->user();
        } catch (\Throwable $e) {
            report($e);
            return redirect()->route('admin.login')
                ->withErrors(['email' => 'Google sign-in failed. Please try again or use email/password.']);
        }

        $intent = request()->session()->pull('google_login_intent');

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

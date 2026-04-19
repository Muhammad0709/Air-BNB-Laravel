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
    protected function getRedirectUrl(): string
    {
        return url('/auth/google/callback');
    }

    /**
     * ?intent=host — /login & /register (hosts only; admins cannot use Google here).
     * ?intent=customer — /login & /register (customers only).
     */
    public function redirect()
    {
        $intent = request()->query('intent');
        if (!in_array($intent, ['host', 'customer'], true)) {
            return redirect()->route('home')->withErrors([
                'email' => 'Please use the Sign in with Google button on the login or register page.',
            ]);
        }

        request()->session()->put('google_login_intent', $intent);

        return Socialite::driver('google')
            ->redirectUrl($this->getRedirectUrl())
            ->redirect();
    }

    public function callback()
    {
        $intentForError = request()->session()->get('google_login_intent');

        try {
            $googleUser = Socialite::driver('google')
                ->redirectUrl($this->getRedirectUrl())
                ->user();
        } catch (\Throwable $e) {
            report($e);
            return redirect()->route('login')
                ->withErrors(['email' => 'Google sign-in failed. Please try again or use email/password.']);
        }

        $intent = request()->session()->pull('google_login_intent');
        if (!in_array($intent, ['host', 'customer'], true)) {
            return redirect()->route('home')->withErrors([
                'email' => 'Google sign-in session expired. Please try again from the login or register page.',
            ]);
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

        if ($intent === 'customer') {
            if ($user->type === UserType::ADMIN) {
                Auth::logout();
                request()->session()->invalidate();
                request()->session()->regenerateToken();
                return redirect()->route('login')->withErrors([
                    'email' => 'Please sign in with email and password to access the admin panel.',
                ])->onlyInput('email');
            }
            if ($user->type === UserType::HOST) {
                Auth::logout();
                request()->session()->invalidate();
                request()->session()->regenerateToken();
                return redirect()->route('login')->withErrors([
                    'email' => __('auth.signin.google_error_host_cannot_use_customer'),
                ])->onlyInput('email');
            }
            // Do not use intended() — avoid sending users to a stale url.intended from session
            return redirect('/')->with('success', __('auth.signin.toast_signed_in'));
        }

        // intent === host: hosts only — admins must use email/password
        if ($user->type === UserType::ADMIN) {
            Auth::logout();
            request()->session()->invalidate();
            request()->session()->regenerateToken();
            return redirect()->route('login')->withErrors([
                'email' => 'Administrators must sign in with email and password.',
            ])->onlyInput('email');
        }

        if ($user->type === UserType::HOST) {
            // Never use intended() here: session often keeps url.intended=/register from guest flow and breaks OAuth
            return redirect()->route('host.dashboard')->with('success', __('auth.signin.toast_signed_in'));
        }

        if ($user->type === UserType::USER && !$isNewUser) {
            Auth::logout();
            request()->session()->invalidate();
            request()->session()->regenerateToken();
            return redirect()->route('login')->withErrors([
                'email' => __('auth.signin.google_error_customer_cannot_use_host'),
            ])->onlyInput('email');
        }

        return redirect()->route('host.dashboard')->with('success', __('auth.signin.toast_signed_in'));
    }
}

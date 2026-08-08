<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\TwoFactorAuthenticationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TwoFactorChallengeController extends Controller
{
    public function create(Request $request)
    {
        if (! $request->session()->has('two_factor_challenge_user_id')) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/TwoFactorChallenge');
    }

    public function store(Request $request, TwoFactorAuthenticationService $twoFactor)
    {
        $request->validate([
            'code' => ['nullable', 'string'],
            'recovery_code' => ['nullable', 'string'],
        ]);

        $userId = $request->session()->get('two_factor_challenge_user_id');
        $user = $userId ? User::find($userId) : null;

        if (! $user || ! $user->hasTwoFactorEnabled()) {
            return redirect()->route('login');
        }

        $verified = false;

        if ($request->filled('recovery_code')) {
            $codes = $user->two_factor_recovery_codes ?? [];
            $index = array_search(strtoupper(trim($request->input('recovery_code'))), $codes, true);

            if ($index !== false) {
                unset($codes[$index]);
                $user->update(['two_factor_recovery_codes' => array_values($codes)]);
                $verified = true;
            }
        } elseif ($request->filled('code')) {
            $verified = $twoFactor->verifyCode($user->two_factor_secret, $request->input('code'));
        }

        if (! $verified) {
            return back()->withErrors(['code' => __('auth.two_factor.invalid_code')]);
        }

        $remember = $request->session()->get('two_factor_challenge_remember', false);
        $request->session()->forget(['two_factor_challenge_user_id', 'two_factor_challenge_remember']);

        Auth::login($user, $remember);
        $request->session()->regenerate();

        $msg = __('auth.signin.toast_signed_in');

        return match ($user->type) {
            UserType::ADMIN => redirect()->intended(route('admin.dashboard'))->with('success', $msg),
            UserType::HOST => redirect()->intended(route('host.dashboard'))->with('success', $msg),
            UserType::USER => redirect()->intended('/')->with('success', $msg),
        };
    }
}

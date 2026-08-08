<?php

namespace App\Http\Controllers;

use App\Http\Requests\Profile\ConfirmTwoFactorRequest;
use App\Http\Requests\Profile\DeleteAccountRequest;
use App\Http\Requests\Profile\DisableTwoFactorRequest;
use App\Http\Requests\Profile\LogoutOtherDevicesRequest;
use App\Http\Requests\Profile\UpdateCurrencyRequest;
use App\Http\Requests\Profile\UpdateNotificationPreferencesRequest;
use App\Http\Requests\Profile\UpdatePasswordRequest;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Requests\Profile\UploadProfilePictureRequest;
use App\Services\TwoFactorAuthenticationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProfileSettingsController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $twoFactorSetup = null;
        $setupSecret = $request->session()->get('two_factor_setup_secret');
        if ($setupSecret && ! $user->hasTwoFactorEnabled()) {
            $twoFactor = new TwoFactorAuthenticationService();
            $twoFactorSetup = [
                'secret' => $setupSecret,
                'qrCode' => $twoFactor->qrCodeSvgDataUri($user, $setupSecret),
            ];
        }

        return Inertia::render('ProfileSettings', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'bio' => $user->bio ?? '',
                'profile_picture' => $user->profile_picture ? Storage::url($user->profile_picture) : null,
                'notify_bookings' => $user->notify_bookings,
                'notify_properties' => $user->notify_properties,
                'two_factor_enabled' => $user->hasTwoFactorEnabled(),
            ],
            'twoFactorSetup' => $twoFactorSetup,
            'twoFactorRecoveryCodes' => $request->session()->pull('two_factor_new_recovery_codes'),
        ]);
    }

    /**
     * Profile phone is stored in users.phone as a single string (E.164-style, e.g. +31612345678).
     */
    public function updateProfile(UpdateProfileRequest $request)
    {
        $user = Auth::user();
        $validated = $request->validated();
        $user->update($validated);

        // Refresh user to get updated data
        $user->refresh();

        return redirect()->back()->with('success', 'Profile updated successfully!');
    }

    public function updatePassword(UpdatePasswordRequest $request)
    {
        $user = Auth::user();
        $user->update([
            'password' => Hash::make($request->validated('new_password'))
        ]);

        return redirect()->back()->with('success', 'Password changed successfully!');
    }

    public function updateCurrency(UpdateCurrencyRequest $request)
    {
        Auth::user()->update(['currency' => $request->validated('currency')]);

        return redirect()->back();
    }

    public function logoutOtherDevices(LogoutOtherDevicesRequest $request)
    {
        Auth::logoutOtherDevices($request->validated('password'));

        return redirect()->back()->with('success', 'You have been logged out of all other devices.');
    }

    public function updateNotificationPreferences(UpdateNotificationPreferencesRequest $request)
    {
        Auth::user()->update($request->validated());

        return redirect()->back();
    }

    public function twoFactorEnable(Request $request, TwoFactorAuthenticationService $twoFactor)
    {
        $user = Auth::user();

        abort_if($user->hasTwoFactorEnabled(), 403, 'Two-factor authentication is already enabled.');

        $request->session()->put('two_factor_setup_secret', $twoFactor->generateSecretKey());

        return redirect()->back();
    }

    public function twoFactorConfirm(ConfirmTwoFactorRequest $request, TwoFactorAuthenticationService $twoFactor)
    {
        $user = Auth::user();
        $secret = $request->session()->get('two_factor_setup_secret');

        abort_unless($secret, 403, 'No two-factor setup in progress.');

        if (! $twoFactor->verifyCode($secret, $request->validated('code'))) {
            return redirect()->back()->withErrors(['code' => __('profile_settings.two_factor_invalid_code')]);
        }

        $recoveryCodes = $twoFactor->generateRecoveryCodes();

        $user->update([
            'two_factor_secret' => $secret,
            'two_factor_recovery_codes' => $recoveryCodes,
            'two_factor_confirmed_at' => now(),
        ]);

        $request->session()->forget('two_factor_setup_secret');
        $request->session()->put('two_factor_new_recovery_codes', $recoveryCodes);

        return redirect()->back()->with('success', __('profile_settings.two_factor_enabled_success'));
    }

    public function twoFactorDisable(DisableTwoFactorRequest $request)
    {
        Auth::user()->update([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ]);

        $request->session()->forget('two_factor_setup_secret');

        return redirect()->back()->with('success', __('profile_settings.two_factor_disabled_success'));
    }

    public function twoFactorRegenerateRecoveryCodes(Request $request, TwoFactorAuthenticationService $twoFactor)
    {
        $user = Auth::user();

        abort_unless($user->hasTwoFactorEnabled(), 403, 'Two-factor authentication is not enabled.');

        $recoveryCodes = $twoFactor->generateRecoveryCodes();
        $user->update(['two_factor_recovery_codes' => $recoveryCodes]);
        $request->session()->put('two_factor_new_recovery_codes', $recoveryCodes);

        return redirect()->back()->with('success', __('profile_settings.two_factor_recovery_codes_regenerated'));
    }

    public function destroy(DeleteAccountRequest $request)
    {
        $user = Auth::user();

        // No cascading foreign key on notifications.user_id, so it must be cleared explicitly.
        $user->notifications()->delete();

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        $user->delete();

        return redirect()->route('home')->with('success', 'Your account has been deleted.');
    }

    public function uploadProfilePicture(UploadProfilePictureRequest $request)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return redirect()->back()->with('error', 'User not authenticated.');
            }

            // Delete old profile picture if exists
            if ($user->profile_picture) {
                Storage::disk('public')->delete($user->profile_picture);
            }

            // Store new profile picture
            $path = $request->file('profile_picture')->store('profile-pictures', 'public');
            
            if (!$path) {
                return redirect()->back()->with('error', 'Failed to store profile picture.');
            }

            $user->update([
                'profile_picture' => $path
            ]);

            // Refresh user to get updated data
            $user->refresh();

            return redirect()->back()->with('success', 'Profile picture updated successfully!');
        } catch (\Exception $e) {
            \Log::error('Profile picture upload error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'An error occurred while uploading the profile picture. Please try again.');
        }
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        return redirect()->route('admin.settings.profile');
    }

    public function profile()
    {
        $user = Auth::user();
        return Inertia::render('Admin/Settings/Profile', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'profile_picture' => $user->profile_picture
                    ? (filter_var($user->profile_picture, FILTER_VALIDATE_URL)
                        ? $user->profile_picture
                        : Storage::url($user->profile_picture))
                    : null,
            ],
            'configuration' => [
                'commission_rate' => Setting::get('commission_rate', 10),
            ],
        ]);
    }

    public function configuration()
    {
        $user = Auth::user();
        return Inertia::render('Admin/Settings/Profile', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'profile_picture' => $user->profile_picture
                    ? (filter_var($user->profile_picture, FILTER_VALIDATE_URL)
                        ? $user->profile_picture
                        : Storage::url($user->profile_picture))
                    : null,
            ],
            'configuration' => [
                'commission_rate' => Setting::get('commission_rate', 10),
            ],
        ]);
    }

    public function updateConfiguration(Request $request)
    {
        $request->validate([
            'commission_rate' => 'required|numeric|min:0|max:100',
        ]);
        Setting::set('commission_rate', $request->commission_rate);
        return redirect()->back()->with('success', __('admin.settings.configuration_saved'));
    }

    public function password()
    {
        $user = Auth::user();
        return Inertia::render('Admin/Settings/Profile', [
            'configuration' => ['commission_rate' => Setting::get('commission_rate', 10)],
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'profile_picture' => $user->profile_picture
                    ? (filter_var($user->profile_picture, FILTER_VALIDATE_URL)
                        ? $user->profile_picture
                        : Storage::url($user->profile_picture))
                    : null,
            ],
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
        ]);
        $user->update($validated);
        return redirect()->back()->with('success', 'Profile updated successfully!');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|current_password',
            'new_password' => ['required', 'confirmed', Password::min(8)],
        ]);
        $user = Auth::user();
        $user->update(['password' => Hash::make($request->new_password)]);
        return redirect()->back()->with('success', 'Password changed successfully!');
    }

    public function uploadProfilePicture(Request $request)
    {
        $request->validate([
            'profile_picture' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);
        $user = Auth::user();
        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
        }
        $path = $request->file('profile_picture')->store('profile-pictures', 'public');
        $user->update(['profile_picture' => $path]);
        return redirect()->back()->with('success', 'Profile picture updated successfully!');
    }
}

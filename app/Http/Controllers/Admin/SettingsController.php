<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Settings\UpdateConfigurationRequest;
use App\Http\Requests\Admin\Settings\UpdatePasswordRequest;
use App\Http\Requests\Admin\Settings\UpdateProfileRequest;
use App\Http\Requests\Admin\Settings\UploadProfilePictureRequest;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
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

    public function updateConfiguration(UpdateConfigurationRequest $request)
    {
        Setting::set('commission_rate', $request->validated('commission_rate'));
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

    public function updateProfile(UpdateProfileRequest $request)
    {
        Auth::user()->update($request->validated());
        return redirect()->back()->with('success', 'Profile updated successfully!');
    }

    public function updatePassword(UpdatePasswordRequest $request)
    {
        Auth::user()->update(['password' => Hash::make($request->validated('new_password'))]);
        return redirect()->back()->with('success', 'Password changed successfully!');
    }

    public function uploadProfilePicture(UploadProfilePictureRequest $request)
    {
        $user = Auth::user();
        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
        }
        $path = $request->file('profile_picture')->store('profile-pictures', 'public');
        $user->update(['profile_picture' => $path]);
        return redirect()->back()->with('success', 'Profile picture updated successfully!');
    }
}

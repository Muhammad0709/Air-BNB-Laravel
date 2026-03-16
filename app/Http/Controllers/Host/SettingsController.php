<?php

namespace App\Http\Controllers\Host;

use App\Http\Controllers\Controller;
use App\Http\Requests\Host\Settings\UpdatePasswordRequest;
use App\Http\Requests\Host\Settings\UpdateProfileRequest;
use App\Http\Requests\Host\Settings\UploadProfilePictureRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        return redirect()->route('host.settings.profile');
    }

    private function userProps($user)
    {
        return [
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
        ];
    }

    public function profile()
    {
        return Inertia::render('Host/Settings/Profile', $this->userProps(Auth::user()));
    }

    public function password()
    {
        return Inertia::render('Host/Settings/Profile', $this->userProps(Auth::user()));
    }

    public function updateProfile(UpdateProfileRequest $request)
    {
        Auth::user()->update($request->validated());
        return redirect()->back()->with('success', __('host.settings.profile_updated_success'));
    }

    public function updatePassword(UpdatePasswordRequest $request)
    {
        Auth::user()->update(['password' => Hash::make($request->validated('new_password'))]);
        return redirect()->back()->with('success', __('host.settings.password_changed_success'));
    }

    public function uploadProfilePicture(UploadProfilePictureRequest $request)
    {
        $user = Auth::user();
        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
        }
        $path = $request->file('profile_picture')->store('profile-pictures', 'public');
        $user->update(['profile_picture' => $path]);
        return redirect()->back()->with('success', __('host.settings.picture_updated_success'));
    }
}

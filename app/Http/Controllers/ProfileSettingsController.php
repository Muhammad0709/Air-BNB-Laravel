<?php

namespace App\Http\Controllers;

use App\Http\Requests\Profile\UpdateCurrencyRequest;
use App\Http\Requests\Profile\UpdatePasswordRequest;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Requests\Profile\UploadProfilePictureRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProfileSettingsController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        return Inertia::render('ProfileSettings', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'bio' => $user->bio ?? '',
                'profile_picture' => $user->profile_picture ? Storage::url($user->profile_picture) : null,
            ]
        ]);
    }

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

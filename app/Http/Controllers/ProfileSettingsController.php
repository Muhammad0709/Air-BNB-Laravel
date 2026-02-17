<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
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

    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string|max:500',
        ]);

        $user->update($validated);

        // Refresh user to get updated data
        $user->refresh();

        return redirect()->back()->with('success', 'Profile updated successfully!');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|current_password',
            'new_password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $user = Auth::user();
        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return redirect()->back()->with('success', 'Password changed successfully!');
    }

    public function updateCurrency(Request $request)
    {
        $request->validate(['currency' => 'required|string|in:USD,PKR']);

        Auth::user()->update(['currency' => $request->input('currency')]);

        return redirect()->back();
    }

    public function uploadProfilePicture(Request $request)
    {
        try {
            $request->validate([
                'profile_picture' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

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
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            \Log::error('Profile picture upload error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'An error occurred while uploading the profile picture. Please try again.');
        }
    }
}

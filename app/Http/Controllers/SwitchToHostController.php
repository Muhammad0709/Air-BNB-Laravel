<?php

namespace App\Http\Controllers;

use App\Enums\UserType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SwitchToHostController extends Controller
{
    /**
     * Let the authenticated customer open the host panel in preview mode (session only; user type unchanged).
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        if ($user->type !== UserType::USER) {
            return redirect()->back()->with('error', 'Only customer accounts can open the host preview.');
        }

        $request->session()->put('host_panel_preview', true);

        return redirect()->route('host.dashboard')->with('success', __('profile_settings.host_preview_on'));
    }

    /**
     * Clear host preview session; customer returns to guest-only views (account type unchanged).
     */
    public function destroy(Request $request)
    {
        $user = Auth::user();

        if ($user->type !== UserType::USER) {
            return redirect()->back()->with('error', 'Only customer accounts can leave the host preview.');
        }

        $request->session()->forget('host_panel_preview');

        return redirect()->route('profile.settings')->with('success', __('profile_settings.host_preview_off'));
    }
}

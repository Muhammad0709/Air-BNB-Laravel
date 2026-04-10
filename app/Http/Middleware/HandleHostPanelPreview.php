<?php

namespace App\Http\Middleware;

use App\Enums\UserType;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class HandleHostPanelPreview
{
    /**
     * Handle host panel preview mode for customers.
     * 
     * - If host_panel_preview session is true, redirect customer routes to host panel
     * - If host_panel_preview session is false, prevent access to host routes
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::check()) {
            return $next($request);
        }

        $user = Auth::user();
        $path = $request->path();
        $hostPanelPreview = $request->session()->get('host_panel_preview', false);

        // Only apply this logic to User type (customers)
        if ($user->type !== UserType::USER) {
            return $next($request);
        }

        // Allow logout, switch routes, and API routes
        if ($path === 'logout' || 
            $path === 'switch-to-host' || 
            $path === 'switch-to-customer-view' ||
            str_starts_with($path, 'api/')) {
            return $next($request);
        }

        // If host panel preview is ON
        if ($hostPanelPreview) {
            // Allow host routes
            if (str_starts_with($path, 'host/')) {
                return $next($request);
            }

            // Redirect customer routes to host dashboard
            // Exclude public routes that should still be accessible
            $publicRoutes = [
                'login',
                'register',
                'auth/google',
                'auth/google/callback',
                'detail/',
                'listing',
                'contact',
                'about',
                'privacy-policy',
                'terms',
                'search',
            ];

            foreach ($publicRoutes as $publicRoute) {
                if (str_starts_with($path, $publicRoute)) {
                    return $next($request);
                }
            }

            // Redirect to host dashboard for customer-specific routes
            return redirect()->route('host.dashboard');
        }

        // If host panel preview is OFF
        if (! $hostPanelPreview) {
            // Prevent access to host routes
            if (str_starts_with($path, 'host/')) {
                return redirect()->route('home');
            }
        }

        return $next($request);
    }
}

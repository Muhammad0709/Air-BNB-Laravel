<?php

namespace App\Http\Middleware;

use App\Enums\UserType;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectAdminHostToPanel
{
    /**
     * If the authenticated user is Admin or Host, redirect them to their panel
     * so they cannot use customer area (home, wishlist, chat, etc.).
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::check()) {
            return $next($request);
        }

        $user = Auth::user();
        $path = $request->path();

        // Allow access to admin and host routes (they have their own middleware)
        if (str_starts_with($path, 'admin/') || str_starts_with($path, 'host/')) {
            return $next($request);
        }

        if ($user->type === UserType::ADMIN) {
            return redirect()->route('admin.dashboard');
        }

        if ($user->type === UserType::HOST) {
            return redirect()->route('host.dashboard');
        }

        return $next($request);
    }
}

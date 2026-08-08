<?php

namespace App\Http\Middleware;

use App\Enums\UserType;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Restricts a route to full Admin accounts, blocking Moderators.
 * Must run after the `admin` middleware, which already guarantees
 * the user is authenticated as either an Admin or a Moderator.
 */
class AdminOnlyMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        abort_unless(Auth::user()->type === UserType::ADMIN, 403, 'Access denied. Full admin privileges required.');

        return $next($request);
    }
}

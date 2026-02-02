<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Enums\UserType;

class HostApiMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated. Please login to access this resource.'
            ], 401);
        }

        // Check if authenticated user is a Host type
        if (Auth::user()->type !== UserType::HOST) {
            return response()->json([
                'status' => 'error',
                'message' => 'Access denied. This resource is only available for Host accounts, not ' . Auth::user()->type->value . ' accounts.'
            ], 403);
        }

        return $next($request);
    }
}

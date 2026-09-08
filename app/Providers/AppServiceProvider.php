<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('api-auth', function (Request $request) {
            // IP-based limits cannot be bypassed by rotating email addresses or tokens.
            $limit = $request->is('api/register') ? Limit::perHour(5) : Limit::perMinute(5);

            return $limit->by($request->path().'|'.$request->ip())
                ->response(fn (Request $request, array $headers) => response()->json([
                    'message' => 'Too many authentication attempts. Please try again later.',
                ], 429, $headers));
        });

        // Event listener is auto-discovered via EventServiceProvider

        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }
    }
}

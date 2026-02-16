<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\PostTooLargeException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->validateCsrfTokens(except: [
            'auth/login',
            'auth/register',
            'login',
            'register',
            'logout',
            'admin/logout',
            'host/logout',
        ]);

        $middleware->web(append: [
            \App\Http\Middleware\SetLocaleFromSession::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);

        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'host' => \App\Http\Middleware\HostMiddleware::class,
            'redirect.admin.host' => \App\Http\Middleware\RedirectAdminHostToPanel::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (PostTooLargeException $e, $request) {
            if ($request->header('X-Inertia')) {
                return back()->with('error', 'File too large. Image must be 2MB or less.');
            }
        });
    })->create();

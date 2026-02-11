<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\Admin\PropertyController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\SupportTicketController;
use App\Http\Controllers\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Admin\Auth\LoginController as AdminLoginController;
use App\Http\Controllers\Admin\Auth\RegisterController as AdminRegisterController;
use App\Http\Controllers\Host\DashboardController as HostDashboardController;
use App\Http\Controllers\Host\PropertyController as HostPropertyController;
use App\Http\Controllers\Host\BookingController as HostBookingController;
use App\Http\Controllers\Host\EarningsController;
use App\Http\Controllers\Host\SettingsController as HostSettingsController;
use App\Http\Controllers\Host\ChatController;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\PropertyDetailController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\ProfileSettingsController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ConfirmationController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\LocaleController;

// Locale switch (session) - available to all
Route::get('locale/{locale}', [LocaleController::class, 'switch'])->name('locale.switch');

// Public authentication routes (only accessible to guests)
Route::middleware('guest')->group(function () {
    // User authentication routes
    Route::prefix('auth')->group(function () {
        Route::get('/login', [LoginController::class, 'create'])->name('login');
        Route::post('/login', [LoginController::class, 'store']);
        
        Route::get('/register', [RegisterController::class, 'create'])->name('register');
        Route::post('/register', [RegisterController::class, 'store']);
    });
    
    // Admin login (admin can only login, not register)
    Route::get('/login', [AdminLoginController::class, 'create'])->name('admin.login');
    Route::post('/login', [AdminLoginController::class, 'store']);
    
    // Host registration (creates Host users)
    Route::get('/register', [AdminRegisterController::class, 'create'])->name('host.register');
    Route::post('/register', [AdminRegisterController::class, 'store']);
});

// Public routes (accessible to all users)
Route::get('/listing', [ListingController::class, 'index'])->name('listing');
Route::get('/detail/{id}', [PropertyDetailController::class, 'show'])->name('property.detail');
Route::get('/contact', [ContactController::class, 'index'])->name('contact');
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');
Route::get('/booking/redirect', [BookingController::class, 'redirectToBooking'])->name('booking.redirect');
Route::get('/booking', [BookingController::class, 'index'])->name('booking');
Route::get('/confirmation', [ConfirmationController::class, 'index'])->name('confirmation');

// Public pages (PageController)
Route::get('/about', [PageController::class, 'about'])->name('about');
Route::get('/bookings', [PageController::class, 'customerBookings'])->name('bookings');
Route::get('/privacy-policy', [PageController::class, 'privacyPolicy'])->name('privacy-policy');
Route::get('/terms', [PageController::class, 'terms'])->name('terms');
Route::get('/search', [PageController::class, 'search'])->name('search');
Route::get('/welcome', [PageController::class, 'welcome'])->name('welcome');

// Review routes (require authentication)
Route::middleware('auth')->group(function () {
    Route::post('/reviews', [ReviewController::class, 'store'])->name('reviews.store');
});

// Protected routes (require authentication)
Route::middleware('auth')->group(function () {
    Route::get('/', [HomeController::class, 'index']);
    
    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');
    
    Route::get('/chat', [PageController::class, 'chat'])->name('chat');
    
    // User-specific routes
    Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist');
    Route::delete('/wishlist/{id}', [WishlistController::class, 'remove'])->name('wishlist.remove');
    Route::get('/profile/settings', [ProfileSettingsController::class, 'index'])->name('profile.settings');
    Route::patch('/profile/update', [ProfileSettingsController::class, 'updateProfile'])->name('profile.update');
    Route::patch('/profile/password', [ProfileSettingsController::class, 'updatePassword'])->name('profile.password');
    Route::post('/profile/picture', [ProfileSettingsController::class, 'uploadProfilePicture'])->name('profile.picture');
    
    
    // Admin routes (require admin authentication)
    Route::prefix('admin')->name('admin.')->middleware('admin')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::post('/logout', [AdminLoginController::class, 'destroy'])->name('logout');
        // Properties routes (admin can only view and edit, not create or delete)
        Route::get('/properties', [PropertyController::class, 'index'])->name('properties.index');
        Route::get('/properties/{property}', [PropertyController::class, 'show'])->name('properties.show');
        Route::get('/properties/{property}/edit', [PropertyController::class, 'edit'])->name('properties.edit');
        Route::put('/properties/{property}', [PropertyController::class, 'update'])->name('properties.update');
        Route::patch('/properties/{property}/approve', [PropertyController::class, 'approve'])->name('properties.approve');
        Route::patch('/properties/{property}/reject', [PropertyController::class, 'reject'])->name('properties.reject');
        Route::resource('users', UserController::class)->only(['index', 'show', 'edit', 'update', 'destroy']);
        Route::get('/bookings', [AdminBookingController::class, 'index'])->name('bookings.index');
        Route::get('/bookings/create', [AdminBookingController::class, 'create'])->name('bookings.create');
        Route::get('/bookings/{id}', [AdminBookingController::class, 'show'])->name('bookings.show');
        Route::get('/bookings/{id}/edit', [AdminBookingController::class, 'edit'])->name('bookings.edit');
        Route::get('/support-tickets', [SupportTicketController::class, 'index'])->name('support-tickets.index');
        Route::get('/support-tickets/create', [SupportTicketController::class, 'create'])->name('support-tickets.create');
        Route::get('/support-tickets/{id}', [SupportTicketController::class, 'show'])->name('support-tickets.show');
        Route::get('/support-tickets/{id}/edit', [SupportTicketController::class, 'edit'])->name('support-tickets.edit');
        Route::get('/settings', [AdminSettingsController::class, 'index'])->name('settings.index');
        Route::get('/settings/profile', [AdminSettingsController::class, 'profile'])->name('settings.profile');
        Route::get('/settings/password', [AdminSettingsController::class, 'password'])->name('settings.password');
        Route::put('/settings/profile', [AdminSettingsController::class, 'updateProfile'])->name('settings.profile.update');
        Route::put('/settings/password', [AdminSettingsController::class, 'updatePassword'])->name('settings.password.update');
        Route::post('/settings/picture', [AdminSettingsController::class, 'uploadProfilePicture'])->name('settings.picture');
    });
});

// Host routes (require host authentication) - separate from auth group to avoid default redirect
Route::prefix('host')->name('host.')->middleware('host')->group(function () {
    Route::get('/dashboard', [HostDashboardController::class, 'index'])->name('dashboard');
    Route::post('/logout', [AdminLoginController::class, 'destroy'])->name('logout');
    Route::resource('properties', HostPropertyController::class);
    Route::get('/bookings', [HostBookingController::class, 'index'])->name('bookings.index');
    Route::get('/bookings/create', [HostBookingController::class, 'create'])->name('bookings.create');
    Route::get('/bookings/{id}', [HostBookingController::class, 'show'])->name('bookings.show');
    Route::get('/bookings/{id}/edit', [HostBookingController::class, 'edit'])->name('bookings.edit');
    Route::get('/earnings', [EarningsController::class, 'index'])->name('earnings.index');
    Route::get('/earnings/show/{id}', [EarningsController::class, 'show'])->name('earnings.show');
    Route::get('/earnings/request-payout', [EarningsController::class, 'requestPayout'])->name('earnings.request-payout');
    Route::get('/earnings/payout/{id}', [EarningsController::class, 'payout'])->name('earnings.payout');
    Route::get('/settings', [HostSettingsController::class, 'index'])->name('settings.index');
    Route::get('/settings/profile', [HostSettingsController::class, 'profile'])->name('settings.profile');
    Route::get('/settings/password', [HostSettingsController::class, 'password'])->name('settings.password');
    Route::put('/settings/profile', [HostSettingsController::class, 'updateProfile'])->name('settings.profile.update');
    Route::put('/settings/password', [HostSettingsController::class, 'updatePassword'])->name('settings.password.update');
    Route::post('/settings/picture', [HostSettingsController::class, 'uploadProfilePicture'])->name('settings.picture');
    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
});

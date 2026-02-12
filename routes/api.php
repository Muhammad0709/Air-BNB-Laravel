<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PropertyController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\StaysController;
use App\Http\Controllers\Api\MessagesController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\BookingHistoryController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\HostPropertyController;
use App\Http\Controllers\Api\HostBookingController;
use App\Http\Controllers\Api\HostChatController;
use App\Http\Controllers\Api\HostEarningsController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Middleware\UserMiddleware;
use App\Http\Middleware\HostApiMiddleware;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'API is running'
    ]);
});

// Authentication routes (public)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/password/forgot', [AuthController::class, 'forgotPassword']);
Route::post('/password/reset', [AuthController::class, 'resetPassword']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Profile API (accessible to both User and Host)
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/password', [ProfileController::class, 'updatePassword']);
    Route::post('/profile/picture', [ProfileController::class, 'uploadPicture']);
    Route::put('/profile/currency', [ProfileController::class, 'updateCurrency']);
    
    // Host-only routes (restricted to Host type only)
    Route::middleware([HostApiMiddleware::class])->prefix('host')->group(function () {
        // Host Properties API
        Route::get('/properties', [HostPropertyController::class, 'index']);
        Route::post('/properties', [HostPropertyController::class, 'store']);
        Route::get('/properties/{id}', [HostPropertyController::class, 'show']);
        Route::put('/properties/{id}', [HostPropertyController::class, 'update']);
        Route::delete('/properties/{id}', [HostPropertyController::class, 'destroy']);
        
        // Host Bookings API
        Route::get('/bookings', [HostBookingController::class, 'index']);
        Route::post('/bookings', [HostBookingController::class, 'store']);
        Route::get('/bookings/{id}', [HostBookingController::class, 'show']);
        Route::put('/bookings/{id}', [HostBookingController::class, 'update']);
        Route::delete('/bookings/{id}', [HostBookingController::class, 'destroy']);
        
        // Host Chat API
        Route::get('/chat/users', [HostChatController::class, 'users']);
        Route::get('/chat/conversations', [HostChatController::class, 'conversations']);
        Route::post('/chat/conversations', [HostChatController::class, 'createOrGet']);
        Route::get('/chat/conversations/{id}', [HostChatController::class, 'messages']);
        Route::post('/chat/conversations/{id}/messages', [HostChatController::class, 'sendMessage']);
        
        // Host Earnings API
        Route::get('/earnings', [HostEarningsController::class, 'index']);
        Route::get('/earnings/show/{id}', [HostEarningsController::class, 'show']);
        Route::get('/earnings/payouts', [HostEarningsController::class, 'payouts']);
        Route::post('/earnings/payouts', [HostEarningsController::class, 'requestPayout']);
        Route::get('/earnings/payout/{id}', [HostEarningsController::class, 'showPayout']);
    });
    
    // User-only routes (restricted to User type only, Host cannot access)
    Route::middleware([UserMiddleware::class])->group(function () {
        // Home API
        Route::get('/home', [HomeController::class, 'index']);
        
        // Search API (auth required, GET like Stays)
        Route::get('/search', [SearchController::class, 'index']);
        
        // Stays API
        Route::get('/stays', [StaysController::class, 'index']);
        
        // Messages API
        Route::get('/messages/conversations', [MessagesController::class, 'conversations']);
        Route::get('/messages/properties-to-message', [MessagesController::class, 'propertiesToMessage']);
        Route::post('/messages/conversations', [MessagesController::class, 'createOrGet']);
        Route::get('/messages/conversations/{conversation_id}', [MessagesController::class, 'messages']);
        Route::post('/messages/conversations/{conversation_id}/messages', [MessagesController::class, 'sendMessage']);
        
        // Booking API
        Route::get('/booking/{property_id}', [BookingController::class, 'show']);
        Route::post('/booking', [BookingController::class, 'store']);
        
        // Booking History API
        Route::get('/bookings', [BookingHistoryController::class, 'index']);
        
        // Contact API
        Route::get('/contact', [ContactController::class, 'index']);
        Route::post('/contact', [ContactController::class, 'store']);
        
        // Wishlist API
        Route::get('/wishlist', [WishlistController::class, 'index']);
    });
});


<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Display all notifications page for regular users
     */
    public function index(Request $request)
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Notifications', [
            'notifications' => $notifications,
        ]);
    }

    /**
     * Mark a notification as read
     */
    public function markAsRead(Request $request, Notification $notification)
    {
        // Ensure the notification belongs to the authenticated user
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $notification->update([
            'status' => 'read',
            'read_at' => now(),
        ]);

        return back();
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->where('status', 'unread')
            ->update([
                'status' => 'read',
                'read_at' => now(),
            ]);

        if ($request->wantsJson()) {
            return response()->json([
                'data' => [
                    'message' => 'All notifications marked as read',
                ],
            ]);
        }

        return back();
    }

}

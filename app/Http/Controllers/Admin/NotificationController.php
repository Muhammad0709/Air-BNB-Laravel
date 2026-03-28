<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Display all notifications page
     */
    public function index(Request $request)
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    /**
     * Get latest notifications (for dropdown)
     */
    public function latest(Request $request)
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'data' => [
                'notifications' => $notifications,
            ],
        ]);
    }

    /**
     * Get unread notification count
     */
    public function unreadCount(Request $request)
    {
        $count = Notification::where('user_id', $request->user()->id)
            ->where('status', 'unread')
            ->count();

        return response()->json([
            'data' => [
                'unread_count' => $count,
            ],
        ]);
    }

    /**
     * Mark a notification as read
     */
    public function markAsRead(Request $request, Notification $notification)
    {
        // Ensure the notification belongs to the authenticated user
        if ($notification->user_id !== $request->user()->id) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
            abort(403);
        }

        $notification->update([
            'status' => 'read',
            'read_at' => now(),
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'data' => [
                    'notification' => $notification,
                ],
            ]);
        }

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

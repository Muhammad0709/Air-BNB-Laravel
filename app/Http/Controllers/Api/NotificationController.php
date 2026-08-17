<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Notifications",
 *     description="API endpoints for user notifications"
 * )
 */
class NotificationController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/notifications",
     *     summary="Get all notifications (paginated)",
     *     tags={"Notifications"},
     *     security={{"apiAuth": {}}},
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=10)),
     *     @OA\Response(response=200, description="Notifications retrieved successfully")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->get('per_page', 10), 50);

        $paginated = Notification::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        $notifications = $paginated->getCollection()->map(fn ($n) => [
            'id'               => $n->id,
            'title'            => $n->title,
            'description'      => $n->description,
            'image'            => $n->image,
            'is_read'          => $n->status === 'read',
            'notifiable_type'  => $n->notifiable_type,
            'notifiable_id'    => $n->notifiable_id,
            'created_at'       => $n->created_at->toISOString(),
        ]);

        return response()->json([
            'status'  => 'success',
            'data'    => [
                'notifications' => $notifications,
                'current_page'  => $paginated->currentPage(),
                'last_page'     => $paginated->lastPage(),
                'per_page'      => $paginated->perPage(),
                'total'         => $paginated->total(),
            ],
        ]);
    }

    /**
     * @OA\Patch(
     *     path="/api/notifications/mark-all-as-read",
     *     summary="Mark all notifications as read",
     *     tags={"Notifications"},
     *     security={{"apiAuth": {}}},
     *     @OA\Response(response=200, description="All notifications marked as read")
     * )
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        Notification::where('user_id', $request->user()->id)
            ->where('status', 'unread')
            ->update(['status' => 'read', 'read_at' => now()]);

        return response()->json([
            'status'  => 'success',
            'message' => 'All notifications marked as read.',
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/api/notifications/{notification}",
     *     summary="Delete a notification",
     *     tags={"Notifications"},
     *     security={{"apiAuth": {}}},
     *     @OA\Parameter(name="notification", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Notification deleted"),
     *     @OA\Response(response=403, description="Unauthorized")
     * )
     */
    public function destroy(Request $request, Notification $notification): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Unauthorized',
            ], 403);
        }

        $notification->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Notification deleted.',
        ]);
    }

    /**
     * Get latest notifications for authenticated user
     */
    public function latest(Request $request)
    {
        $user = $request->user();
        
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'title' => $notification->title,
                    'description' => $notification->description,
                    'image' => $notification->image,
                    'is_read' => $notification->status === 'read',
                    'notifiable_type' => $notification->notifiable_type,
                    'notifiable_id' => $notification->notifiable_id,
                    'created_at' => $notification->created_at->toISOString(),
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => $notifications
        ]);
    }

    /**
     * Get unread notification count
     */
    public function unreadCount(Request $request)
    {
        $user = $request->user();
        
        $count = Notification::where('user_id', $user->id)
            ->where('status', 'unread')
            ->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'count' => $count
            ]
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, Notification $notification)
    {
        // Ensure user owns this notification
        if ($notification->user_id !== $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        $notification->update(['status' => 'read']);

        return response()->json([
            'status' => 'success',
            'message' => 'Notification marked as read'
        ]);
    }
}

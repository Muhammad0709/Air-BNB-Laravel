<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\HostConversationResource;
use App\Http\Resources\HostMessageResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageFile;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

/**
 * @OA\Tag(
 *     name="Host Chat",
 *     description="API endpoints for host chat and messaging"
 * )
 */
class HostChatController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/host/chat/users",
     *     summary="Get users list for starting conversation",
     *     description="Returns a list of users that the host can start conversations with",
     *     tags={"Host Chat"},
     *     security={{"apiAuth": {}}},
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search users by name or email",
     *         required=false,
     *         @OA\Schema(type="string", example="john")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Users retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Users retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="users",
     *                     type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="id", type="integer", example=1),
     *                         @OA\Property(property="name", type="string", example="John Doe"),
     *                         @OA\Property(property="email", type="string", example="john.doe@example.com"),
     *                         @OA\Property(property="avatar", type="string", nullable=true, example="http://localhost:8000/storage/users/avatar.jpg")
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Access denied - Host only",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Access denied. This resource is only available for Host accounts.")
     *         )
     *     )
     * )
     */
    public function users(Request $request): JsonResponse
    {
        $query = User::where('type', \App\Enums\UserType::USER->value);
        
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        $users = $query->orderBy('name', 'asc')->get();
        
        $usersData = $users->map(function ($user) {
            $avatar = null;
            if ($user->profile_picture) {
                if (filter_var($user->profile_picture, FILTER_VALIDATE_URL)) {
                    $avatar = $user->profile_picture;
                } else {
                    $avatar = Storage::disk('public')->url($user->profile_picture);
                }
            }
            
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $avatar,
            ];
        });
        
        return response()->json([
            'status' => 'success',
            'message' => 'Users retrieved successfully',
            'data' => [
                'users' => $usersData,
            ],
        ], 200);
    }

    /**
     * @OA\Get(
     *     path="/api/host/chat/conversations",
     *     summary="Get host conversations",
     *     description="Returns all conversations for properties owned by the authenticated host",
     *     tags={"Host Chat"},
     *     security={{"apiAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Conversations retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Host conversations retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="conversations",
     *                     type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="id", type="integer", example=1),
     *                         @OA\Property(property="customerName", type="string", example="John Doe"),
     *                         @OA\Property(property="customerAvatar", type="string", nullable=true, example="http://localhost:8000/storage/users/avatar.jpg"),
     *                         @OA\Property(property="property", type="string", example="Luxury Beachfront Villa"),
     *                         @OA\Property(property="propertyId", type="integer", example=1),
     *                         @OA\Property(property="lastMessage", type="string", example="Hello! I have a question"),
     *                         @OA\Property(property="lastMessageTime", type="string", format="date-time"),
     *                         @OA\Property(property="unreadCount", type="integer", example=2)
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Access denied - Host only",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Access denied. This resource is only available for Host accounts.")
     *         )
     *     )
     * )
     */
    public function conversations(): JsonResponse
    {
        $host = Auth::user();
        
        $propertyIds = Property::where('user_id', $host->id)->pluck('id');
        
        $conversations = Conversation::whereIn('property_id', $propertyIds)
            ->with(['property', 'user', 'lastMessage.files'])
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Host conversations retrieved successfully',
            'data' => [
                'conversations' => HostConversationResource::collection($conversations),
            ],
        ], 200);
    }

    /**
     * @OA\Get(
     *     path="/api/host/chat/conversations/{id}",
     *     summary="Get messages for a conversation",
     *     description="Returns all messages for a specific conversation",
     *     tags={"Host Chat"},
     *     security={{"apiAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Conversation ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Messages retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Messages retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="messages",
     *                     type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="id", type="integer", example=1),
     *                         @OA\Property(property="text", type="string", example="Hello!"),
     *                         @OA\Property(property="sender", type="string", enum={"customer", "host"}, example="customer"),
     *                         @OA\Property(property="timestamp", type="string", format="date-time"),
     *                         @OA\Property(property="read", type="boolean", example=true),
     *                         @OA\Property(
     *                             property="files",
     *                             type="array",
     *                             nullable=true,
     *                             @OA\Items(
     *                                 @OA\Property(property="id", type="integer", example=1),
     *                                 @OA\Property(property="type", type="string", enum={"image", "video"}, example="image"),
     *                                 @OA\Property(property="url", type="string", example="http://localhost:8000/storage/messages/file.jpg"),
     *                                 @OA\Property(property="name", type="string", example="image.jpg"),
     *                                 @OA\Property(property="size", type="integer", example=245000)
     *                             )
     *                         )
     *                     )
     *                 ),
     *                 @OA\Property(
     *                     property="conversation",
     *                     type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="customerName", type="string", example="John Doe"),
     *                     @OA\Property(property="customerAvatar", type="string", nullable=true),
     *                     @OA\Property(property="property", type="string", example="Luxury Beachfront Villa"),
     *                     @OA\Property(property="propertyId", type="integer", example=1),
     *                     @OA\Property(property="lastMessage", type="string"),
     *                     @OA\Property(property="lastMessageTime", type="string", format="date-time"),
     *                     @OA\Property(property="unreadCount", type="integer", example=0)
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Access denied",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Access denied")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Conversation not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Conversation not found")
     *         )
     *     )
     * )
     */
    public function messages($id): JsonResponse
    {
        $host = Auth::user();
        
        $propertyIds = Property::where('user_id', $host->id)->pluck('id');
        
        $conversation = Conversation::with(['property', 'user'])
            ->where('id', $id)
            ->whereIn('property_id', $propertyIds)
            ->first();

        if (!$conversation) {
            return response()->json([
                'status' => 'error',
                'message' => 'Conversation not found',
            ], 404);
        }

        Message::where('conversation_id', $id)
            ->where('sender_id', '!=', $host->id)
            ->update(['read' => true]);

        $messages = $conversation->messages()
            ->with(['files'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Messages retrieved successfully',
            'data' => [
                'messages' => HostMessageResource::collection($messages),
                'conversation' => new HostConversationResource($conversation),
            ],
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/host/chat/conversations/{id}/messages",
     *     summary="Send a message",
     *     description="Sends a message in a conversation",
     *     tags={"Host Chat"},
     *     security={{"apiAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Conversation ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="message", type="string", example="Hello! I have a question"),
     *                 @OA\Property(
     *                     property="files",
     *                     type="array",
     *                     description="Array of file uploads (images or videos)",
     *                     @OA\Items(type="string", format="binary")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Message sent successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Message sent successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="message",
     *                     type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="text", type="string", example="Hello!"),
     *                     @OA\Property(property="sender", type="string", enum={"customer", "host"}, example="host"),
     *                     @OA\Property(property="timestamp", type="string", format="date-time"),
     *                     @OA\Property(property="read", type="boolean", example=false),
     *                     @OA\Property(
     *                         property="files",
     *                         type="array",
     *                         nullable=true,
     *                         @OA\Items(
     *                             @OA\Property(property="id", type="integer", example=1),
     *                             @OA\Property(property="type", type="string", enum={"image", "video"}, example="image"),
     *                             @OA\Property(property="url", type="string", example="http://localhost:8000/storage/messages/file.jpg"),
     *                             @OA\Property(property="name", type="string", example="image.jpg"),
     *                             @OA\Property(property="size", type="integer", example=245000)
     *                         )
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Access denied",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Access denied")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Conversation not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Conversation not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function sendMessage(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'message' => 'sometimes|string|max:5000',
            'files' => 'sometimes|array|max:5',
            'files.*' => 'file|mimes:jpeg,jpg,png,gif,mp4,mov,avi|max:10240',
        ]);

        $host = Auth::user();
        
        $propertyIds = Property::where('user_id', $host->id)->pluck('id');
        
        $conversation = Conversation::with('property')
            ->where('id', $id)
            ->whereIn('property_id', $propertyIds)
            ->first();

        if (!$conversation) {
            return response()->json([
                'status' => 'error',
                'message' => 'Conversation not found',
            ], 404);
        }

        $message = Message::create([
            'conversation_id' => $id,
            'sender_id' => $host->id,
            'sender_type' => 'host',
            'message' => $request->input('message'),
            'read' => false,
        ]);

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $filePath = $file->store('messages', 'public');
                $mimeType = $file->getMimeType();
                $type = str_starts_with($mimeType, 'image/') ? 'image' : 'video';

                MessageFile::create([
                    'message_id' => $message->id,
                    'type' => $type,
                    'file_path' => $filePath,
                    'file_name' => $file->getClientOriginalName(),
                    'mime_type' => $mimeType,
                    'file_size' => $file->getSize(),
                ]);
            }
        }

        $conversation->touch();

        $message->load(['files']);

        return response()->json([
            'status' => 'success',
            'message' => 'Message sent successfully',
            'data' => [
                'message' => new HostMessageResource($message),
            ],
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/host/chat/conversations",
     *     summary="Create or get conversation",
     *     description="Creates a new conversation with a user or returns existing one",
     *     tags={"Host Chat"},
     *     security={{"apiAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"user_id", "property_id"},
     *             @OA\Property(property="user_id", type="integer", example=1),
     *             @OA\Property(property="property_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Conversation retrieved/created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Conversation retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="conversation",
     *                     type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="customerName", type="string", example="John Doe"),
     *                     @OA\Property(property="customerAvatar", type="string", nullable=true),
     *                     @OA\Property(property="property", type="string", example="Luxury Beachfront Villa"),
     *                     @OA\Property(property="propertyId", type="integer", example=1),
     *                     @OA\Property(property="lastMessage", type="string"),
     *                     @OA\Property(property="lastMessageTime", type="string", format="date-time"),
     *                     @OA\Property(property="unreadCount", type="integer", example=0)
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Access denied",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Access denied. This property does not belong to you.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Property or User not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Property not found")
     *         )
     *     )
     * )
     */
    public function createOrGet(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'property_id' => 'required|integer|exists:properties,id',
        ]);

        $host = Auth::user();
        
        $property = Property::where('id', $validated['property_id'])
            ->where('user_id', $host->id)
            ->first();

        if (!$property) {
            return response()->json([
                'status' => 'error',
                'message' => 'Property not found or does not belong to you',
            ], 404);
        }

        $user = User::find($validated['user_id']);
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found',
            ], 404);
        }

        $conversation = Conversation::firstOrCreate(
            [
                'user_id' => $validated['user_id'],
                'property_id' => $validated['property_id'],
            ],
            [
                'user_id' => $validated['user_id'],
                'property_id' => $validated['property_id'],
            ]
        );

        $conversation->load(['property', 'user', 'lastMessage']);

        return response()->json([
            'status' => 'success',
            'message' => 'Conversation retrieved successfully',
            'data' => [
                'conversation' => new HostConversationResource($conversation),
            ],
        ], 200);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\MessageRequest;
use App\Http\Requests\ConversationRequest;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Events\MessageSent;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageFile;
use App\Models\Property;
use App\Enums\PropertyStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

/**
 * @OA\Tag(
 *     name="Messages",
 *     description="API endpoints for chat and messaging"
 * )
 */
class MessagesController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/messages/conversations",
     *     summary="Get user conversations",
     *     description="Returns all conversations for the authenticated user",
     *     tags={"Messages"},
     *     security={{"apiAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Conversations retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Conversations retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="conversations",
     *                     type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="id", type="integer", example=1),
     *                         @OA\Property(property="hostName", type="string", example="Sarah Johnson"),
     *                         @OA\Property(property="hostAvatar", type="string", example="http://localhost:8000/storage/users/avatar.jpg"),
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
     *     )
     * )
     */
    public function conversations(): JsonResponse
    {
        $user = Auth::user();
        
        $conversations = Conversation::where('user_id', $user->id)
            ->with(['property.user', 'lastMessage.files'])
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Conversations retrieved successfully',
            'data' => [
                'conversations' => ConversationResource::collection($conversations),
            ],
        ], 200);
    }

    /**
     * List properties (with host info) that the user can start a conversation with.
     */
    public function propertiesToMessage(): JsonResponse
    {
        $user = Auth::user();

        $properties = Property::where('status', 'Active')
            ->where('approval_status', PropertyStatus::APPROVED)
            ->with('user')
            ->orderBy('title')
            ->limit(100)
            ->get();

        $list = $properties->map(function ($property) {
            $host = $property->user;
            $hostAvatar = null;
            if ($host && $host->profile_picture) {
                $hostAvatar = filter_var($host->profile_picture, FILTER_VALIDATE_URL)
                    ? $host->profile_picture
                    : Storage::url($host->profile_picture);
            }
            return [
                'propertyId' => $property->id,
                'property' => $property->title,
                'hostName' => $host->name ?? 'Unknown',
                'hostAvatar' => $hostAvatar,
            ];
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Properties retrieved successfully',
            'data' => [
                'properties' => $list,
            ],
        ], 200);
    }

    /**
     * @OA\Get(
     *     path="/api/messages/conversations/{conversation_id}",
     *     summary="Get messages for a conversation",
     *     description="Returns all messages for a specific conversation",
     *     tags={"Messages"},
     *     security={{"apiAuth": {}}},
     *     @OA\Parameter(
     *         name="conversation_id",
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
     *                         @OA\Property(property="sender", type="string", enum={"user", "host"}, example="user"),
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
     *                     @OA\Property(property="hostName", type="string", example="Sarah Johnson"),
     *                     @OA\Property(property="hostAvatar", type="string", nullable=true, example="http://localhost:8000/storage/users/avatar.jpg"),
     *                     @OA\Property(property="property", type="string", example="Luxury Beachfront Villa"),
     *                     @OA\Property(property="propertyId", type="integer", example=1),
     *                     @OA\Property(property="lastMessage", type="string", example="Hello! I have a question"),
     *                     @OA\Property(property="lastMessageTime", type="string", format="date-time"),
     *                     @OA\Property(property="unreadCount", type="integer", example=2)
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
     *     )
     * )
     */
    public function messages(Request $request, $conversationId): JsonResponse
    {
        $user = Auth::user();
        
        $conversation = Conversation::with(['property.user'])
            ->findOrFail($conversationId);

        if ($conversation->user_id !== $user->id && $conversation->property->user_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Access denied',
            ], 403);
        }

        Message::where('conversation_id', $conversationId)
            ->where('sender_id', '!=', $user->id)
            ->update(['read' => true]);

        $messages = $conversation->messages()
            ->with(['files', 'conversation'])
            ->orderBy('created_at', 'asc')
            ->get();

        $messagesList = $messages->map(fn ($m) => (new MessageResource($m))->toArray($request))->values()->all();

        return response()->json([
            'status' => 'success',
            'message' => 'Messages retrieved successfully',
            'data' => [
                'messages' => $messagesList,
                'conversation' => new ConversationResource($conversation),
            ],
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/messages/conversations",
     *     summary="Create or get conversation",
     *     description="Creates a new conversation or returns existing one for a property",
     *     tags={"Messages"},
     *     security={{"apiAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"property_id"},
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
     *                     @OA\Property(property="hostName", type="string", example="Sarah Johnson"),
     *                     @OA\Property(property="hostAvatar", type="string", nullable=true, example="http://localhost:8000/storage/users/avatar.jpg"),
     *                     @OA\Property(property="property", type="string", example="Luxury Beachfront Villa"),
     *                     @OA\Property(property="propertyId", type="integer", example=1),
     *                     @OA\Property(property="lastMessage", type="string", example="Hello! I have a question"),
     *                     @OA\Property(property="lastMessageTime", type="string", format="date-time"),
     *                     @OA\Property(property="unreadCount", type="integer", example=2)
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function createOrGet(ConversationRequest $request): JsonResponse
    {
        $user = Auth::user();
        $propertyId = $request->input('property_id');

        $property = Property::where('id', $propertyId)
            ->where('status', 'Active')
            ->where('approval_status', PropertyStatus::APPROVED)
            ->first();

        if (!$property) {
            return response()->json([
                'status' => 'error',
                'message' => 'Property not found',
            ], 404);
        }

        $conversation = Conversation::firstOrCreate(
            [
                'user_id' => $user->id,
                'property_id' => $propertyId,
            ],
            [
                'user_id' => $user->id,
                'property_id' => $propertyId,
            ]
        );

        $conversation->load(['property.user', 'lastMessage']);

        $conversationPayload = (new ConversationResource($conversation))->toArray($request);
        $conversationPayload['messages'] = [];

        return response()->json([
            'status' => 'success',
            'message' => 'Conversation retrieved successfully',
            'data' => [
                'conversation' => $conversationPayload,
            ],
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/messages/conversations/{conversation_id}/messages",
     *     summary="Send a message",
     *     description="Sends a message in a conversation",
     *     tags={"Messages"},
     *     security={{"apiAuth": {}}},
     *     @OA\Parameter(
     *         name="conversation_id",
     *         in="path",
     *         description="Conversation ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Hello! I have a question"),
     *             @OA\Property(
     *                 property="files",
     *                 type="array",
     *                 description="Array of file uploads (images or videos)",
     *                 @OA\Items(type="string", format="binary")
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
     *                     @OA\Property(property="sender", type="string", enum={"user", "host"}, example="user"),
     *                     @OA\Property(property="timestamp", type="string", format="date-time"),
     *                     @OA\Property(property="read", type="boolean", example=true),
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
     *     )
     * )
     */
    public function sendMessage(MessageRequest $request, $conversationId): JsonResponse
    {
        $user = Auth::user();
        
        $conversation = Conversation::findOrFail($conversationId);

        if ($conversation->user_id !== $user->id && $conversation->property->user_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Access denied',
            ], 403);
        }

        $senderType = ($conversation->user_id === $user->id) ? 'user' : 'host';

        $message = Message::create([
            'conversation_id' => $conversationId,
            'sender_id' => $user->id,
            'sender_type' => $senderType,
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
        broadcast(new MessageSent($message))->toOthers();

        return response()->json([
            'status' => 'success',
            'message' => 'Message sent successfully',
            'data' => [
                'message' => new MessageResource($message),
            ],
        ], 200);
    }
}


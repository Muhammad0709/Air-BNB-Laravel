<?php

namespace App\Http\Controllers\Host;

use App\Http\Controllers\Controller;
use App\Http\Resources\HostConversationResource;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function index(Request $request)
    {
        $conversations = Conversation::whereHas('property', fn ($q) => $q->where('user_id', Auth::id()))
            ->with(['user', 'property', 'lastMessage.files'])
            ->orderBy('updated_at', 'desc')
            ->get();

        $data = HostConversationResource::collection($conversations)->toArray($request);
        $conversationsList = $data['data'] ?? $data;

        return Inertia::render('Host/Chat/Index', [
            'conversations' => $conversationsList,
        ]);
    }
}

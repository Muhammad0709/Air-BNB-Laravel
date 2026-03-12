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
        $search = $request->search;
        
        $conversations = Conversation::whereHas('property', fn ($q) => $q->where('user_id', Auth::id()))
            ->with(['user', 'property', 'lastMessage.files'])
            ->when($search, function ($q) use ($search) {
                $q->where(function ($query) use ($search) {
                    $query->whereHas('property', function ($pq) use ($search) {
                        $pq->where('title', 'like', "%{$search}%");
                    })
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('lastMessage', function ($mq) use ($search) {
                        $mq->where('message', 'like', "%{$search}%");
                    });
                });
            })
            ->orderBy('updated_at', 'desc')
            ->get();

        $data = HostConversationResource::collection($conversations)->toArray($request);
        $conversationsList = $data['data'] ?? $data;

        return Inertia::render('Host/Chat/Index', [
            'conversations' => $conversationsList,
        ]);
    }

    public function destroyConversation(Conversation $conversation)
    {
        $propertyIds = \App\Models\Property::where('user_id', Auth::id())->pluck('id');
        if (! $propertyIds->contains($conversation->property_id)) {
            abort(403);
        }
        $conversation->delete();
        return response()->noContent();
    }
}

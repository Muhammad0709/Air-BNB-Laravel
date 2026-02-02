<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class HostConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $host = $request->user();
        
        $unreadCount = $this->messages()
            ->where('sender_id', '!=', $host->id)
            ->where('read', false)
            ->count();

        return [
            'id' => $this->id,
            'customerName' => $this->user->name ?? 'Unknown',
            'customerAvatar' => $this->user->profile_picture 
                ? (str_starts_with($this->user->profile_picture, 'http') 
                    ? $this->user->profile_picture 
                    : Storage::disk('public')->url($this->user->profile_picture))
                : null,
            'property' => $this->property->title ?? 'Unknown Property',
            'propertyId' => $this->property->id ?? null,
            'lastMessage' => $this->lastMessage->message ?? '',
            'lastMessageTime' => ($this->lastMessage->created_at ?? $this->created_at)->toISOString(),
            'unreadCount' => $unreadCount,
        ];
    }
}

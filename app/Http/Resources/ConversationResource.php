<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $property = $this->property;
        $host = $property->user ?? null;
        
        $lastMessage = $this->lastMessage;
        $unreadCount = $this->messages()
            ->where('sender_id', '!=', $user->id)
            ->where('read', false)
            ->count();

        $lastMessageText = '';
        if ($lastMessage) {
            $lastMessageText = $lastMessage->message ?? '';
            if ($lastMessage->files && $lastMessage->files->isNotEmpty() && empty($lastMessageText)) {
                $lastMessageText = '';
            }
        }

        $hostAvatar = null;
        if ($host && $host->profile_picture) {
            $hostAvatar = filter_var($host->profile_picture, FILTER_VALIDATE_URL) 
                ? $host->profile_picture 
                : Storage::url($host->profile_picture);
        }

        return [
            'id' => $this->id,
            'hostName' => $host->name ?? 'Unknown',
            'hostAvatar' => $hostAvatar,
            'property' => $property->title,
            'propertyId' => $property->id,
            'lastMessage' => $lastMessageText,
            'lastMessageTime' => $lastMessage ? $lastMessage->created_at->toISOString() : $this->created_at->toISOString(),
            'unreadCount' => $unreadCount,
        ];
    }
}

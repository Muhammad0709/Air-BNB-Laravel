<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Message $message
    ) {
        $this->message->load(['conversation', 'files']);
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.'.$this->message->conversation_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    public function broadcastWith(): array
    {
        $conversation = $this->message->conversation;
        $senderType = ($conversation->user_id === $this->message->sender_id) ? 'user' : 'host';

        $files = $this->message->files->map(function ($file) {
            return [
                'id' => (string) $file->id,
                'type' => $file->type,
                'url' => Storage::disk('public')->url($file->file_path),
                'name' => $file->file_name,
                'size' => $file->file_size,
            ];
        });

        return [
            'id' => $this->message->id,
            'text' => $this->message->message,
            'sender' => $senderType,
            'timestamp' => $this->message->created_at->toISOString(),
            'read' => $this->message->read,
            'files' => $files->isEmpty() ? null : $files->all(),
        ];
    }
}

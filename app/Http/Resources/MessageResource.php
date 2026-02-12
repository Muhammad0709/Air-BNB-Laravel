<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $senderType = ($this->sender_id === $this->conversation->user_id) ? 'customer' : 'host';

        $files = $this->files->map(function ($file) {
            $fileUrl = Storage::disk('public')->url($file->file_path);
            return [
                'id' => $file->id,
                'type' => $file->type,
                'url' => $fileUrl,
                'name' => $file->file_name,
                'size' => $file->file_size,
            ];
        });

        return [
            'id' => $this->id,
            'text' => $this->message,
            'sender' => $senderType,
            'timestamp' => $this->created_at->toISOString(),
            'read' => $this->read,
            'files' => $files->isEmpty() ? null : $files,
        ];
    }
}


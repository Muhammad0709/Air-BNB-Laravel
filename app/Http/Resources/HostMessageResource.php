<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class HostMessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $host = $request->user();

        return [
            'id' => $this->id,
            'text' => $this->message,
            'sender' => $this->sender_id === $host->id ? 'host' : 'customer',
            'timestamp' => $this->created_at->toISOString(),
            'read' => $this->read,
            'files' => $this->files->isEmpty() ? null : $this->files->map(fn($file) => [
                'id' => $file->id,
                'type' => $file->type,
                'url' => Storage::disk('public')->url($file->file_path),
                'name' => $file->file_name,
                'size' => $file->file_size,
            ]),
        ];
    }
}

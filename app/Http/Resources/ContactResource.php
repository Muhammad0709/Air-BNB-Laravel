<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ContactResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $files = collect($this->files ?? [])->map(function ($file) {
            return [
                'file_name' => $file['file_name'] ?? '',
                'file_url' => Storage::url($file['file_path'] ?? ''),
                'mime_type' => $file['mime_type'] ?? '',
                'file_size' => $file['file_size'] ?? 0,
            ];
        });

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'subject' => $this->subject,
            'created_at' => $this->created_at->toISOString(),
            'files' => $files,
        ];
    }
}

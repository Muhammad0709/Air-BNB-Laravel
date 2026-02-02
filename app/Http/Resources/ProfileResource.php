<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProfileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $profilePicture = null;
        if ($this->profile_picture) {
            $profilePicture = filter_var($this->profile_picture, FILTER_VALIDATE_URL) 
                ? $this->profile_picture 
                : Storage::url($this->profile_picture);
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'bio' => $this->bio,
            'profile_picture' => $profilePicture,
            'type' => $this->type->value ?? $this->type,
            'currency' => $this->currency ?? 'USD',
        ];
    }
}

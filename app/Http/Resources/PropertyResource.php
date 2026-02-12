<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PropertyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Calculate average rating and review count
        $reviews = $this->reviews;
        $reviewCount = $reviews->count();
        $averageRating = $reviewCount > 0 ? round($reviews->avg('rating'), 2) : 0;

        // First image as full URL
        $image = null;
        if ($this->images) {
            $imagesArray = is_string($this->images) ? json_decode($this->images, true) : $this->images;
            if (is_array($imagesArray) && !empty($imagesArray)) {
                $image = asset(Storage::url($imagesArray[0]));
            }
        }
        if (!$image && $this->image) {
            $image = asset(Storage::url($this->image));
        }

        return [
            'id' => $this->id,
            'title' => $this->title,
            'location' => $this->location,
            'price' => (float) $this->price,
            'rating' => $averageRating,
            'reviews' => $reviewCount,
            'image' => $image,
            'isGuestFavorite' => $this->is_guest_favorite ?? false,
        ];
    }
}


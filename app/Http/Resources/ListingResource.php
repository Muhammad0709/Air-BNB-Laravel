<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ListingResource extends JsonResource
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

        // Expose the complete gallery so cards can show all uploaded images.
        $imagesArray = is_string($this->images) ? json_decode($this->images, true) : $this->images;
        $imagesArray = is_array($imagesArray) ? array_values(array_filter($imagesArray)) : [];
        if ($imagesArray === [] && $this->image) {
            $imagesArray = [$this->image];
        }

        $images = array_map(
            fn ($path) => filter_var($path, FILTER_VALIDATE_URL) ? $path : asset(Storage::url($path)),
            $imagesArray
        );
        $image = $images[0] ?? null;

        return [
            'id' => $this->id,
            'title' => $this->title,
            'location' => $this->location,
            'price' => (float) $this->price,
            'rating' => $averageRating,
            'reviews' => $reviewCount,
            'image' => $image,
            'images' => $images,
            'isGuestFavorite' => $this->is_guest_favorite ?? false,
        ];
    }
}

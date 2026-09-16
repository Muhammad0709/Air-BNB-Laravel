<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Support\StayNights;

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

        $images = $this->getImageUrls();

        return [
            'id' => $this->id,
            'title' => $this->title,
            'location' => $this->location,
            'price' => (float) $this->price,
            'nights' => StayNights::between($this->check_in_date, $this->check_out_date),
            'check_in_date' => $this->check_in_date?->format('Y-m-d'),
            'check_out_date' => $this->check_out_date?->format('Y-m-d'),
            'bedrooms' => $this->bedrooms,
            'beds' => $this->beds,
            'bathrooms' => $this->bathrooms,
            'rating' => $averageRating,
            'reviews' => $reviewCount,
            'image' => $images[0] ?? null,
            'images' => $images,
            'isGuestFavorite' => $this->is_guest_favorite ?? false,
            'host' => $this->whenLoaded('user', fn() => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ]),
        ];
    }
}

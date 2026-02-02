<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class HostPropertyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $image = null;
        if ($this->images) {
            $imagesArray = is_string($this->images) ? json_decode($this->images, true) : $this->images;
            if (is_array($imagesArray) && !empty($imagesArray)) {
                $imagePath = Storage::disk('public')->url($imagesArray[0]);
                $image = filter_var($imagePath, FILTER_VALIDATE_URL) ? $imagePath : $request->getSchemeAndHttpHost() . $imagePath;
            }
        }
        if (!$image && $this->image) {
            $imagePath = Storage::disk('public')->url($this->image);
            $image = filter_var($imagePath, FILTER_VALIDATE_URL) ? $imagePath : $request->getSchemeAndHttpHost() . $imagePath;
        }

        $bookingsCount = $this->whenLoaded('bookings') 
            ? $this->bookings->count() 
            : ($this->bookings_count ?? $this->bookings()->count());

        return [
            'id' => $this->id,
            'title' => $this->title,
            'location' => $this->location,
            'price' => (float) $this->price,
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'guests' => $this->guests,
            'property_type' => $this->property_type,
            'status' => $this->status,
            'approval_status' => $this->approval_status,
            'description' => $this->description,
            'image' => $image,
            'bookings_count' => $bookingsCount,
            'airport_pickup_enabled' => $this->airport_pickup_enabled ?? false,
            'airport' => $this->airport,
            'pickup_start_time' => $this->pickup_start_time,
            'pickup_end_time' => $this->pickup_end_time,
            'airport_pickup_price' => $this->airport_pickup_price ? (float) $this->airport_pickup_price : null,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

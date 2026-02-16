<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class BookingHistoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $property = $this->property;

        // Property image as full URL
        $image = null;
        if ($property) {
            if ($property->images) {
                $imagesArray = is_string($property->images) ? json_decode($property->images, true) : $property->images;
                if (is_array($imagesArray) && !empty($imagesArray)) {
                    $image = asset(Storage::url($imagesArray[0]));
                }
            }
            if (!$image && $property->image) {
                $image = asset(Storage::url($property->image));
            }
        }

        $status = $this->status->value;

        // Format amount with currency
        $amount = '$' . number_format((float) $this->total_amount, 0);

        // Calculate total guests
        $totalGuests = $this->adults + $this->children;

        return [
            'id' => $this->id,
            'property' => $property ? $property->title : 'Unknown Property',
            'propertyLocation' => $property ? $property->location : '',
            'image' => $image,
            'checkin' => $this->check_in_date->format('Y-m-d'),
            'checkout' => $this->check_out_date->format('Y-m-d'),
            'status' => $status,
            'amount' => $amount,
            'nights' => $this->nights,
            'guests' => $totalGuests,
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'property_id' => $this->property_id,
            'name' => $this->name,
            'email' => $this->email,
            'phone_code' => $this->phone_code,
            'phone' => $this->phone,
            'rooms' => $this->rooms,
            'adults' => $this->adults,
            'children' => $this->children,
            'check_in_date' => $this->check_in_date->format('Y-m-d'),
            'check_out_date' => $this->check_out_date->format('Y-m-d'),
            'nights' => $this->nights,
            'nightly_rate' => (float) $this->nightly_rate,
            'cleaning_fee' => (float) $this->cleaning_fee,
            'service_fee' => (float) $this->service_fee,
            'total_amount' => (float) $this->total_amount,
            'status' => $this->status->value,
            'payment_method' => $this->payment_method,
            'card_last_four' => $this->card_last_four,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}

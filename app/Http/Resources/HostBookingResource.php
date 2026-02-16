<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HostBookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'guest' => $this->name,
            'property' => $this->whenLoaded('property', fn() => $this->property->title),
            'propertyId' => $this->property_id,
            'checkin' => $this->check_in_date->format('Y-m-d'),
            'checkout' => $this->check_out_date->format('Y-m-d'),
            'status' => $this->status->value,
            'amount' => '$' . number_format((float) $this->total_amount, 2, '.', ','),
            'total_amount' => (float) $this->total_amount,
            'email' => $this->email,
            'phone' => trim($this->phone_code . ' ' . $this->phone),
            'nights' => $this->nights,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

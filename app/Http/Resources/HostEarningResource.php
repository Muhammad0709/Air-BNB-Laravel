<?php

namespace App\Http\Resources;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HostEarningResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $commissionRate = (float) (Setting::get('commission_rate', 10) / 100);
        $commission = (float) $this->total_amount * $commissionRate;
        $netAmount = (float) $this->total_amount - $commission;
        
        return [
            'id' => $this->id,
            'bookingId' => 'BK-' . str_pad($this->id, 6, '0', STR_PAD_LEFT),
            'guest' => $this->name,
            'property' => $this->property->title ?? 'Unknown Property',
            'propertyId' => $this->property_id,
            'date' => $this->created_at->format('Y-m-d'),
            'amount' => '$' . number_format($this->total_amount, 2),
            'status' => $this->status === 'completed' ? 'Paid' : 'Pending',
            'payoutDate' => $this->status === 'completed' ? $this->updated_at->format('Y-m-d') : '-',
            'nights' => $this->nights,
            'commission' => '$' . number_format($commission, 2, '.', ','),
            'netAmount' => '$' . number_format($netAmount, 2, '.', ','),
            'checkin' => $this->check_in_date->format('Y-m-d'),
            'checkout' => $this->check_out_date->format('Y-m-d'),
        ];
    }
}

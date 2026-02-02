<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HostPayoutResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $method = $this->method === 'bank_transfer' ? 'Bank Transfer' : 'PayPal';
        $account = $this->method === 'bank_transfer' 
            ? '****' . substr($this->account_number, -4)
            : $this->paypal_email;
        
        $status = match($this->status) {
            'pending' => 'Pending',
            'processing' => 'Processing',
            'completed' => 'Completed',
            'failed' => 'Failed',
            default => 'Pending'
        };

        return [
            'id' => $this->id,
            'payoutId' => $this->payout_id,
            'amount' => '$' . number_format((float) $this->amount, 2, '.', ','),
            'date' => $this->created_at->format('Y-m-d'),
            'method' => $method,
            'status' => $status,
            'account' => $account,
            'transactionId' => $this->transaction_id,
            'processedDate' => $this->processed_at?->format('Y-m-d'),
            'accountName' => $this->account_name,
            'bankName' => $this->bank_name,
            'notes' => $this->notes,
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}

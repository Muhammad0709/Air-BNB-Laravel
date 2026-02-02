<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class HostEarningsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // For index/list requests (GET with query params)
        if ($this->isMethod('GET') && !$this->route('id')) {
            return [
                'search' => 'sometimes|string|max:255',
                'page' => 'sometimes|integer|min:1',
                'per_page' => 'sometimes|integer|min:1|max:50',
            ];
        }
        
        // For payout request (POST /payouts)
        if ($this->isMethod('POST') && str_contains($this->path(), 'payouts')) {
            return [
                'amount' => 'required|numeric|min:0.01',
                'method' => 'required|string|in:bank_transfer,paypal',
                'account_name' => 'required_if:method,bank_transfer|string|max:255',
                'bank_name' => 'required_if:method,bank_transfer|string|max:255',
                'account_number' => 'required_if:method,bank_transfer|string|max:255',
                'routing_number' => 'required_if:method,bank_transfer|string|max:255',
                'paypal_email' => 'required_if:method,paypal|email|max:255',
                'notes' => 'nullable|string|max:1000',
            ];
        }
        
        return [];
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class HostBookingRequest extends FormRequest
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
                'status' => 'sometimes|string|in:pending,confirmed,cancelled,completed',
                'page' => 'sometimes|integer|min:1',
                'per_page' => 'sometimes|integer|min:1|max:50',
            ];
        }
        
        // For store/create requests
        if ($this->isMethod('POST')) {
            return [
                'property_id' => 'required|integer|exists:properties,id',
                'guest' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'required|string|max:20',
                'checkin' => 'required|date',
                'checkout' => 'required|date|after:checkin',
                'amount' => 'required|numeric|min:0',
                'status' => 'sometimes|string|in:Pending,Confirmed,Cancelled',
            ];
        }
        
        // For update requests
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            return [
                'property_id' => 'sometimes|required|integer|exists:properties,id',
                'guest' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|email|max:255',
                'phone' => 'sometimes|required|string|max:20',
                'checkin' => 'sometimes|required|date',
                'checkout' => 'sometimes|required|date|after:checkin',
                'amount' => 'sometimes|required|numeric|min:0',
                'status' => 'sometimes|string|in:Pending,Confirmed,Cancelled',
            ];
        }
        
        return [];
    }
}

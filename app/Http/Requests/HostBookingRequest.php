<?php

namespace App\Http\Requests;

use App\Enums\BookingStatus;
use Illuminate\Foundation\Http\FormRequest;

class HostBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $statusRule = 'sometimes|string|in:' . implode(',', BookingStatus::values());

        // For index/list requests (GET with query params)
        if ($this->isMethod('GET') && ! $this->route('id')) {
            return [
                'search' => 'sometimes|string|max:255',
                'status' => $statusRule,
                'page' => 'sometimes|integer|min:1',
                'per_page' => 'sometimes|integer|min:1|max:50',
            ];
        }

        // For store/create requests
        if ($this->isMethod('POST')) {
            return [
                'property_id' => 'required|integer|exists:properties,id',
                'guest' => ['required', 'string', 'max:255', 'regex:/^(?=.*\p{L})[\p{L} ]+$/u'],
                'email' => 'required|email|max:255',
                'phone' => 'required|string|regex:/^\d{7,15}$/',
                'checkin' => 'required|date',
                'checkout' => 'required|date|after:checkin',
                'amount' => 'required|numeric|min:0',
                'status' => $statusRule,
            ];
        }

        // For update requests
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            return [
                'property_id' => 'sometimes|required|integer|exists:properties,id',
                'guest' => ['sometimes', 'required', 'string', 'max:255', 'regex:/^(?=.*\p{L})[\p{L} ]+$/u'],
                'email' => 'sometimes|required|email|max:255',
                'phone' => 'sometimes|required|string|regex:/^\d{7,15}$/',
                'checkin' => 'sometimes|required|date',
                'checkout' => 'sometimes|required|date|after:checkin',
                'amount' => 'sometimes|required|numeric|min:0',
                'status' => $statusRule,
            ];
        }

        return [];
    }

    /**
     * Get custom messages for validator errors (translated).
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'checkout.after' => __('validation.custom.checkout.after'),
        ];
    }
}

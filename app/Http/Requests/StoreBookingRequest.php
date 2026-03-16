<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'property_id' => ['required', 'integer', 'exists:properties,id'],
            'checkin' => ['required', 'date'],
            'checkout' => ['required', 'date', 'after:checkin'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email'],
            'phone_code' => ['nullable', 'string', 'max:10'],
            'phone' => ['required', 'string', 'max:20'],
            'rooms' => ['nullable', 'integer', 'min:1', 'max:20'],
            'adults' => ['nullable', 'integer', 'min:1', 'max:50'],
            'children' => ['nullable', 'integer', 'min:0', 'max:20'],
        ];
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

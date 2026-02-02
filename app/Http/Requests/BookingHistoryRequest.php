<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BookingHistoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => 'sometimes|string|in:upcoming,past,all',
            'search' => 'sometimes|string|max:255',
            'status' => 'sometimes|string|in:pending,confirmed,cancelled,completed',
        ];
    }
}

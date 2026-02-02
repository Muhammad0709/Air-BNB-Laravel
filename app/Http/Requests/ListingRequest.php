<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ListingRequest extends FormRequest
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
            'search' => 'sometimes|string|max:255',
            'location' => 'sometimes|string|max:255',
            'locations' => 'sometimes',
            'min_price' => 'sometimes|numeric|min:0',
            'max_price' => 'sometimes|numeric|min:0|gte:min_price',
            'guests' => 'sometimes|integer|min:1',
            'checkin' => 'sometimes|date',
            'checkout' => 'sometimes|date|after:checkin',
            'sort_by' => 'sometimes|string|in:featured,price_low,price_high,rating_high',
            'page' => 'sometimes|integer|min:1',
            'per_page' => 'sometimes|integer|min:1|max:50',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Normalize locations parameter - handle both string and array
        if ($this->has('locations')) {
            $locations = $this->input('locations');
            
            // If it's a string, convert to array
            if (is_string($locations)) {
                $this->merge([
                    'locations' => [$locations],
                ]);
            }
            // If it's already an array, ensure all values are strings
            elseif (is_array($locations)) {
                $this->merge([
                    'locations' => array_filter(array_map('trim', $locations)),
                ]);
            }
        }
        
        // If single location is provided, also add it to locations array for consistency
        if ($this->has('location') && !$this->has('locations')) {
            $this->merge([
                'locations' => [$this->input('location')],
            ]);
        }
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'max_price.gte' => 'The maximum price must be greater than or equal to the minimum price.',
            'checkout.after' => 'The checkout date must be after the check-in date.',
        ];
    }
}


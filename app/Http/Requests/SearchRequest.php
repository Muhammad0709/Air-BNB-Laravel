<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'location' => 'sometimes|string|max:255',
            'search' => 'sometimes|string|max:255',
            'locations' => 'sometimes|array',
            'locations.*' => 'string|max:255',
            'min_price' => 'sometimes|numeric|min:0',
            'max_price' => 'sometimes|numeric|min:0',
            'guests' => 'sometimes|integer|min:1',
            'adults' => 'sometimes|integer|min:0',
            'children' => 'sometimes|integer|min:0',
            'rooms' => 'sometimes|integer|min:1',
            'checkin' => 'sometimes|date',
            'checkout' => 'sometimes|date|after_or_equal:checkin',
            'sort_by' => 'sometimes|string|in:featured,price_low,price_high,rating_high,newest',
            'page' => 'sometimes|integer|min:1',
            'per_page' => 'sometimes|integer|min:1|max:50',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('location') && ! $this->has('locations')) {
            $this->merge([
                'locations' => array_filter([$this->input('location')]),
            ]);
        }
        if ($this->has('locations') && is_string($this->input('locations'))) {
            $this->merge([
                'locations' => array_filter([$this->input('locations')]),
            ]);
        }
    }
}

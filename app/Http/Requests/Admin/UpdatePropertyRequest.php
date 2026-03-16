<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'location' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'bedrooms' => ['required', 'integer', 'min:0'],
            'bathrooms' => ['required', 'integer', 'min:0'],
            'guests' => ['required', 'integer', 'min:1'],
            'property_type' => ['required', 'in:apartment,house,villa,studio,condo'],
            'status' => ['required', 'in:Active,Inactive'],
            'description' => ['nullable', 'string'],
            'amenities' => ['nullable', 'array'],
            'image' => ['nullable', 'sometimes', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
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
            'title.required' => __('validation.property.title_required'),
            'title.max' => __('validation.property.title_max'),
            'location.required' => __('validation.property.location_required'),
            'location.max' => __('validation.property.location_max'),
            'price.required' => __('validation.property.price_required'),
            'price.numeric' => __('validation.property.price_numeric'),
            'price.min' => __('validation.property.price_min'),
            'property_type.required' => __('validation.property.property_type_required'),
            'property_type.in' => __('validation.property.property_type_in'),
            'bedrooms.required' => __('validation.property.bedrooms_required'),
            'bedrooms.integer' => __('validation.property.bedrooms_integer'),
            'bedrooms.min' => __('validation.property.bedrooms_min'),
            'bathrooms.required' => __('validation.property.bathrooms_required'),
            'bathrooms.integer' => __('validation.property.bathrooms_integer'),
            'bathrooms.min' => __('validation.property.bathrooms_min'),
            'guests.required' => __('validation.property.guests_required'),
            'guests.integer' => __('validation.property.guests_integer'),
            'guests.min' => __('validation.property.guests_min'),
            'description.required' => __('validation.property.description_required'),
        ];
    }
}

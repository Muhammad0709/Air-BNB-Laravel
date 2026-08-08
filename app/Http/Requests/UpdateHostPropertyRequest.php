<?php

namespace App\Http\Requests;

use App\Enums\CancellationPolicy;
use App\Enums\PropertyType;
use Illuminate\Foundation\Http\FormRequest;

class UpdateHostPropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $v = $this->input('airport_pickup_enabled');
        if (is_string($v)) {
            $this->merge(['airport_pickup_enabled' => in_array(strtolower($v), ['true', '1', 'yes'], true)]);
        }
        $v = $this->input('guided_tours_enabled');
        if (is_string($v)) {
            $this->merge(['guided_tours_enabled' => in_array(strtolower($v), ['true', '1', 'yes'], true)]);
        }
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'property_type' => ['required', 'in:' . implode(',', array_column(PropertyType::cases(), 'value'))],
            'bedrooms' => ['required', 'integer', 'min:1'],
            'bathrooms' => ['required', 'integer', 'min:1'],
            'guests' => ['required', 'integer', 'min:1'],
            'price' => ['required', 'numeric', 'min:0'],
            'deposit_amount' => ['nullable', 'numeric', 'min:0'],
            'location' => ['required', 'string', 'max:255'],
            'timezone' => ['nullable', 'timezone'],
            'cancellation_policy' => ['nullable', 'in:' . implode(',', CancellationPolicy::values())],
            'status' => ['required', 'in:Active,Inactive,Pending'],
            'amenities' => ['nullable', 'array'],
            'amenities.*' => ['string'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
            'airport_pickup_enabled' => ['nullable', 'boolean'],
            'airport' => ['nullable', 'required_if:airport_pickup_enabled,true', 'string', 'max:255'],
            'pickup_start_time' => ['nullable', 'required_if:airport_pickup_enabled,true', 'string', 'max:10'],
            'pickup_end_time' => ['nullable', 'required_if:airport_pickup_enabled,true', 'string', 'max:10'],
            'airport_pickup_price' => ['nullable', 'required_if:airport_pickup_enabled,true', 'numeric', 'min:0'],
            'guided_tours_enabled' => ['nullable', 'boolean'],
            'guided_tours_description' => ['nullable', 'required_if:guided_tours_enabled,true', 'string', 'max:2000'],
            'guided_tours_duration' => ['nullable', 'required_if:guided_tours_enabled,true', 'string', 'max:255'],
            'guided_tours_price' => ['nullable', 'required_if:guided_tours_enabled,true', 'numeric', 'min:0'],
        ];
    }

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
            'images.*.max' => __('host.property.image_max_size'),
            'images.*.mimes' => __('host.property.image_mimes'),
            'images.*.image' => __('host.property.image_file'),
        ];
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Enums\PropertyType;

class HostPropertyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert airport_pickup_enabled string to boolean
        if ($this->has('airport_pickup_enabled')) {
            $value = $this->input('airport_pickup_enabled');
            if (is_string($value)) {
                $this->merge([
                    'airport_pickup_enabled' => in_array(strtolower($value), ['true', '1', 'yes'], true),
                ]);
            }
        }
        if ($this->has('guided_tours_enabled')) {
            $value = $this->input('guided_tours_enabled');
            if (is_string($value)) {
                $this->merge([
                    'guided_tours_enabled' => in_array(strtolower($value), ['true', '1', 'yes'], true),
                ]);
            }
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // For index/list requests (GET with query params)
        if ($this->isMethod('GET') && !$this->route('id')) {
            return [
                'search' => 'sometimes|string|max:255',
                'status' => 'sometimes|string|in:Active,Inactive,Pending',
                'approval_status' => 'sometimes|string',
                'page' => 'sometimes|integer|min:1',
                'per_page' => 'sometimes|integer|min:1|max:50',
            ];
        }
        
        // For store/create requests
        if ($this->isMethod('POST')) {
            return [
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'property_type' => 'required|string|in:' . implode(',', array_column(PropertyType::cases(), 'value')),
                'bedrooms' => 'required|integer|min:1',
                'bathrooms' => 'required|integer|min:1',
                'guests' => 'required|integer|min:1',
                'price' => 'required|numeric|min:0',
                'location' => 'required|string|max:255',
                'status' => 'sometimes|string|in:Active,Inactive',
                'image' => 'nullable|file|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
                'airport_pickup_enabled' => 'nullable|boolean',
                'airport' => 'nullable|required_if:airport_pickup_enabled,true|string|max:255',
                'pickup_start_time' => 'nullable|required_if:airport_pickup_enabled,true|date_format:H:i',
                'pickup_end_time' => 'nullable|required_if:airport_pickup_enabled,true|date_format:H:i|after:pickup_start_time',
                'airport_pickup_price' => 'nullable|required_if:airport_pickup_enabled,true|numeric|min:0',
                'guided_tours_enabled' => 'nullable|boolean',
                'guided_tours_description' => 'nullable|required_if:guided_tours_enabled,true|string|max:2000',
                'guided_tours_duration' => 'nullable|required_if:guided_tours_enabled,true|string|max:255',
                'guided_tours_price' => 'nullable|required_if:guided_tours_enabled,true|numeric|min:0',
            ];
        }
        
        // For update requests
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            return [
                'title' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'property_type' => 'sometimes|required|string|in:' . implode(',', array_column(PropertyType::cases(), 'value')),
                'bedrooms' => 'sometimes|required|integer|min:1',
                'bathrooms' => 'sometimes|required|integer|min:1',
                'guests' => 'sometimes|required|integer|min:1',
                'price' => 'sometimes|required|numeric|min:0',
                'location' => 'sometimes|required|string|max:255',
                'status' => 'sometimes|string|in:Active,Inactive',
                'image' => 'nullable|file|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
                'airport_pickup_enabled' => 'nullable|boolean',
                'airport' => 'nullable|required_if:airport_pickup_enabled,true|string|max:255',
                'pickup_start_time' => 'nullable|required_if:airport_pickup_enabled,true|date_format:H:i',
                'pickup_end_time' => 'nullable|required_if:airport_pickup_enabled,true|date_format:H:i|after:pickup_start_time',
                'airport_pickup_price' => 'nullable|required_if:airport_pickup_enabled,true|numeric|min:0',
                'guided_tours_enabled' => 'nullable|boolean',
                'guided_tours_description' => 'nullable|required_if:guided_tours_enabled,true|string|max:2000',
                'guided_tours_duration' => 'nullable|required_if:guided_tours_enabled,true|string|max:255',
                'guided_tours_price' => 'nullable|required_if:guided_tours_enabled,true|numeric|min:0',
            ];
        }
        
        return [];
    }
}

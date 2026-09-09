<?php

namespace App\Http\Requests;

use App\Models\Property;
use Carbon\Carbon;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BookingRequest extends FormRequest
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
        $method = $this->method();

        // For GET requests (show method), validate query parameters
        if ($method === 'GET') {
            return [
                'check_in' => 'sometimes|date|after_or_equal:today',
                'check_out' => 'sometimes|date|after:check_in',
                'nights' => 'sometimes|integer|min:1|max:365',
            ];
        }

        // For POST requests (store method), validate booking data
        return [
            'property_id' => 'required|integer|exists:properties,id',
            'name' => ['required', 'string', 'min:2', 'max:255', 'regex:/^(?=.*\p{L})[\p{L} ]+$/u'],
            'email' => 'required|email|max:255',
            'phone_code' => 'sometimes|string|max:10',
            'phone' => 'required|string|regex:/^\d{7,15}$/',
            'rooms' => 'required|integer|min:1|max:10',
            'adults' => 'required|integer|min:1|max:20',
            'children' => 'sometimes|integer|min:0|max:10',
            'nights' => 'required|integer|min:1|max:365',
            'check_in_date' => 'required|date|after_or_equal:today',
            'check_out_date' => 'required|date|after:check_in_date',
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
            'check_out.after' => __('validation.custom.checkout.after'),
            'check_out_date.after' => __('validation.custom.checkout.after'),
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($this->isMethod('GET') || ! $this->filled(['property_id', 'check_in_date', 'check_out_date'])) {
                return;
            }

            $property = Property::find($this->input('property_id'));
            if (! $property || $property->isExperience()) {
                return;
            }

            $nights = Carbon::parse($this->input('check_in_date'))->diffInDays(Carbon::parse($this->input('check_out_date')));
            if ($property->minimum_stay && $nights < $property->minimum_stay) {
                $validator->errors()->add('check_out_date', "This property requires a minimum stay of {$property->minimum_stay} nights.");
            }
            if ($property->maximum_stay && $nights > $property->maximum_stay) {
                $validator->errors()->add('check_out_date', "This property allows a maximum stay of {$property->maximum_stay} nights.");
            }
        });
    }
}

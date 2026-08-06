<?php

namespace App\Http\Requests;

use App\Enums\BookingStatus;
use App\Models\Booking;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;

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
     * Reject dates that overlap an existing pending/confirmed booking for the same property.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $propertyId = $this->input('property_id');
            $checkin = $this->input('checkin');
            $checkout = $this->input('checkout');

            if (! $propertyId || ! $checkin || ! $checkout) {
                return;
            }

            $overlaps = Booking::where('property_id', $propertyId)
                ->whereIn('status', [BookingStatus::PENDING->value, BookingStatus::CONFIRMED->value])
                ->where('check_in_date', '<', $checkout)
                ->where('check_out_date', '>', $checkin)
                ->exists();

            if ($overlaps) {
                $validator->errors()->add('checkin', __('validation.custom.checkin.unavailable'));
            }
        });
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

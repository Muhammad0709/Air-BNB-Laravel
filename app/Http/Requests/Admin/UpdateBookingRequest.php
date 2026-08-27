<?php

namespace App\Http\Requests\Admin;

use App\Enums\BookingStatus;
use App\Models\Booking;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class UpdateBookingRequest extends FormRequest
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
        $statusRule = 'sometimes|string|in:' . implode(',', BookingStatus::values());

        return [
            'property_id' => 'sometimes|required|integer|exists:properties,id',
            'guest' => 'sometimes|required|string|max:255',
            'guestEmail' => 'sometimes|required|email|max:255',
            'guestPhone' => 'sometimes|required|string|max:20',
            'checkin' => 'sometimes|required|date',
            'checkout' => 'sometimes|required|date|after:checkin',
            'amount' => 'sometimes|required|numeric|min:0',
            'status' => $statusRule,
        ];
    }

    /**
     * Reject dates that overlap another pending/confirmed booking for the same property.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if (! $this->filled('checkin') && ! $this->filled('checkout')) {
                return;
            }

            $bookingId = $this->route('id');
            $booking = $bookingId ? Booking::find($bookingId) : null;

            $checkin = $this->input('checkin', $booking?->check_in_date?->format('Y-m-d'));
            $checkout = $this->input('checkout', $booking?->check_out_date?->format('Y-m-d'));
            $propertyId = $this->input('property_id', $booking?->property_id);

            if (! $propertyId || ! $checkin || ! $checkout) {
                return;
            }

            $overlaps = Booking::where('property_id', $propertyId)
                ->when($bookingId, fn ($q) => $q->where('id', '!=', $bookingId))
                ->whereIn('status', [BookingStatus::PENDING->value, BookingStatus::CONFIRMED->value])
                ->whereDate('check_in_date', '<', $checkout)
                ->whereDate('check_out_date', '>', $checkin)
                ->exists();

            if ($overlaps) {
                $validator->errors()->add('checkin', __('validation.custom.checkin.unavailable'));
            }
        });
    }
}

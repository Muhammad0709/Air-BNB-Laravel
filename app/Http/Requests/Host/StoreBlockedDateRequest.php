<?php

namespace App\Http\Requests\Host;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\PropertyBlockedDate;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class StoreBlockedDateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'reason' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $property = $this->route('property');
            $startDate = $this->input('start_date');
            $endDate = $this->input('end_date');

            if (! $property || ! $startDate || ! $endDate) {
                return;
            }

            $overlapsBooking = Booking::where('property_id', $property->id)
                ->whereIn('status', [BookingStatus::PENDING->value, BookingStatus::CONFIRMED->value])
                ->whereDate('check_in_date', '<=', $endDate)
                ->whereDate('check_out_date', '>', $startDate)
                ->exists();

            if ($overlapsBooking) {
                $validator->errors()->add('start_date', __('host.availability.overlaps_booking'));

                return;
            }

            $overlapsBlock = PropertyBlockedDate::where('property_id', $property->id)
                ->whereDate('start_date', '<=', $endDate)
                ->whereDate('end_date', '>=', $startDate)
                ->exists();

            if ($overlapsBlock) {
                $validator->errors()->add('start_date', __('host.availability.overlaps_block'));
            }
        });
    }
}

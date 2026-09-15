<?php

namespace App\Http\Requests;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\PropertyBlockedDate;
use App\Models\Property;
use Carbon\Carbon;
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
            'property_id'    => ['required', 'integer', 'exists:properties,id'],
            'checkin'        => ['required', 'date'],
            'checkout'       => ['required', 'date', 'after:checkin'],
            'experience_time' => ['nullable', 'date_format:H:i'],
            'name'           => ['required', 'string', 'max:255', 'regex:/^(?=.*\p{L})[\p{L} ]+$/u'],
            'email'          => ['required', 'email', 'max:255'],
            'phone_code'     => ['nullable', 'string', 'max:10'],
            'phone'          => ['required', 'string', 'regex:/^\d{7,15}$/'],
            'rooms'          => ['nullable', 'integer', 'min:1', 'max:20'],
            'adults'         => ['nullable', 'integer', 'min:1', 'max:50'],
            'children'       => ['nullable', 'integer', 'min:0', 'max:20'],
            'payment_method' => ['nullable', 'string', 'in:cod,online_mpesa,delivery_mpesa'],
            'mpesa_phone'    => ['nullable', 'required_if:payment_method,online_mpesa', 'string', 'max:20', 'regex:/^\d{9,15}$/'],
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

            $property = Property::find($propertyId);
            if ($property && $property->isExperience()) {
                if ($property->experience_booking_paused) {
                    $validator->errors()->add('checkin', 'Bookings for this experience are currently paused.');
                }

                $experienceTime = $this->input('experience_time');
                if (! $experienceTime) {
                    $validator->errors()->add('experience_time', 'Please select an experience time.');
                } elseif ($property->experience_available_times
                    && ! in_array($experienceTime, $property->experience_available_times, true)) {
                    $validator->errors()->add('experience_time', 'Please select one of the available experience times.');
                }

                $selectedDate = Carbon::parse($checkin)->format('Y-m-d');
                $availableDates = $property->experience_available_dates ?? [];
                if ($availableDates && ! in_array($selectedDate, $availableDates, true)) {
                    $validator->errors()->add('checkin', 'Please select one of the available experience dates.');
                }

                $requestedGuests = max(1, (int) ($this->input('adults') ?: 1) + (int) ($this->input('children') ?: 0));
                if ($property->min_participants && $requestedGuests < (int) $property->min_participants) {
                    $validator->errors()->add('adults', "This experience requires at least {$property->min_participants} participants.");
                }
                $bookedGuests = Booking::where('property_id', $property->id)
                    ->whereDate('check_in_date', $selectedDate)
                    ->where('experience_time', $experienceTime)
                    ->whereIn('status', BookingStatus::upcoming())
                    ->get()
                    ->sum(fn (Booking $booking) => (int) $booking->adults + (int) $booking->children);

                if ($bookedGuests + $requestedGuests > (int) $property->guests) {
                    $validator->errors()->add('adults', 'This experience is full for the selected date and time.');
                }
            } elseif ($property) {
                $nights = Carbon::parse($checkin)->diffInDays(Carbon::parse($checkout));
                if ($property->minimum_stay && $nights < $property->minimum_stay) {
                    $validator->errors()->add('checkout', "This property requires a minimum stay of {$property->minimum_stay} nights.");
                }
                if ($property->maximum_stay && $nights > $property->maximum_stay) {
                    $validator->errors()->add('checkout', "This property allows a maximum stay of {$property->maximum_stay} nights.");
                }
            }

            $overlaps = $property && $property->isExperience()
                ? false
                : Booking::where('property_id', $propertyId)
                    ->whereIn('status', BookingStatus::upcoming())
                    ->whereDate('check_in_date', '<', $checkout)
                    ->whereDate('check_out_date', '>', $checkin)
                    ->exists();

            if ($overlaps) {
                $validator->errors()->add('checkin', __('validation.custom.checkin.unavailable'));

                return;
            }

            $overlapsBlockedDate = PropertyBlockedDate::where('property_id', $propertyId)
                ->whereDate('start_date', '<', $checkout)
                ->whereDate('end_date', '>=', $checkin)
                ->exists();

            if ($overlapsBlockedDate) {
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
            'experience_time.date_format' => 'Please select a valid experience time.',
        ];
    }
}

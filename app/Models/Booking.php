<?php

namespace App\Models;

use App\Enums\BookingStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    protected $fillable = [
        'property_id',
        'user_id',
        'name',
        'email',
        'phone_code',
        'phone',
        'rooms',
        'adults',
        'children',
        'check_in_date',
        'check_out_date',
        'nights',
        'nightly_rate',
        'cleaning_fee',
        'service_fee',
        'total_amount',
        'status',
        'payment_method',
        'card_last_four',
    ];

    protected $casts = [
        'check_in_date' => 'date',
        'check_out_date' => 'date',
        'nightly_rate' => 'decimal:2',
        'cleaning_fee' => 'decimal:2',
        'service_fee' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'rooms' => 'integer',
        'adults' => 'integer',
        'children' => 'integer',
        'nights' => 'integer',
        'status' => BookingStatus::class,
    ];

    /**
     * Get the property that this booking belongs to.
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    /**
     * Get the user that made this booking.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

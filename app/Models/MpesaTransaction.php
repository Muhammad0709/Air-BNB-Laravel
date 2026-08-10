<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MpesaTransaction extends Model
{
    protected $fillable = [
        'booking_id',
        'merchant_request_id',
        'checkout_request_id',
        'phone_number',
        'amount',
        'result_code',
        'result_desc',
        'mpesa_receipt_number',
        'transaction_date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'transaction_date' => 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
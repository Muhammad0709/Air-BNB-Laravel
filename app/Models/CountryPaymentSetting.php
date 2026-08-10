<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CountryPaymentSetting extends Model
{
    protected $table = 'country_payment_settings';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'country_code',
        'enable_cod',
        'enable_mpesa_delivery',
    ];

    protected $casts = [
        'enable_cod' => 'boolean',
        'enable_mpesa_delivery' => 'boolean',
    ];
}
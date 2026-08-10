<?php

return [
    'consumer_key' => env('MPESA_CONSUMER_KEY'),
    'consumer_secret' => env('MPESA_CONSUMER_SECRET'),
    'shortcode' => env('MPESA_SHORTCODE'),
    'passkey' => env('MPESA_PASSKEY'),
    'initiator' => env('MPESA_INITIATOR'),
    'initiator_password' => env('MPESA_INITIATOR_PASSWORD'),
    'environment' => env('MPESA_ENVIRONMENT', 'sandbox'), // sandbox or production
];
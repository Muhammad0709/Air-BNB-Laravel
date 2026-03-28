<?php

return [
    'property_created' => [
        'user' => [
            'title' => 'ملک جدید در دسترس',
            'body' => 'یک ملک جدید "{property_title}" در {property_location} به قیمت ${property_price}/شب فهرست شده است',
        ],
    ],
    'property_pending_approval' => [
        'admin' => [
            'title' => 'ملک جدید در انتظار تایید',
            'body' => 'میزبان {host_name} یک ملک جدید "{property_title}" در {property_location} برای تایید ارسال کرده است',
        ],
    ],
    'property_approved' => [
        'host' => [
            'title' => 'ملک تایید شد',
            'body' => 'ملک شما "{property_title}" تایید شده و اکنون فعال است',
        ],
    ],
    'property_rejected' => [
        'host' => [
            'title' => 'ملک رد شد',
            'body' => 'ملک شما "{property_title}" رد شده است. دلیل: {rejection_reason}',
        ],
    ],
];

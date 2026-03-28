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
    'booking_created' => [
        'host' => [
            'title' => 'رزرو جدید دریافت شد',
            'body' => '{guest_name} ملک شما "{property_title}" را از {check_in_date} تا {check_out_date} ({nights} شب) به مبلغ ${total_amount} رزرو کرده است',
        ],
        'admin' => [
            'title' => 'رزرو جدید ایجاد شد',
            'body' => '{guest_name} ملک "{property_title}" را از {check_in_date} تا {check_out_date} ({nights} شب) رزرو کرد - مجموع: ${total_amount}',
        ],
    ],
];

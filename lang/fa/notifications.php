<?php

return [
    'property_pending_approval' => [
        'admin' => [
            'title' => 'ملک در انتظار',
            'body' => '{host_name} یک ملک جدید "{property_title}" در {property_location} برای تایید ارسال کرده است',
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
            'title' => 'رزرو دریافت شد',
            'body' => '{guest_name} ملک شما "{property_title}" را از {check_in_date} تا {check_out_date} ({nights} شب) به مبلغ ${total_amount} رزرو کرده است',
        ],
        'admin' => [
            'title' => 'رزرو ایجاد شد',
            'body' => '{guest_name} ملک "{property_title}" را از {check_in_date} تا {check_out_date} ({nights} شب) رزرو کرد - مجموع: ${total_amount}',
        ],
    ],
    'booking_confirmed' => [
        'user' => [
            'title' => 'رزرو تایید شد',
            'body' => 'رزرو شما برای "{property_title}" از {check_in_date} تا {check_out_date} تایید شده است',
        ],
    ],
    'booking_completed' => [
        'user' => [
            'title' => 'رزرو تکمیل شد',
            'body' => 'اقامت شما در "{property_title}" تکمیل شده است. از انتخاب ما متشکریم!',
        ],
    ],
    'booking_cancelled' => [
        'user' => [
            'title' => 'رزرو لغو شد',
            'body' => 'رزرو شما برای "{property_title}" از {check_in_date} تا {check_out_date} لغو شده است',
        ],
    ],
];

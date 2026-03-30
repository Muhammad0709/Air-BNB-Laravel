<?php

return [
    'property_created' => [
        'user' => [
            'title' => 'نئی پراپرٹی دستیاب',
            'body' => 'ایک نئی پراپرٹی "{property_title}" {property_location} میں ${property_price}/رات کے لیے درج کی گئی ہے',
        ],
    ],
    'property_pending_approval' => [
        'admin' => [
            'title' => 'نئی پراپرٹی منظوری کے منتظر',
            'body' => 'میزبان {host_name} نے ایک نئی پراپرٹی "{property_title}" {property_location} میں منظوری کے لیے جمع کرائی ہے',
        ],
    ],
    'property_approved' => [
        'host' => [
            'title' => 'پراپرٹی منظور ہو گئی',
            'body' => 'آپ کی پراپرٹی "{property_title}" منظور ہو گئی ہے اور اب دستیاب ہے',
        ],
    ],
    'property_rejected' => [
        'host' => [
            'title' => 'پراپرٹی مسترد کر دی گئی',
            'body' => 'آپ کی پراپرٹی "{property_title}" مسترد کر دی گئی ہے۔ وجہ: {rejection_reason}',
        ],
    ],
    'booking_created' => [
        'host' => [
            'title' => 'نئی بکنگ موصول ہوئی',
            'body' => '{guest_name} نے آپ کی پراپرٹی "{property_title}" کو {check_in_date} سے {check_out_date} تک ({nights} راتیں) ${total_amount} میں بک کیا ہے',
        ],
        'admin' => [
            'title' => 'نئی بکنگ بنائی گئی',
            'body' => '{guest_name} نے "{property_title}" کو {check_in_date} سے {check_out_date} تک ({nights} راتیں) بک کیا - کل: ${total_amount}',
        ],
    ],
    'booking_confirmed' => [
        'user' => [
            'title' => 'بکنگ کی تصدیق ہو گئی',
            'body' => 'آپ کی "{property_title}" کے لیے {check_in_date} سے {check_out_date} تک کی بکنگ کی تصدیق ہو گئی ہے',
        ],
    ],
    'booking_completed' => [
        'user' => [
            'title' => 'بکنگ مکمل ہو گئی',
            'body' => '"{property_title}" میں آپ کا قیام مکمل ہو گیا ہے۔ ہمیں منتخب کرنے کا شکریہ!',
        ],
    ],
    'booking_cancelled' => [
        'user' => [
            'title' => 'بکنگ منسوخ کر دی گئی',
            'body' => 'آپ کی "{property_title}" کے لیے {check_in_date} سے {check_out_date} تک کی بکنگ منسوخ کر دی گئی ہے',
        ],
    ],
];

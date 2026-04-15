<?php

return [
    'property_pending_approval' => [
        'admin' => [
            'title' => 'زیر التواء جائیداد',
            'body' => '{host_name} نے ایک نئی جائیداد "{property_title}" {property_location} میں منظوری کے لیے جمع کرائی ہے',
        ],
    ],
    'property_approved' => [
        'host' => [
            'title' => 'پراپرٹی منظور ہو گئی',
            'body' => 'آپ کی جائیداد "{property_title}" منظور ہو گئی ہے اور اب دستیاب ہے',
        ],
    ],
    'property_rejected' => [
        'host' => [
            'title' => 'پراپرٹی مسترد کر دی گئی',
            'body' => 'آپ کی جائیداد "{property_title}" مسترد کر دی گئی ہے۔ وجہ: {rejection_reason}',
        ],
    ],
    'booking_created' => [
        'host' => [
            'title' => 'بکنگ موصول ہوئی',
            'body' => '{guest_name} نے آپ کی جائیداد "{property_title}" کو {check_in_date} سے {check_out_date} تک ({nights} راتیں) {total_amount} ڈالر میں بک کیا ہے',
        ],
        'admin' => [
            'title' => 'بکنگ بنائی گئی',
            'body' => '{guest_name} نے "{property_title}" کو {check_in_date} سے {check_out_date} تک ({nights} راتیں) بک کیا — کل: {total_amount} ڈالر',
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
    'delete_dialog_title' => 'اطلاع حذف کریں',
    'delete_dialog_message' => 'کیا آپ واقعی یہ اطلاع حذف کرنا چاہتے ہیں؟ یہ عمل واپس نہیں کیا جا سکتا۔',
    'delete_success' => 'اطلاع کامیابی سے حذف ہو گئی',
    'delete_failed' => 'اطلاع حذف کرنے میں ناکامی',
];

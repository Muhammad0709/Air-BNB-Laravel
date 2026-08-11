<?php

return [
    'title' => 'اعلان‌ها',
    'subtitle' => 'از رزروها و فعالیت‌های حساب خود مطلع شوید',
    'empty_title' => 'هنوز اعلانی نیست',
    'empty_sub' => 'به‌روزرسانی‌های مربوط به رزروها و حساب شما اینجا نمایش داده می‌شود.',
    'mark_read' => 'علامت‌گذاری به‌عنوان خوانده‌شده',
    'unread' => 'خوانده‌نشده',
    'see_all' => 'مشاهده همه اعلان‌ها',
    'marked_read' => 'اعلان به‌عنوان خوانده‌شده علامت‌گذاری شد',
    'all_marked_read' => 'همه اعلان‌ها به‌عنوان خوانده‌شده علامت‌گذاری شدند',
    'mark_failed' => 'علامت‌گذاری اعلان‌ها ناموفق بود',
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
    'delete_dialog_title' => 'حذف اعلان',
    'delete_dialog_message' => 'آیا مطمئن هستید که می‌خواهید این اعلان را حذف کنید؟ این عمل قابل بازگشت نیست.',
    'delete_success' => 'اعلان با موفقیت حذف شد',
    'delete_failed' => 'حذف اعلان ناموفق بود',
];

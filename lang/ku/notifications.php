<?php

return [
    'property_pending_approval' => [
        'admin' => [
            'title' => 'موڵکی چاوەڕوان',
            'body' => '{host_name} موڵکێکی نوێ "{property_title}" لە {property_location} بۆ ڕەزامەندی ناردووە',
        ],
    ],
    'property_approved' => [
        'host' => [
            'title' => 'موڵک پەسەند کرا',
            'body' => 'موڵکەکەت "{property_title}" پەسەند کرا و ئێستا چالاکە',
        ],
    ],
    'property_rejected' => [
        'host' => [
            'title' => 'موڵک ڕەت کرایەوە',
            'body' => 'موڵکەکەت "{property_title}" ڕەت کرایەوە. هۆکار: {rejection_reason}',
        ],
    ],
    'booking_created' => [
        'host' => [
            'title' => 'نۆرە وەرگیرا',
            'body' => '{guest_name} موڵکەکەت "{property_title}" لە {check_in_date} بۆ {check_out_date} ({nights} شەو) بە ${total_amount} نۆرە کردووە',
        ],
        'admin' => [
            'title' => 'نۆرە دروست کرا',
            'body' => '{guest_name} "{property_title}" لە {check_in_date} بۆ {check_out_date} ({nights} شەو) نۆرە کرد - کۆی گشتی: ${total_amount}',
        ],
    ],
    'booking_confirmed' => [
        'user' => [
            'title' => 'نۆرە پشتڕاست کرایەوە',
            'body' => 'نۆرەکەت بۆ "{property_title}" لە {check_in_date} بۆ {check_out_date} پشتڕاست کرایەوە',
        ],
    ],
    'booking_completed' => [
        'user' => [
            'title' => 'نۆرە تەواو بوو',
            'body' => 'مانەوەکەت لە "{property_title}" تەواو بوو. سوپاس بۆ هەڵبژاردنمان!',
        ],
    ],
    'booking_cancelled' => [
        'user' => [
            'title' => 'نۆرە هەڵوەشایەوە',
            'body' => 'نۆرەکەت بۆ "{property_title}" لە {check_in_date} بۆ {check_out_date} هەڵوەشایەوە',
        ],
    ],
    'delete_dialog_title' => 'سڕینەوەی ئاگادارکردنەوە',
    'delete_dialog_message' => 'دڵنیای کە دەتەوێت ئەم ئاگادارکردنەوەیە بسڕیتەوە؟ ئەم کردارە ناگەڕێتەوە.',
    'delete_success' => 'ئاگادارکردنەوە بە سەرکەوتوویی سڕایەوە',
    'delete_failed' => 'سڕینەوەی ئاگادارکردنەوە سەرکەوتوو نەبوو',
];

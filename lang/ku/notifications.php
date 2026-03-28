<?php

return [
    'property_created' => [
        'user' => [
            'title' => 'موڵکی نوێ بەردەستە',
            'body' => 'موڵکێکی نوێ "{property_title}" لە {property_location} بە نرخی ${property_price}/شەو لیست کراوە',
        ],
    ],
    'property_pending_approval' => [
        'admin' => [
            'title' => 'موڵکی نوێ چاوەڕێی ڕەزامەندی',
            'body' => 'خاوەن خانوو {host_name} موڵکێکی نوێ "{property_title}" لە {property_location} بۆ ڕەزامەندی ناردووە',
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
            'title' => 'نۆرەی نوێ وەرگیرا',
            'body' => '{guest_name} موڵکەکەت "{property_title}" لە {check_in_date} بۆ {check_out_date} ({nights} شەو) بە ${total_amount} نۆرە کردووە',
        ],
        'admin' => [
            'title' => 'نۆرەی نوێ دروست کرا',
            'body' => '{guest_name} "{property_title}" لە {check_in_date} بۆ {check_out_date} ({nights} شەو) نۆرە کرد - کۆی گشتی: ${total_amount}',
        ],
    ],
];

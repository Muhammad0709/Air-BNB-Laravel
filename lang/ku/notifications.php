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
];

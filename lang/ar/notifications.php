<?php

return [
    'property_created' => [
        'user' => [
            'title' => 'عقار جديد متاح',
            'body' => 'تم إدراج عقار جديد "{property_title}" في {property_location} مقابل ${property_price}/ليلة',
        ],
    ],
    'property_approved' => [
        'host' => [
            'title' => 'تمت الموافقة على العقار',
            'body' => 'تمت الموافقة على عقارك "{property_title}" وهو الآن متاح',
        ],
    ],
    'property_rejected' => [
        'host' => [
            'title' => 'تم رفض العقار',
            'body' => 'تم رفض عقارك "{property_title}". السبب: {rejection_reason}',
        ],
    ],
];

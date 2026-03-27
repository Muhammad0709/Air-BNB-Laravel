<?php

return [
    'property_created' => [
        'user' => [
            'title' => 'Yeni Mülk Mevcut',
            'body' => '{property_location} bölgesinde "{property_title}" adlı yeni bir mülk ${property_price}/gece fiyatıyla listelendi',
        ],
    ],
    'property_approved' => [
        'host' => [
            'title' => 'Mülk Onaylandı',
            'body' => '"{property_title}" mülkünüz onaylandı ve artık yayında',
        ],
    ],
    'property_rejected' => [
        'host' => [
            'title' => 'Mülk Reddedildi',
            'body' => '"{property_title}" mülkünüz reddedildi. Sebep: {rejection_reason}',
        ],
    ],
];

<?php

return [
    'property_created' => [
        'user' => [
            'title' => 'Yeni Mülk Mevcut',
            'body' => '{property_location} bölgesinde "{property_title}" adlı yeni bir mülk ${property_price}/gece fiyatıyla listelendi',
        ],
    ],
    'property_pending_approval' => [
        'admin' => [
            'title' => 'Onay Bekleyen Yeni Mülk',
            'body' => 'Ev sahibi {host_name}, {property_location} bölgesinde "{property_title}" adlı yeni bir mülk onay için gönderdi',
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
    'booking_created' => [
        'host' => [
            'title' => 'Yeni Rezervasyon Alındı',
            'body' => '{guest_name}, "{property_title}" mülkünüzü {check_in_date} - {check_out_date} tarihleri arasında ({nights} gece) ${total_amount} karşılığında rezerve etti',
        ],
        'admin' => [
            'title' => 'Yeni Rezervasyon Oluşturuldu',
            'body' => '{guest_name}, "{property_title}" mülkünü {check_in_date} - {check_out_date} tarihleri arasında ({nights} gece) rezerve etti - Toplam: ${total_amount}',
        ],
    ],
];

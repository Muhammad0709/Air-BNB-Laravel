<?php

return [
    'title' => 'الإشعارات',
    'subtitle' => 'ابق على اطلاع بحجوزاتك ونشاط حسابك',
    'empty_title' => 'لا توجد إشعارات بعد',
    'empty_sub' => 'ستظهر هنا التحديثات المتعلقة بحجوزاتك وحسابك.',
    'mark_read' => 'وضع علامة كمقروء',
    'unread' => 'غير مقروء',
    'property_pending_approval' => [
        'admin' => [
            'title' => 'عقار معلق',
            'body' => '{host_name} قدم عقارًا جديدًا "{property_title}" في {property_location} للموافقة عليه',
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
    'booking_created' => [
        'host' => [
            'title' => 'حجز مستلم',
            'body' => '{guest_name} حجز عقارك "{property_title}" من {check_in_date} إلى {check_out_date} ({nights} ليالٍ) مقابل {total_amount} دولار',
        ],
        'admin' => [
            'title' => 'تم إنشاء حجز',
            'body' => '{guest_name} حجز "{property_title}" من {check_in_date} إلى {check_out_date} ({nights} ليالٍ) - الإجمالي: {total_amount} دولار',
        ],
    ],
    'booking_confirmed' => [
        'user' => [
            'title' => 'تم تأكيد الحجز',
            'body' => 'تم تأكيد حجزك لـ "{property_title}" من {check_in_date} إلى {check_out_date}',
        ],
    ],
    'booking_completed' => [
        'user' => [
            'title' => 'اكتمل الحجز',
            'body' => 'اكتملت إقامتك في "{property_title}". شكرًا لاختيارك لنا!',
        ],
    ],
    'booking_cancelled' => [
        'user' => [
            'title' => 'تم إلغاء الحجز',
            'body' => 'تم إلغاء حجزك لـ "{property_title}" من {check_in_date} إلى {check_out_date}',
        ],
    ],
    'delete_dialog_title' => 'حذف الإشعار',
    'delete_dialog_message' => 'هل أنت متأكد من حذف هذا الإشعار؟ لا يمكن التراجع عن هذا الإجراء.',
    'delete_success' => 'تم حذف الإشعار بنجاح',
    'delete_failed' => 'فشل حذف الإشعار',
];

<?php

return [
    'title' => 'Bildirimler',
    'subtitle' => 'Rezervasyonlarınız ve hesap etkinliğinizden haberdar olun',
    'empty_title' => 'Henüz bildirim yok',
    'empty_sub' => 'Rezervasyonlarınız ve hesabınızla ilgili güncellemeleri burada göreceksiniz.',
    'mark_read' => 'Okundu olarak işaretle',
    'unread' => 'Okunmadı',
    'see_all' => 'Tüm bildirimleri gör',
    'marked_read' => 'Bildirim okundu olarak işaretlendi',
    'all_marked_read' => 'Tüm bildirimler okundu olarak işaretlendi',
    'mark_failed' => 'Bildirimler işaretlenemedi',
    'property_pending_approval' => [
        'admin' => [
            'title' => 'Bekleyen Mülk',
            'body' => '{host_name}, {property_location} bölgesinde "{property_title}" adlı yeni bir mülk onay için gönderdi',
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
            'title' => 'Rezervasyon Alındı',
            'body' => '{guest_name}, "{property_title}" mülkünüzü {check_in_date} - {check_out_date} tarihleri arasında ({nights} gece) ${total_amount} karşılığında rezerve etti',
        ],
        'admin' => [
            'title' => 'Rezervasyon Oluşturuldu',
            'body' => '{guest_name}, "{property_title}" mülkünü {check_in_date} - {check_out_date} tarihleri arasında ({nights} gece) rezerve etti - Toplam: ${total_amount}',
        ],
    ],
    'booking_confirmed' => [
        'user' => [
            'title' => 'Rezervasyon Onaylandı',
            'body' => '"{property_title}" için {check_in_date} - {check_out_date} tarihleri arasındaki rezervasyonunuz onaylandı',
        ],
    ],
    'booking_completed' => [
        'user' => [
            'title' => 'Rezervasyon Tamamlandı',
            'body' => '"{property_title}" konaklamanız tamamlandı. Bizi seçtiğiniz için teşekkür ederiz!',
        ],
    ],
    'booking_cancelled' => [
        'user' => [
            'title' => 'Rezervasyon İptal Edildi',
            'body' => '"{property_title}" için {check_in_date} - {check_out_date} tarihleri arasındaki rezervasyonunuz iptal edildi',
        ],
    ],
    'delete_dialog_title' => 'Bildirimi Sil',
    'delete_dialog_message' => 'Bu bildirimi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
    'delete_success' => 'Bildirim başarıyla silindi',
    'delete_failed' => 'Bildirim silinemedi',
];

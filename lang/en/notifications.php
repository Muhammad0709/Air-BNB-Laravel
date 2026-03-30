<?php

return [
    'property_pending_approval' => [
        'admin' => [
            'title' => 'Pending Property',
            'body' => '{host_name} has submitted a new property "{property_title}" in {property_location} for approval',
        ],
    ],
    'property_approved' => [
        'host' => [
            'title' => 'Property Approved',
            'body' => 'Your property "{property_title}" has been approved and is now live',
        ],
    ],
    'property_rejected' => [
        'host' => [
            'title' => 'Property Rejected',
            'body' => 'Your property "{property_title}" has been rejected. Reason: {rejection_reason}',
        ],
    ],
    'booking_created' => [
        'host' => [
            'title' => 'Booking Received',
            'body' => '{guest_name} has booked your property "{property_title}" from {check_in_date} to {check_out_date} ({nights} nights) for ${total_amount}',
        ],
        'admin' => [
            'title' => 'Booking Created',
            'body' => '{guest_name} booked "{property_title}" from {check_in_date} to {check_out_date} ({nights} nights) - Total: ${total_amount}',
        ],
    ],
    'booking_confirmed' => [
        'user' => [
            'title' => 'Booking Confirmed',
            'body' => 'Your booking for "{property_title}" from {check_in_date} to {check_out_date} has been confirmed',
        ],
    ],
    'booking_completed' => [
        'user' => [
            'title' => 'Booking Completed',
            'body' => 'Your stay at "{property_title}" has been completed. Thank you for choosing us!',
        ],
    ],
    'booking_cancelled' => [
        'user' => [
            'title' => 'Booking Cancelled',
            'body' => 'Your booking for "{property_title}" from {check_in_date} to {check_out_date} has been cancelled',
        ],
    ],
];

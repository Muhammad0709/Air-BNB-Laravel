<?php

return [
    'property_created' => [
        'user' => [
            'title' => 'New Property Available',
            'body' => 'A new property "{property_title}" has been listed in {property_location} for ${property_price}/night',
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
];

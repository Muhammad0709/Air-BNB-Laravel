<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\PropertyStatus;

class Property extends Model
{
    protected $fillable = [
        'title',
        'location',
        'timezone',
        'cancellation_policy',
        'price',
        'deposit_amount',
        'bedrooms',
        'bathrooms',
        'guests',
        'property_type',
        'status',
        'approval_status',
        'is_guest_favorite',
        'description',
        'amenities',
        'image',
        'images',
        'user_id',
        'airport_pickup_enabled',
        'airport',
        'pickup_start_time',
        'pickup_end_time',
        'airport_pickup_price',
        'guided_tours_enabled',
        'guided_tours_description',
        'guided_tours_duration',
        'guided_tours_price',
    ];

    protected $casts = [
        'amenities' => 'array',
        'images' => 'array',
        'price' => 'decimal:2',
        'is_guest_favorite' => 'boolean',
        'airport_pickup_enabled' => 'boolean',
        'airport_pickup_price' => 'decimal:2',
        'guided_tours_enabled' => 'boolean',
        'guided_tours_price' => 'decimal:2',
    ];

    /**
     * Get the user that owns the property.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function conversations()
    {
        return $this->hasMany(\App\Models\Conversation::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * First image from images array, or single image; full URL or null.
     */
    public function getPrimaryImageUrl(): ?string
    {
        $path = null;
        if ($this->images !== null) {
            $arr = is_array($this->images) ? $this->images : (is_string($this->images) ? json_decode($this->images, true) : []);
            $path = is_array($arr) && $arr !== [] ? $arr[0] : null;
        }
        $path = $path ?? $this->image;

        return $path ? asset(Storage::url($path)) : null;
    }

    /**
     * Get notification templates for property events
     */
    public static function getNotificationTemplates(): array
    {
        return [
            'property_pending_approval' => [
                'admin' => [
                    'title' => __('notifications.property_pending_approval.admin.title'),
                    'body' => __('notifications.property_pending_approval.admin.body'),
                    'image' => null,
                ],
            ],
            'property_approved' => [
                'host' => [
                    'title' => __('notifications.property_approved.host.title'),
                    'body' => __('notifications.property_approved.host.body'),
                    'image' => null,
                ],
            ],
            'property_rejected' => [
                'host' => [
                    'title' => __('notifications.property_rejected.host.title'),
                    'body' => __('notifications.property_rejected.host.body'),
                    'image' => null,
                ],
            ],
        ];
    }

    /**
     * Get placeholders for notification templates
     */
    public function getNotificationPlaceholders($recipient, $recipientType): array
    {
        return [
            '{property_title}' => $this->title,
            '{property_location}' => $this->location,
            '{property_price}' => '$' . number_format($this->price, 2),
            '{host_name}' => $this->user->name ?? 'Host',
        ];
    }
}

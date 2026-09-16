<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\PropertyStatus;
use App\Enums\ListingCategory;

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
        'beds',
        'bathrooms',
        'guests',
        'property_type',
        'listing_category',
        'duration_hours',
        'status',
        'approval_status',
        'duplicate_flag_reason',
        'is_guest_favorite',
        'description',
        'check_in_time',
        'check_out_time',
        'check_in_date',
        'check_out_date',
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
        // Experience-specific fields
        'min_participants',
        'guide_language',
        'group_size',
        'meeting_point',
        'included_services',
        'safety_info',
        'experience_category',
        'experience_available_dates',
        'experience_available_times',
        'experience_not_included',
        'experience_guest_requirements',
        'experience_booking_paused',
    ];

    protected $casts = [
        'check_in_date'          => 'date:Y-m-d',
        'check_out_date'         => 'date:Y-m-d',
        'amenities'              => 'array',
        'images'                 => 'array',
        'price'                  => 'decimal:2',
        'is_guest_favorite'      => 'boolean',
        'airport_pickup_enabled' => 'boolean',
        'airport_pickup_price'   => 'decimal:2',
        'guided_tours_enabled'   => 'boolean',
        'guided_tours_price'     => 'decimal:2',
        'listing_category'       => ListingCategory::class,
        // Experience fields
        'min_participants'       => 'integer',
        'included_services'      => 'array',
        'experience_available_dates' => 'array',
        'experience_available_times' => 'array',
        'experience_not_included' => 'array',
        'experience_booking_paused' => 'boolean',
        'beds'                   => 'integer',
    ];

    public function isExperience(): bool
    {
        return $this->listing_category === ListingCategory::EXPERIENCE;
    }

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

    public function blockedDates(): HasMany
    {
        return $this->hasMany(PropertyBlockedDate::class);
    }

    /**
     * First image from images array, or single image; full URL or null.
     */
    public function getPrimaryImageUrl(): ?string
    {
        return $this->getImageUrls()[0] ?? null;
    }

    /**
     * All non-empty property photos as public URLs, falling back to the legacy
     * single-image column for properties created before gallery uploads.
     *
     * @return array<int, string>
     */
    public function getImageUrls(): array
    {
        $images = is_array($this->images)
            ? $this->images
            : (is_string($this->images) ? json_decode($this->images, true) : []);

        $paths = is_array($images) ? $images : [];
        if (empty($paths) && $this->image) {
            $paths = [$this->image];
        }

        $paths = array_values(array_unique(array_filter(
            $paths,
            fn ($path) => is_string($path) && trim($path) !== ''
        )));

        return array_map(fn (string $path) => asset(Storage::url($path)), $paths);
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

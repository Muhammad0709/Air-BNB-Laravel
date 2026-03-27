<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Notification extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'image',
        'notifiable_type',
        'notifiable_id',
        'recipient_type',
        'description',
        'rejection_reason',
        'status',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the parent notifiable model (Booking, Property, etc.)
     */
    public function notifiable()
    {
        return $this->morphTo();
    }

    public function markAsRead(): void
    {
        $this->update(['read_at' => now(), 'status' => 'read']);
    }

    /**
     * Get localized content for a specific language
     */
    public function getLocalizedContent(string $field, string $locale): string
    {
        $content = $this->attributes[$field] ?? null;

        // Final fallback
        if (empty($content)) {
            $content = $field === 'title' ? 'Notification' : 'Item updated';
        }

        return $content;
    }
}

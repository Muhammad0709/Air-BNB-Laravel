<?php

namespace App\Enums;

enum BookingStatus: string
{
    // ── Core flow ──────────────────────────────────────────────────────────
    case PENDING                      = 'pending';
    case AWAITING_HOST_RESPONSE       = 'awaiting_host_response';
    case AWAITING_PAYMENT             = 'awaiting_payment';
    case WAITING_FOR_DELIVERY_PAYMENT = 'waiting_for_delivery_payment';
    case CONFIRMED                    = 'confirmed';
    case PAID                         = 'paid';
    case COMPLETED                    = 'completed';

    // ── Terminal / resolution ──────────────────────────────────────────────
    case CANCELLED                    = 'cancelled';
    case EXPIRED                      = 'expired';
    case REFUNDED                     = 'refunded';
    case DISPUTED                     = 'disputed';

    // ──────────────────────────────────────────────────────────────────────
    // Grouping helpers
    // ──────────────────────────────────────────────────────────────────────

    /**
     * Statuses that count as paid / revenue.
     */
    public static function paid(): array
    {
        return [
            self::CONFIRMED->value,
            self::PAID->value,
            self::COMPLETED->value,
        ];
    }

    /**
     * Statuses that count as "upcoming" (not yet stayed / in progress).
     */
    public static function upcoming(): array
    {
        return [
            self::PENDING->value,
            self::AWAITING_HOST_RESPONSE->value,
            self::AWAITING_PAYMENT->value,
            self::WAITING_FOR_DELIVERY_PAYMENT->value,
            self::CONFIRMED->value,
            self::PAID->value,
        ];
    }

    /**
     * Statuses that count as "past" (stay finished or booking terminated).
     */
    public static function past(): array
    {
        return [
            self::COMPLETED->value,
            self::CANCELLED->value,
            self::EXPIRED->value,
            self::REFUNDED->value,
            self::DISPUTED->value,
        ];
    }

    /**
     * Statuses that are still "active" (not terminal).
     */
    public static function active(): array
    {
        return [
            self::PENDING->value,
            self::AWAITING_HOST_RESPONSE->value,
            self::AWAITING_PAYMENT->value,
            self::WAITING_FOR_DELIVERY_PAYMENT->value,
            self::CONFIRMED->value,
            self::PAID->value,
        ];
    }

    /**
     * Terminal / resolved statuses.
     */
    public static function terminal(): array
    {
        return [
            self::COMPLETED->value,
            self::CANCELLED->value,
            self::EXPIRED->value,
            self::REFUNDED->value,
            self::DISPUTED->value,
        ];
    }

    /**
     * All values for validation rules.
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Human-readable label for the status.
     */
    public function label(): string
    {
        return match ($this) {
            self::PENDING                      => 'Pending',
            self::AWAITING_HOST_RESPONSE       => 'Awaiting Host Response',
            self::AWAITING_PAYMENT             => 'Awaiting Payment',
            self::WAITING_FOR_DELIVERY_PAYMENT => 'Waiting for Delivery Payment',
            self::CONFIRMED                    => 'Confirmed',
            self::PAID                         => 'Paid',
            self::COMPLETED                    => 'Completed',
            self::CANCELLED                    => 'Cancelled',
            self::EXPIRED                      => 'Expired',
            self::REFUNDED                     => 'Refunded',
            self::DISPUTED                     => 'Disputed',
        };
    }

    /**
     * Tailwind / hex color token for badge display.
     */
    public function color(): string
    {
        return match ($this) {
            self::PENDING                      => '#F59E0B',   // amber
            self::AWAITING_HOST_RESPONSE       => '#F97316',   // orange
            self::AWAITING_PAYMENT             => '#EAB308',   // yellow
            self::WAITING_FOR_DELIVERY_PAYMENT => '#D97706',   // dark amber
            self::CONFIRMED                    => '#10B981',   // green
            self::PAID                         => '#059669',   // dark green
            self::COMPLETED                    => '#6366F1',   // indigo
            self::CANCELLED                    => '#EF4444',   // red
            self::EXPIRED                      => '#9CA3AF',   // grey
            self::REFUNDED                     => '#3B82F6',   // blue
            self::DISPUTED                     => '#8B5CF6',   // purple
        };
    }
}

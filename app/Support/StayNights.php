<?php

namespace App\Support;

use DateTimeImmutable;
use DateTimeInterface;
use DateTimeZone;

final class StayNights
{
    /**
     * Calculate calendar nights, deliberately ignoring any time component.
     */
    public static function between(DateTimeInterface|string|null $checkin, DateTimeInterface|string|null $checkout): ?int
    {
        $start = self::asDate($checkin);
        $end = self::asDate($checkout);

        if (! $start || ! $end || $end <= $start) {
            return null;
        }

        return (int) $start->diff($end)->days;
    }

    private static function asDate(DateTimeInterface|string|null $value): ?DateTimeImmutable
    {
        if ($value instanceof DateTimeInterface) {
            return DateTimeImmutable::createFromFormat('!Y-m-d', $value->format('Y-m-d'), new DateTimeZone('UTC')) ?: null;
        }

        if (! is_string($value) || ! preg_match('/^\d{4}-\d{2}-\d{2}/', $value)) {
            return null;
        }

        $date = DateTimeImmutable::createFromFormat('!Y-m-d', substr($value, 0, 10), new DateTimeZone('UTC'));
        $errors = DateTimeImmutable::getLastErrors();

        if (! $date || ($errors !== false && ($errors['warning_count'] > 0 || $errors['error_count'] > 0))) {
            return null;
        }

        return $date;
    }
}

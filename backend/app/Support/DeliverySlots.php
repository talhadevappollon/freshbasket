<?php

namespace App\Support;

use Carbon\Carbon;

/**
 * Delivery windows offered at checkout. The same list is mirrored in the storefront
 * (frontend/src/data/deliverySlots.ts); keep the keys in sync.
 */
class DeliverySlots
{
    public const TIMEZONE = 'Asia/Karachi';

    /** Days ahead a shopper may book (0 = today). */
    public const MAX_DAYS_AHEAD = 2;

    /** key => [label, start hour, end hour]. "asap" has no fixed end and is only valid for today. */
    public const WINDOWS = [
        'asap' => ['Express (60-90 min)', null, null],
        '10:00-12:00' => ['10 AM - 12 PM', 10, 12],
        '12:00-14:00' => ['12 PM - 2 PM', 12, 14],
        '14:00-16:00' => ['2 PM - 4 PM', 14, 16],
        '16:00-18:00' => ['4 PM - 6 PM', 16, 18],
        '18:00-20:00' => ['6 PM - 8 PM', 18, 20],
    ];

    public static function keys(): array
    {
        return array_keys(self::WINDOWS);
    }

    public static function label(?string $key): ?string
    {
        return $key && isset(self::WINDOWS[$key]) ? self::WINDOWS[$key][0] : null;
    }

    /**
     * Returns an error message when the date/window pair cannot be booked, otherwise null.
     */
    public static function validate(?string $date, ?string $window): ?string
    {
        if ($date === null && $window === null) {
            return null; // slot is optional: the order is simply dispatched as soon as possible
        }
        if ($date === null || $window === null) {
            return 'Please choose both a delivery day and a time window.';
        }

        $now = Carbon::now(self::TIMEZONE);
        $day = Carbon::parse($date, self::TIMEZONE)->startOfDay();

        if ($day->lt($now->copy()->startOfDay()) || $day->gt($now->copy()->startOfDay()->addDays(self::MAX_DAYS_AHEAD))) {
            return 'That delivery day is not available.';
        }

        $isToday = $day->isSameDay($now);
        if ($window === 'asap') {
            return $isToday ? null : 'Express delivery is only available today.';
        }

        [, , $endHour] = self::WINDOWS[$window];
        if ($isToday && $now->hour >= $endHour - 1) {
            return 'That delivery window has closed for today. Please pick a later one.';
        }

        return null;
    }
}

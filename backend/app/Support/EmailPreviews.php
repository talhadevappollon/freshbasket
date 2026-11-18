<?php

namespace App\Support;

use App\Mail\TestEmail;
use Illuminate\Mail\Mailable;

/**
 * Sample emails for the "Preview" links in Admin → Email Setup, filled with the latest real
 * records when there are any, otherwise with made-up sample data. Nothing is sent or saved.
 */
class EmailPreviews
{
    /** Preview key => email name. */
    public const TYPES = [
        'test' => 'Test email',
    ];

    public static function make(string $type): Mailable
    {
        return match ($type) {
            default => new TestEmail('Store Manager'),
        };
    }
}

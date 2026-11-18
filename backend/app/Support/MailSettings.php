<?php

namespace App\Support;

use App\Models\StoreSetting;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;

/**
 * Admin → Email Setup: the SMTP account the shop sends from, the staff inboxes that get alerts,
 * and which emails are switched on. Kept as one JSON value in store_settings; the SMTP password
 * is stored encrypted with the app key.
 */
class MailSettings
{
    public const KEY = 'mail_settings';

    /** Each email the shop can send: who gets it and when. */
    public const NOTICES = [
        'order_customer' => ['Order confirmation', 'Customer', 'Right after an order is placed (when the customer gave an email address).'],
        'order_staff' => ['New order alert', 'Staff', 'Every new website order, with the items, address and phone number.'],
        'status_customer' => ['Order status updates', 'Customer', 'When an order is marked processing, out for delivery, delivered or cancelled.'],
        'contact_staff' => ['Contact form message', 'Staff', 'Every message sent from the Contact Us page. Reply goes straight to the customer.'],
        'contact_customer' => ['"We got your message" reply', 'Customer', 'Automatic reply to a Contact Us message (when they gave an email address).'],
        'welcome_customer' => ['Welcome email', 'Customer', 'When a shopper creates an account with an email address.'],
        'password_customer' => ['Password reset', 'Customer', 'The "forgot password" link, then a note once the password is changed. Without it, shoppers cannot reset a password themselves.'],
        'review_staff' => ['New review alert', 'Staff', 'When a customer posts a product review.'],
        'low_stock_staff' => ['Low stock alert', 'Staff', 'When an order takes a tracked product down to its low-stock level.'],
    ];

    public const ENCRYPTION = [
        'ssl' => 'SSL (usually port 465)',
        'tls' => 'TLS / STARTTLS (usually port 587)',
        'none' => 'None (port 25, not recommended)',
    ];

    public static function defaults(): array
    {
        return [
            'enabled' => false,
            'host' => '',
            'port' => 465,
            'encryption' => 'ssl',
            'username' => '',
            'password' => '', // encrypted
            'verify_peer' => true,
            'from_address' => '',
            'from_name' => 'Fresh House',
            'reply_to' => '',
            'staff_recipients' => '',
            // A copy of every email the shop sends (orders, accounts, contact, ...) goes to this inbox
            'copy_to' => 'admin@freshhouse.pk',
            'copy_mode' => 'cc', // cc (the customer sees it) | bcc (hidden)
            // All on, except low-stock alerts (they can be many while stock counts are still being set up)
            'notices' => array_merge(array_fill_keys(array_keys(self::NOTICES), true), ['low_stock_staff' => false]),
        ];
    }

    public static function get(): array
    {
        $saved = json_decode((string) StoreSetting::get(self::KEY, ''), true);
        $defaults = self::defaults();
        if (! is_array($saved)) {
            return $defaults;
        }
        $merged = array_merge($defaults, array_intersect_key($saved, $defaults));
        $merged['notices'] = array_merge($defaults['notices'], array_intersect_key((array) ($saved['notices'] ?? []), $defaults['notices']));

        return $merged;
    }

    public static function save(array $settings): void
    {
        StoreSetting::set(self::KEY, json_encode($settings, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), 'email');
    }

    public static function encryptPassword(string $plain): string
    {
        return $plain === '' ? '' : Crypt::encryptString($plain);
    }

    /** The saved SMTP password in plain text; '' when none is saved or it was saved under another app key. */
    public static function password(?array $settings = null): string
    {
        $stored = (string) (($settings ?? self::get())['password'] ?? '');
        if ($stored === '') {
            return '';
        }
        try {
            return Crypt::decryptString($stored);
        } catch (DecryptException) {
            return '';
        }
    }

    public const COPY_MODES = [
        'cc' => 'CC (the customer sees this address)',
        'bcc' => 'BCC (hidden from the customer)',
    ];

    /** The admin copy address, or null when none is set. */
    public static function copyTo(?array $settings = null): ?string
    {
        $address = strtolower(trim((string) (($settings ?? self::get())['copy_to'] ?? '')));

        return filter_var($address, FILTER_VALIDATE_EMAIL) ? $address : null;
    }

    public static function isReady(?array $settings = null): bool
    {
        $s = $settings ?? self::get();

        return $s['enabled'] && $s['host'] !== '' && filter_var($s['from_address'], FILTER_VALIDATE_EMAIL);
    }

    public static function noticeOn(string $notice, ?array $settings = null): bool
    {
        return (bool) (($settings ?? self::get())['notices'][$notice] ?? false);
    }

    /** Staff inboxes for alerts; when none are set, the admin copy address, then the support email in Store Settings. */
    public static function staffRecipients(?array $settings = null): array
    {
        $settings ??= self::get();
        $list = self::parseList((string) ($settings['staff_recipients'] ?? ''));
        if (! $list && ($admin = self::copyTo($settings))) {
            $list = [$admin];
        }
        if (! $list && filter_var($support = strtolower((string) StoreSetting::get('support_email', '')), FILTER_VALIDATE_EMAIL)) {
            $list = [$support];
        }

        return $list;
    }

    /** Email addresses from text separated by commas, semicolons, spaces or new lines (valid ones only, no repeats). */
    public static function parseList(string $raw): array
    {
        $parts = preg_split('/[\s,;]+/', strtolower(trim($raw)), -1, PREG_SPLIT_NO_EMPTY) ?: [];

        return array_values(array_unique(array_filter($parts, fn ($e) => filter_var($e, FILTER_VALIDATE_EMAIL))));
    }

    /** Mailer settings for Mail::build(). */
    public static function transportConfig(array $s, string $password): array
    {
        $config = [
            'transport' => 'smtp',
            'scheme' => $s['encryption'] === 'ssl' ? 'smtps' : 'smtp',
            'host' => $s['host'],
            'port' => (int) $s['port'],
            'username' => $s['username'] !== '' ? $s['username'] : null,
            'password' => $password !== '' ? $password : null,
            'timeout' => 20,
        ];
        if ($s['encryption'] === 'tls') {
            $config['require_tls'] = true;
        } elseif ($s['encryption'] === 'none') {
            $config['auto_tls'] = false;
        }
        if (! $s['verify_peer']) {
            $config['verify_peer'] = false;
        }

        return $config;
    }
}

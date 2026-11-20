<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

/**
 * Hidden launch for freshhouse.pk. Until the shop is opened in the admin, the root .htaccess shows visitors
 * backend/public/coming-soon.html instead of the shop. Signed-in staff get the "fh_preview" cookie; the server lets
 * a request through when the cookie's value names a file in storage/app/preview (so no secret is kept in the code).
 *
 *   storage/app/site-public      exists = the shop is open to everyone
 *   storage/app/preview/<key>    the staff preview key (one per server)
 *
 * Both live only on the server (storage/app is not in git), so deploys never change them.
 */
class ShopPreview
{
    public const COOKIE = 'fh_preview';

    /** Domains that launch hidden. Other domains (the test site) are always open. */
    public const HIDDEN_HOSTS = ['freshhouse.pk', 'www.freshhouse.pk'];

    public static function appliesTo(Request $request): bool
    {
        return in_array(strtolower($request->getHost()), self::HIDDEN_HOSTS, true);
    }

    public static function isOpen(): bool
    {
        return File::exists(storage_path('app/site-public'));
    }

    public static function open(): void
    {
        File::put(storage_path('app/site-public'), 'Opened ' . now()->toDateTimeString() . "\n");
    }

    public static function hide(): void
    {
        File::delete(storage_path('app/site-public'));
    }

    /** The staff preview key, created on first use. */
    public static function key(): string
    {
        $dir = storage_path('app/preview');
        File::ensureDirectoryExists($dir);
        foreach (File::files($dir) as $file) {
            if (preg_match('/^[A-Za-z0-9]{40}$/', $file->getFilename())) {
                return $file->getFilename();
            }
        }
        $key = Str::random(40);
        File::put($dir . DIRECTORY_SEPARATOR . $key, "Staff preview key for the hidden launch\n");

        return $key;
    }
}

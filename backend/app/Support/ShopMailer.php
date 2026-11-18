<?php

namespace App\Support;

use App\Models\EmailLog;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Throwable;

use function Illuminate\Support\defer;

/**
 * Sends the shop's emails through the SMTP account from Admin → Email Setup and records each one in
 * the email log. A failed email never breaks the page that triggered it.
 */
class ShopMailer
{
    /**
     * Send after the response has gone to the browser, so a slow mail server never slows checkout.
     *
     * @param  string|array  $to
     * @param  string  $notice  key of MailSettings::NOTICES; skipped when that email is switched off
     */
    public static function later(string|array $to, Mailable $mail, string $notice, ?string $reference = null): void
    {
        $settings = MailSettings::get();
        if (! MailSettings::isReady($settings) || ! MailSettings::noticeOn($notice, $settings)) {
            return;
        }
        $recipients = is_array($to) ? $to : MailSettings::parseList($to);
        if (! $recipients) {
            return;
        }

        defer(fn () => self::deliver($recipients, $mail, $notice, $reference, $settings));
    }

    /** To the staff inboxes (Email Setup, or the store's support email). */
    public static function staffLater(Mailable $mail, string $notice, ?string $reference = null): void
    {
        self::later(MailSettings::staffRecipients(), $mail, $notice, $reference);
    }

    /**
     * Send now. Returns null when sent, otherwise the reason it failed.
     *
     * @param  array|null  $settings  settings to use instead of the saved ones (the test email)
     */
    public static function deliver(array $recipients, Mailable $mail, string $type, ?string $reference = null, ?array $settings = null): ?string
    {
        $settings ??= MailSettings::get();
        $error = null;
        $subject = '';

        try {
            $mailer = Mail::build(MailSettings::transportConfig($settings, MailSettings::password($settings)));
            $mailer->alwaysFrom($settings['from_address'], $settings['from_name'] ?: config('app.name'));
            if (filter_var($settings['reply_to'] ?? '', FILTER_VALIDATE_EMAIL) && ! $mail->replyTo) {
                $mailer->alwaysReplyTo($settings['reply_to']);
            }
            $subject = (string) (method_exists($mail, 'envelope') ? ($mail->envelope()->subject ?? '') : ($mail->subject ?? ''));
            $pending = $mailer->to($recipients);
            // Admin copy of every email (not of the test email, which already goes where it is asked to)
            $copy = $type === 'test' ? null : MailSettings::copyTo($settings);
            if ($copy && ! in_array($copy, array_map('strtolower', $recipients), true)) {
                ($settings['copy_mode'] ?? 'cc') === 'bcc' ? $pending->bcc($copy) : $pending->cc($copy);
                $copyNote = ' (' . (($settings['copy_mode'] ?? 'cc') === 'bcc' ? 'bcc' : 'cc') . " $copy)";
            }
            $pending->send($mail);
        } catch (Throwable $e) {
            $error = self::readable($e);
            Log::warning("Email '$type' to " . implode(', ', $recipients) . " failed: $error");
        }

        self::record($type, $recipients, $subject, $error, $reference, $copyNote ?? '');

        return $error;
    }

    private static function record(string $type, array $recipients, string $subject, ?string $error, ?string $reference, string $copyNote = ''): void
    {
        try {
            if (! Schema::hasTable('email_logs')) {
                return;
            }
            EmailLog::create([
                'type' => $type,
                'recipient' => Str::limit(implode(', ', $recipients) . $copyNote, 495),
                'subject' => Str::limit($subject, 250),
                'status' => $error === null ? 'sent' : 'failed',
                'error' => $error,
                'reference' => $reference ? Str::limit($reference, 78) : null,
            ]);
        } catch (Throwable $e) {
            Log::warning('Could not write the email log: ' . $e->getMessage());
        }
    }

    /** One readable line from an SMTP error, with long server dumps trimmed. */
    private static function readable(Throwable $e): string
    {
        $message = trim(preg_replace('/\s+/', ' ', $e->getMessage()));

        return Str::limit($message !== '' ? $message : class_basename($e), 600);
    }
}

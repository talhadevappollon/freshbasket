<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\TestEmail;
use App\Models\EmailLog;
use App\Support\EmailPreviews;
use App\Support\MailSettings;
use App\Support\ShopMailer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

/**
 * Admin → Email Setup: the SMTP account, sender, staff inboxes, which emails are on, a test email,
 * previews of every email, and the log of what was sent.
 */
class EmailSettingsController extends Controller
{
    public function index()
    {
        $settings = MailSettings::get();
        $logs = collect();
        if (Schema::hasTable('email_logs')) {
            EmailLog::where('created_at', '<', now()->subDays(EmailLog::KEEP_DAYS))->delete();
            $logs = EmailLog::latest('id')->limit(40)->get();
        }

        return view('admin.email', [
            'settings' => $settings,
            'notices' => MailSettings::NOTICES,
            'encryptions' => MailSettings::ENCRYPTION,
            'copyModes' => MailSettings::COPY_MODES,
            'passwordSaved' => $settings['password'] !== '',
            'passwordUnreadable' => $settings['password'] !== '' && MailSettings::password($settings) === '',
            'ready' => MailSettings::isReady($settings),
            'staff' => MailSettings::staffRecipients($settings),
            'logs' => $logs,
            'previewable' => EmailPreviews::TYPES,
        ]);
    }

    public function save(Request $request)
    {
        $testing = $request->input('action') === 'test';
        $data = $request->validate([
            'enabled' => 'sometimes|boolean',
            'host' => ['nullable', 'string', 'max:191', 'regex:/^[A-Za-z0-9.\-]+$/', Rule::requiredIf($request->boolean('enabled') || $testing)],
            'port' => 'required|integer|between:1,65535',
            'encryption' => ['required', Rule::in(array_keys(MailSettings::ENCRYPTION))],
            'username' => 'nullable|string|max:191',
            'password' => 'nullable|string|max:500',
            'clear_password' => 'sometimes|boolean',
            'skip_cert_check' => 'sometimes|boolean',
            'from_address' => ['nullable', 'email', 'max:191', Rule::requiredIf($request->boolean('enabled') || $testing)],
            'from_name' => ['nullable', 'string', 'max:100', 'regex:/^[^\r\n<>]*$/'],
            'reply_to' => 'nullable|email|max:191',
            'staff_recipients' => 'nullable|string|max:2000',
            'copy_to' => 'nullable|email|max:191',
            'copy_mode' => ['required', Rule::in(array_keys(MailSettings::COPY_MODES))],
            'notices' => 'nullable|array',
            'notices.*' => 'boolean',
            'test_to' => [Rule::requiredIf($testing), 'nullable', 'email', 'max:191'],
        ], [
            'host.regex' => 'The SMTP server should look like mail.example.com (letters, digits, dots and dashes only).',
            'host.required' => 'Enter the SMTP server to switch emails on.',
            'from_address.required' => 'Enter the "from" email address to switch emails on.',
            'test_to.required' => 'Enter the address the test email should go to.',
        ]);

        $current = MailSettings::get();
        $password = $current['password'];
        if ($request->boolean('clear_password')) {
            $password = '';
        } elseif (($data['password'] ?? '') !== '') {
            $password = MailSettings::encryptPassword($data['password']);
        }

        $settings = [
            'enabled' => $request->boolean('enabled'),
            'host' => strtolower(trim((string) ($data['host'] ?? ''))),
            'port' => (int) $data['port'],
            'encryption' => $data['encryption'],
            'username' => trim((string) ($data['username'] ?? '')),
            'password' => $password,
            'verify_peer' => ! $request->boolean('skip_cert_check'),
            'from_address' => strtolower(trim((string) ($data['from_address'] ?? ''))),
            'from_name' => trim((string) ($data['from_name'] ?? '')),
            'reply_to' => strtolower(trim((string) ($data['reply_to'] ?? ''))),
            'staff_recipients' => implode(', ', MailSettings::parseList((string) ($data['staff_recipients'] ?? ''))),
            'copy_to' => strtolower(trim((string) ($data['copy_to'] ?? ''))),
            'copy_mode' => $data['copy_mode'],
            'notices' => [],
        ];
        foreach (array_keys(MailSettings::NOTICES) as $key) {
            $settings['notices'][$key] = (bool) ($data['notices'][$key] ?? false);
        }
        MailSettings::save($settings);

        if (! $testing) {
            return redirect()->route('admin.email')->with('success', 'Email settings saved.' . (MailSettings::isReady($settings) ? '' : ' Emails are not being sent yet: switch them on and fill in the server and "from" address.'));
        }

        $error = ShopMailer::deliver([$data['test_to']], new TestEmail((string) $request->user()?->name), 'test', null, $settings);

        return $error === null
            ? redirect()->route('admin.email')->with('success', "Settings saved and a test email was sent to {$data['test_to']}. If it is not in the inbox within a minute, check the spam folder.")
            : redirect()->route('admin.email')->withErrors(['test' => "Settings saved, but the test email could not be sent: $error"]);
    }

    /** How each email looks, filled with the latest real data or a sample. */
    public function preview(string $type)
    {
        abort_unless(array_key_exists($type, EmailPreviews::TYPES), 404);

        return EmailPreviews::make($type)->render();
    }
}

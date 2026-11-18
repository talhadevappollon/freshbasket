@extends('admin.layout')

@section('content')
@php
    $field = 'w-full px-3.5 h-10 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none';
    $label = 'block text-[11px] font-bold text-gray-600 mb-1';
    $card = 'bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm';
    $hint = 'text-[11px] text-gray-500 mt-1';
    $s = $settings;
@endphp
<div class="space-y-6 max-w-5xl mx-auto">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 class="text-2xl font-black text-gray-900 tracking-tight">Email Setup</h2>
            <p class="text-xs text-gray-500">The email account the shop sends from, who gets staff alerts, and which emails go out. Changes apply straight away.</p>
        </div>
        @if($ready)
            <span class="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-fresh-100 text-fresh-800 border border-fresh-200"><span class="w-2 h-2 rounded-full bg-fresh-500"></span> Emails are on</span>
        @elseif($s['enabled'])
            <span class="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200"><span class="w-2 h-2 rounded-full bg-amber-500"></span> Switched on, setup not complete</span>
        @else
            <span class="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-gray-100 text-gray-600 border border-gray-200"><span class="w-2 h-2 rounded-full bg-gray-400"></span> Emails are off</span>
        @endif
    </div>

    <form method="POST" action="{{ route('admin.email.save') }}" class="space-y-6" autocomplete="off">
        @csrf

        {{-- 1. SMTP connection --}}
        <section class="{{ $card }}" aria-labelledby="smtp-title">
            <div class="flex items-start justify-between gap-4">
                <div>
                    <h3 id="smtp-title" class="font-black text-gray-900 text-base">Email account (SMTP)</h3>
                    <p class="text-xs text-gray-500 mt-0.5">The mailbox the shop sends from.</p>
                </div>
                <label class="shrink-0 inline-flex items-center gap-2 cursor-pointer select-none">
                    <input type="hidden" name="enabled" value="0">
                    <input type="checkbox" name="enabled" value="1" @checked(old('enabled', $s['enabled'])) class="peer sr-only">
                    <span class="relative w-11 h-6 rounded-full bg-gray-300 peer-checked:bg-fresh-600 transition after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5 peer-focus-visible:ring-4 peer-focus-visible:ring-fresh-500/30"></span>
                    <span class="text-xs font-black text-gray-800">Send emails</span>
                </label>
            </div>

            <div class="mt-4 p-3.5 rounded-2xl bg-fresh-50 border border-fresh-100 text-[11px] text-fresh-900 leading-relaxed">
                <b>Using a cPanel mailbox</b> (cPanel → Email Accounts → Connect Devices shows these):
                server <b>mail.your-domain</b>, port <b>465</b> with <b>SSL</b>, username = the <b>full email address</b>, password = that mailbox's password.
                Gmail / Google Workspace: smtp.gmail.com, 465, SSL, with an <b>app password</b>.
            </div>

            <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                <div class="sm:col-span-2">
                    <label class="{{ $label }}" for="host">SMTP server</label>
                    <input id="host" name="host" type="text" value="{{ old('host', $s['host']) }}" maxlength="191" placeholder="mail.freshhouse.pk" class="{{ $field }}">
                </div>
                <div>
                    <label class="{{ $label }}" for="encryption">Security</label>
                    <select id="encryption" name="encryption" class="{{ $field }} bg-white">
                        @foreach($encryptions as $key => $name)
                            <option value="{{ $key }}" @selected(old('encryption', $s['encryption']) === $key)>{{ $name }}</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label class="{{ $label }}" for="port">Port</label>
                    <input id="port" name="port" type="number" min="1" max="65535" value="{{ old('port', $s['port']) }}" required class="{{ $field }}">
                </div>
                <div class="sm:col-span-2">
                    <label class="{{ $label }}" for="username">Username</label>
                    <input id="username" name="username" type="text" value="{{ old('username', $s['username']) }}" maxlength="191" placeholder="orders@freshhouse.pk" autocomplete="off" class="{{ $field }}">
                </div>
                <div class="sm:col-span-2">
                    <label class="{{ $label }}" for="password">Password</label>
                    <input id="password" name="password" type="password" value="" maxlength="500" autocomplete="new-password"
                           placeholder="{{ $passwordSaved && ! $passwordUnreadable ? '•••••••• saved (leave empty to keep it)' : 'Mailbox password' }}" class="{{ $field }}">
                    @if($passwordUnreadable)
                        <p class="text-[11px] text-red-700 font-bold mt-1">The saved password can no longer be read on this server. Type it again.</p>
                    @elseif($passwordSaved)
                        <label class="inline-flex items-center gap-1.5 mt-1.5 text-[11px] text-gray-600"><input type="checkbox" name="clear_password" value="1" class="rounded border-gray-300"> Remove the saved password</label>
                    @endif
                </div>
            </div>
            <label class="inline-flex items-start gap-2 mt-3 text-[11px] text-gray-600">
                <input type="hidden" name="skip_cert_check" value="0">
                <input type="checkbox" name="skip_cert_check" value="1" @checked(old('skip_cert_check', ! $s['verify_peer'])) class="mt-0.5 rounded border-gray-300">
                <span>Skip the security-certificate check. Only tick this if the test email fails with a <b>certificate</b> error (common when the server name and certificate differ).</span>
            </label>
        </section>

        {{-- 2. Sender --}}
        <section class="{{ $card }}" aria-labelledby="sender-title">
            <h3 id="sender-title" class="font-black text-gray-900 text-base">Sender</h3>
            <p class="text-xs text-gray-500 mt-0.5 mb-4">What customers see in their inbox. The "from" address should be the mailbox above (or one it may send as), otherwise emails land in spam.</p>
            <div class="grid sm:grid-cols-3 gap-3">
                <div>
                    <label class="{{ $label }}" for="from_name">From name</label>
                    <input id="from_name" name="from_name" type="text" value="{{ old('from_name', $s['from_name']) }}" maxlength="100" placeholder="Fresh House" class="{{ $field }}">
                </div>
                <div>
                    <label class="{{ $label }}" for="from_address">From address</label>
                    <input id="from_address" name="from_address" type="email" value="{{ old('from_address', $s['from_address']) }}" maxlength="191" placeholder="orders@freshhouse.pk" class="{{ $field }}">
                </div>
                <div>
                    <label class="{{ $label }}" for="reply_to">Replies go to <span class="font-medium text-gray-400">(optional)</span></label>
                    <input id="reply_to" name="reply_to" type="email" value="{{ old('reply_to', $s['reply_to']) }}" maxlength="191" placeholder="support@freshhouse.pk" class="{{ $field }}">
                </div>
            </div>
        </section>

        {{-- 3. Staff inboxes --}}
        <section class="{{ $card }}" aria-labelledby="staff-title">
            <h3 id="staff-title" class="font-black text-gray-900 text-base">Staff inboxes &amp; admin copy</h3>
            <p class="text-xs text-gray-500 mt-0.5 mb-3">Who gets the staff alerts (new orders, contact messages, reviews, low stock). Separate several addresses with commas.</p>
            <textarea name="staff_recipients" rows="2" maxlength="2000" placeholder="orders@freshhouse.pk, manager@freshhouse.pk" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none">{{ old('staff_recipients', $s['staff_recipients']) }}</textarea>
            <p class="{{ $hint }}">
                @if($s['staff_recipients'] === '' && $staff)
                    Empty: alerts go to {{ implode(', ', $staff) }}.
                @elseif(! $staff)
                    <span class="text-amber-700 font-bold">No staff address yet: staff alerts are not sent.</span>
                @else
                    Alerts go to: {{ implode(', ', $staff) }}
                @endif
            </p>

            <div class="grid sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-100">
                <div class="sm:col-span-2">
                    <label class="{{ $label }}" for="copy_to">Admin copy of every email</label>
                    <input id="copy_to" name="copy_to" type="email" value="{{ old('copy_to', $s['copy_to']) }}" maxlength="191" placeholder="admin@freshhouse.pk" class="{{ $field }}">
                    <p class="{{ $hint }}">Every email the shop sends (order confirmations, status updates, account and password emails, contact replies, staff alerts) is copied here. Leave empty for no copies.</p>
                </div>
                <div>
                    <label class="{{ $label }}" for="copy_mode">Copy as</label>
                    <select id="copy_mode" name="copy_mode" class="{{ $field }} bg-white">
                        @foreach($copyModes as $key => $name)
                            <option value="{{ $key }}" @selected(old('copy_mode', $s['copy_mode']) === $key)>{{ $name }}</option>
                        @endforeach
                    </select>
                </div>
            </div>
        </section>

        {{-- 4. Which emails --}}
        <section class="{{ $card }}" aria-labelledby="notices-title">
            <h3 id="notices-title" class="font-black text-gray-900 text-base">Which emails are sent</h3>
            <p class="text-xs text-gray-500 mt-0.5 mb-4">Tick the emails the shop should send. "Preview" shows how each one looks, filled with your latest real order, message or review.</p>
            <div class="divide-y divide-gray-100 border border-gray-100 rounded-2xl">
                @foreach($notices as $key => [$name, $who, $when])
                    <div class="flex items-start gap-3 p-3.5">
                        <input type="hidden" name="notices[{{ $key }}]" value="0">
                        <input id="notice_{{ $key }}" type="checkbox" name="notices[{{ $key }}]" value="1" @checked(old("notices.$key", $s['notices'][$key] ?? false)) class="mt-0.5 w-4 h-4 rounded border-gray-300 text-fresh-600 focus:ring-fresh-500">
                        <label for="notice_{{ $key }}" class="flex-1 min-w-0 cursor-pointer">
                            <span class="block text-xs font-black text-gray-900">{{ $name }}
                                <span class="ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold {{ $who === 'Customer' ? 'bg-blue-50 text-blue-700' : 'bg-fresh-50 text-fresh-800' }}">to {{ strtolower($who) }}</span>
                            </span>
                            <span class="block text-[11px] text-gray-500 mt-0.5">{{ $when }}</span>
                        </label>
                        @if(array_key_exists($key, $previewable))
                            <a href="{{ route('admin.email.preview', $key) }}" target="_blank" rel="noopener" class="shrink-0 text-[11px] font-bold text-fresh-700 hover:text-fresh-900 hover:underline">Preview</a>
                        @endif
                    </div>
                @endforeach
            </div>
        </section>

        {{-- 5. Test --}}
        <section class="{{ $card }}" aria-labelledby="test-title">
            <h3 id="test-title" class="font-black text-gray-900 text-base">Send a test email</h3>
            <p class="text-xs text-gray-500 mt-0.5 mb-4">Saves the settings above, then sends a test email so you can see the connection works. If it fails, the reason from the mail server is shown at the top.</p>
            <div class="flex flex-col sm:flex-row gap-3">
                <input name="test_to" type="email" value="{{ old('test_to', auth()->user()->email) }}" maxlength="191" placeholder="you@example.com" aria-label="Send the test email to" class="{{ $field }} sm:max-w-sm">
                <button type="submit" name="action" value="test" class="shrink-0 px-5 h-10 rounded-xl text-xs font-bold bg-white border border-fresh-400 text-fresh-800 hover:bg-fresh-50 flex items-center justify-center gap-1.5">
                    <i class="fa-solid fa-paper-plane"></i> Save &amp; send test email
                </button>
            </div>
        </section>

        <div class="sticky bottom-4 flex justify-end">
            <button type="submit" name="action" value="save" class="px-7 h-12 rounded-2xl text-sm font-bold bg-fresh-600 hover:bg-fresh-700 active:bg-fresh-800 text-white shadow-xl shadow-fresh-600/30">
                Save settings
            </button>
        </div>
    </form>

    {{-- 6. Log --}}
    <section class="{{ $card }}" aria-labelledby="log-title">
        <h3 id="log-title" class="font-black text-gray-900 text-base">Recent emails</h3>
        <p class="text-xs text-gray-500 mt-0.5 mb-4">The last 40 emails the shop tried to send (kept for 90 days).</p>
        @if($logs->isEmpty())
            <p class="text-xs text-gray-500 py-6 text-center border border-dashed border-gray-200 rounded-2xl">No emails sent yet.</p>
        @else
            <div class="overflow-x-auto">
                <table class="w-full text-xs">
                    <thead>
                        <tr class="text-left text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                            <th class="py-2 pr-3 font-black">When</th>
                            <th class="py-2 pr-3 font-black">Email</th>
                            <th class="py-2 pr-3 font-black">To</th>
                            <th class="py-2 font-black">Result</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        @foreach($logs as $log)
                            <tr class="align-top">
                                <td class="py-2.5 pr-3 whitespace-nowrap text-gray-500">{{ $log->created_at->timezone('Asia/Karachi')->format('d M, g:i a') }}</td>
                                <td class="py-2.5 pr-3">
                                    <span class="font-bold text-gray-900">{{ $log->type === 'test' ? 'Test email' : ($notices[$log->type][0] ?? $log->type) }}</span>
                                    <span class="block text-gray-500">{{ $log->subject }}</span>
                                </td>
                                <td class="py-2.5 pr-3 text-gray-700 break-all">{{ $log->recipient }}</td>
                                <td class="py-2.5">
                                    @if($log->status === 'sent')
                                        <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black bg-fresh-100 text-fresh-800">Sent</span>
                                    @else
                                        <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800">Failed</span>
                                        <span class="block text-[11px] text-red-700 mt-1 break-words max-w-md">{{ $log->error }}</span>
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif
    </section>
</div>

<script>
    // Picking a security option suggests its usual port (only when the port is still one of the usual ones)
    (function () {
        const usual = { ssl: 465, tls: 587, none: 25 };
        const enc = document.getElementById('encryption');
        const port = document.getElementById('port');
        enc.addEventListener('change', function () {
            if (Object.values(usual).includes(Number(port.value)) || port.value === '') port.value = usual[enc.value];
        });
    })();
</script>
@endsection

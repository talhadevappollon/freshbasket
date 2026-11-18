@extends('emails.layout')

@section('preheader')Your {{ $shop['name'] }} account is ready: faster checkout and all your orders in one place.@endsection

@section('body')
    <h1 style="margin:0 0 10px;font-size:22px;line-height:1.3;color:#10240f;">Welcome, {{ strtok(trim($account->name), ' ') ?: 'there' }}!</h1>
    <p style="margin:0 0 14px;">Your {{ $shop['name'] }} account is ready. Sign in with your phone number <strong>{{ $account->phone }}</strong> or this email address.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 6px;font-size:14px;line-height:1.6;">
        <tr><td style="padding:3px 10px 3px 0;color:#3a7538;font-weight:700;vertical-align:top;">✓</td><td style="padding:3px 0;">Checkout is quicker: your delivery address is remembered.</td></tr>
        <tr><td style="padding:3px 10px 3px 0;color:#3a7538;font-weight:700;vertical-align:top;">✓</td><td style="padding:3px 0;">See every order and its status in My Account.</td></tr>
        <tr><td style="padding:3px 10px 3px 0;color:#3a7538;font-weight:700;vertical-align:top;">✓</td><td style="padding:3px 0;">Same-day delivery across Karachi, cash on delivery.</td></tr>
    </table>

    @include('emails.partials.button', ['href' => $shop['url'], 'label' => 'Start shopping'])
    <p style="margin:10px 0 0;font-size:13px;color:#5b6b5a;">Did not create this account? Reply to this email and we will remove it.</p>
@endsection

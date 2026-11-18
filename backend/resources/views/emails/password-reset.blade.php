@extends('emails.layout')

@section('preheader')Use this link within {{ $minutes }} minutes to choose a new password.@endsection

@section('body')
    <h1 style="margin:0 0 10px;font-size:22px;line-height:1.3;color:#10240f;">Reset your password</h1>
    <p style="margin:0 0 6px;">Hi {{ strtok(trim($account->name), ' ') ?: 'there' }}, someone (hopefully you) asked to reset the password of your {{ $shop['name'] }} account. Tap the button to choose a new one.</p>

    @include('emails.partials.button', ['href' => $resetUrl, 'label' => 'Choose a new password'])

    <p style="margin:12px 0 0;font-size:13px;color:#5b6b5a;">The link works once, for {{ $minutes }} minutes. If the button does not open, copy this address into your browser:<br>
        <a href="{{ $resetUrl }}" style="color:#3a7538;word-break:break-all;">{{ $resetUrl }}</a></p>
    <p style="margin:12px 0 0;font-size:13px;color:#5b6b5a;">Did not ask for this? You can ignore this email: your password stays the same.</p>
@endsection

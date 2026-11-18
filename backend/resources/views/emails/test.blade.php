@extends('emails.layout')

@section('preheader')Your shop's email settings work.@endsection

@section('body')
    <h1 style="margin:0 0 10px;font-size:22px;line-height:1.3;color:#10240f;">Your email settings work</h1>
    <p style="margin:0 0 14px;">This test email was sent from the {{ $shop['name'] }} admin panel ({{ $sentAt }}{{ $sentBy ? ', by ' . $sentBy : '' }}).</p>
    <p style="margin:0;">Order confirmations, staff alerts and the other emails switched on in <strong>Admin → Email Setup</strong> will be sent from this account.</p>
@endsection

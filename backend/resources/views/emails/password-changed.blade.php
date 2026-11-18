@extends('emails.layout')

@section('preheader')The password of your {{ $shop['name'] }} account was changed {{ $when }}.@endsection

@section('body')
    <h1 style="margin:0 0 10px;font-size:22px;line-height:1.3;color:#10240f;">Your password was changed</h1>
    <p style="margin:0 0 14px;">Hi {{ strtok(trim($account->name), ' ') ?: 'there' }}, the password of your {{ $shop['name'] }} account was changed on {{ $when }}. For your safety, every other device was signed out.</p>
    <p style="margin:0;">Was this not you? Reset it again straight away and let us know{{ $shop['phone'] ? ' on ' . $shop['phone'] : '' }}.</p>
    @include('emails.partials.button', ['href' => $forgotUrl, 'label' => 'Reset my password'])
@endsection

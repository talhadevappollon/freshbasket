@extends('emails.layout')

@section('preheader'){{ $statusMessage }}@endsection

@section('body')
    <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:{{ $order->order_status === 'cancelled' ? '#b20f0b' : '#3a7538' }};">Order {{ $order->order_number }}</p>
    <h1 style="margin:0 0 10px;font-size:22px;line-height:1.3;color:#10240f;">{{ $heading }}</h1>
    <p style="margin:0;">Hi {{ strtok(trim($order->customer_name), ' ') ?: 'there' }}, {{ lcfirst($statusMessage) }}</p>

    @if($order->order_status !== 'cancelled')
        @include('emails.partials.order-items')
        @if($order->order_status !== 'delivered')
            @include('emails.partials.order-delivery')
        @endif
    @endif

    @if(in_array($order->order_status, ['processing', 'dispatched'], true))
        @include('emails.partials.button', ['href' => $trackUrl, 'label' => 'Track your order'])
    @else
        @include('emails.partials.button', ['href' => $shop['url'], 'label' => $order->order_status === 'delivered' ? 'Shop again' : 'Visit the shop'])
    @endif
    <p style="margin:10px 0 0;font-size:13px;color:#5b6b5a;">Questions? Reply to this email{{ $shop['phone'] ? ' or call ' . $shop['phone'] : '' }}.</p>
@endsection

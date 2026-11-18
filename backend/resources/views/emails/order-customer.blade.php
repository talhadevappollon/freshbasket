@extends('emails.layout')

@section('preheader')We have your order {{ $order->order_number }} for PKR {{ number_format($order->total, 0) }}. Pay cash when it arrives.@endsection

@section('body')
    <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#3a7538;">Order {{ $order->order_number }}</p>
    <h1 style="margin:0 0 10px;font-size:22px;line-height:1.3;color:#10240f;">Thank you, {{ strtok(trim($order->customer_name), ' ') ?: 'there' }}! Your order is in.</h1>
    <p style="margin:0;">We have received your order and will start packing it soon. You will get an email when it is on its way.
        @if($order->payment_method === 'cod') Please keep <strong>PKR {{ number_format($order->total, 0) }}</strong> ready: you pay cash when it arrives.@endif
    </p>

    @include('emails.partials.order-items')
    @include('emails.partials.order-delivery')

    @include('emails.partials.button', ['href' => $trackUrl, 'label' => 'Track your order'])
    <p style="margin:10px 0 0;font-size:13px;color:#5b6b5a;">To track it, use your order number <strong>{{ $order->order_number }}</strong> and the phone number you ordered with. Questions? Just reply to this email{{ $shop['phone'] ? ' or call ' . $shop['phone'] : '' }}.</p>
@endsection

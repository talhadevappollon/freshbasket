@extends('emails.layout')

@section('preheader'){{ $order->customer_name }} · {{ $order->customer_phone }} · {{ $order->items->sum('quantity') }} items · PKR {{ number_format($order->total, 0) }}@endsection

@section('body')
    <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#3a7538;">New website order</p>
    <h1 style="margin:0 0 6px;font-size:22px;line-height:1.3;color:#10240f;">{{ $order->order_number }} · PKR {{ number_format($order->total, 0) }}</h1>
    <p style="margin:0;color:#4b5b4a;">Placed {{ $order->created_at?->timezone('Asia/Karachi')->format('D d M Y, g:i a') }} · {{ strtoupper($order->payment_method) }}
        @if($order->customer_email) · <a href="mailto:{{ $order->customer_email }}" style="color:#3a7538;">{{ $order->customer_email }}</a>@endif
    </p>

    @include('emails.partials.order-delivery')
    @include('emails.partials.order-items')

    @include('emails.partials.button', ['href' => $adminUrl, 'label' => 'Open in the admin panel'])
    @if($order->customer_email)
        <p style="margin:10px 0 0;font-size:13px;color:#5b6b5a;">Replying to this email writes to the customer.</p>
    @endif
@endsection

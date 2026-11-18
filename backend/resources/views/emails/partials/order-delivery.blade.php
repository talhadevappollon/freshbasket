<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 0;background:#f4f8f3;border-radius:14px;">
    <tr>
        <td style="padding:16px 18px;font-size:14px;line-height:1.6;color:#1d2b1c;">
            <span style="display:block;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#6b7d6a;margin-bottom:4px;">Delivering to</span>
            <strong>{{ $order->customer_name }}</strong> · {{ $order->customer_phone }}<br>
            {{ $order->delivery_address }}@if($order->delivery_area), {{ $order->delivery_area }}@endif, {{ $order->delivery_city }}
            @if($order->delivery_date || $order->delivery_window_label)
                <span style="display:block;margin-top:8px;"><strong>Delivery slot:</strong>
                    {{ $order->delivery_date ? \Illuminate\Support\Carbon::parse($order->delivery_date)->format('D, d M Y') : '' }}{{ $order->delivery_date && $order->delivery_window_label ? ', ' : '' }}{{ $order->delivery_window_label }}
                </span>
            @endif
            @if($order->order_notes)
                <span style="display:block;margin-top:8px;"><strong>Notes:</strong> {{ $order->order_notes }}</span>
            @endif
        </td>
    </tr>
</table>

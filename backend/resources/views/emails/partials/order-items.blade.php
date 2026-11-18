@php $pkr = fn ($v) => 'PKR ' . number_format((float) $v, 0); @endphp
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0 0;border-collapse:collapse;font-size:14px;">
    <tr>
        <td style="padding:0 0 8px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#6b7d6a;border-bottom:1px solid #e3ebe2;">Item</td>
        <td align="right" style="padding:0 0 8px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#6b7d6a;border-bottom:1px solid #e3ebe2;">Amount</td>
    </tr>
    @foreach($order->items as $item)
        <tr>
            <td style="padding:10px 12px 10px 0;border-bottom:1px solid #eef3ed;vertical-align:top;">
                <strong style="color:#10240f;">{{ $item->product_name }}</strong><br>
                <span style="color:#6b7d6a;font-size:13px;">{{ $item->quantity }} × {{ $pkr($item->price) }}@if($item->unit) · {{ $item->unit }}@endif</span>
            </td>
            <td align="right" style="padding:10px 0;border-bottom:1px solid #eef3ed;vertical-align:top;white-space:nowrap;color:#10240f;">{{ $pkr($item->subtotal) }}</td>
        </tr>
    @endforeach
    <tr>
        <td style="padding:12px 12px 2px 0;color:#4b5b4a;">Subtotal</td>
        <td align="right" style="padding:12px 0 2px;color:#4b5b4a;white-space:nowrap;">{{ $pkr($order->subtotal) }}</td>
    </tr>
    <tr>
        <td style="padding:2px 12px 2px 0;color:#4b5b4a;">Delivery</td>
        <td align="right" style="padding:2px 0;color:#4b5b4a;white-space:nowrap;">{{ (float) $order->delivery_fee > 0 ? $pkr($order->delivery_fee) : 'Free' }}</td>
    </tr>
    @if((float) $order->discount > 0)
        <tr>
            <td style="padding:2px 12px 2px 0;color:#3a7538;">Discount</td>
            <td align="right" style="padding:2px 0;color:#3a7538;white-space:nowrap;">− {{ $pkr($order->discount) }}</td>
        </tr>
    @endif
    <tr>
        <td style="padding:10px 12px 0 0;font-size:16px;font-weight:800;color:#10240f;">Total{{ $order->payment_method === 'cod' ? ' (cash on delivery)' : '' }}</td>
        <td align="right" style="padding:10px 0 0;font-size:16px;font-weight:800;color:#10240f;white-space:nowrap;">{{ $pkr($order->total) }}</td>
    </tr>
</table>

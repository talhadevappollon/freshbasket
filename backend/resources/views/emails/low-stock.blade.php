@extends('emails.layout')

@section('preheader'){{ collect($products)->map(fn ($p) => $p['name'] . ': ' . $p['stock'] . ' left')->implode(' · ') }}@endsection

@section('body')
    <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#b20f0b;">Low stock</p>
    <h1 style="margin:0 0 10px;font-size:21px;line-height:1.3;color:#10240f;">{{ count($products) === 1 ? 'A product is running low' : count($products) . ' products are running low' }}</h1>
    <p style="margin:0;">{{ $orderNumber ? "Order $orderNumber" : 'A recent order' }} took {{ count($products) === 1 ? 'this product' : 'these products' }} down to the low-stock level set for {{ count($products) === 1 ? 'it' : 'them' }}.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0 0;border-collapse:collapse;font-size:14px;">
        <tr>
            <td style="padding:0 0 8px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#6b7d6a;border-bottom:1px solid #e3ebe2;">Product</td>
            <td align="right" style="padding:0 0 8px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#6b7d6a;border-bottom:1px solid #e3ebe2;">Left</td>
        </tr>
        @foreach($products as $p)
            <tr>
                <td style="padding:10px 12px 10px 0;border-bottom:1px solid #eef3ed;">
                    <strong style="color:#10240f;">{{ $p['name'] }}</strong>
                    <span style="display:block;color:#6b7d6a;font-size:13px;">{{ $p['sku'] ? 'SKU ' . $p['sku'] . ' · ' : '' }}alert at {{ $p['threshold'] }}</span>
                </td>
                <td align="right" style="padding:10px 0;border-bottom:1px solid #eef3ed;font-weight:800;color:{{ $p['stock'] <= 0 ? '#b20f0b' : '#10240f' }};white-space:nowrap;">{{ $p['stock'] <= 0 ? 'Sold out' : $p['stock'] }}</td>
            </tr>
        @endforeach
    </table>

    @include('emails.partials.button', ['href' => $adminUrl, 'label' => 'Open Products & Stock'])
@endsection

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Delivery Slip - {{ $order->order_number }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @media print {
            .no-print { display: none !important; }
            body { padding: 0; margin: 0; }
        }
    </style>
</head>
<body class="bg-gray-100 p-6 flex justify-center text-gray-900 font-sans">

    <div class="bg-white max-w-xl w-full p-8 rounded-2xl shadow-lg border border-gray-200">
        <!-- Print Trigger Bar -->
        <div class="no-print mb-6 flex justify-between items-center bg-emerald-50 p-4 rounded-xl border border-emerald-200">
            <span class="text-sm text-emerald-800 font-medium">Ready for thermal or A4 printing for delivery rider.</span>
            <button onclick="window.print()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold text-xs shadow">
                Print Packing Slip
            </button>
        </div>

        <!-- Header -->
        <div class="flex items-start justify-between border-b pb-6 border-gray-200">
            <div>
                <h1 class="text-2xl font-black text-emerald-800 tracking-tight">FRESH BASKET</h1>
                <p class="text-xs text-gray-500 font-medium">Fresh Grocery Delivery &bull; Karachi, Pakistan</p>
                <p class="text-xs text-gray-400">UAN: +92 21 111-373-742 &bull; support@freshbasket.com.pk</p>
            </div>
            <div class="text-right">
                <span class="inline-block bg-gray-900 text-white text-xs font-mono px-3 py-1 rounded-md font-bold">
                    {{ $order->order_number }}
                </span>
                <p class="text-xs text-gray-500 mt-1">{{ $order->created_at->format('d M Y, h:i A') }}</p>
            </div>
        </div>

        <!-- COD Highlight Notice -->
        <div class="my-6 p-4 rounded-xl border-2 border-dashed border-emerald-400 bg-emerald-50/50 flex items-center justify-between">
            <div>
                <p class="text-xs font-bold uppercase text-emerald-900 tracking-wide">Cash on Delivery (COD)</p>
                <p class="text-xs text-emerald-700">Rider must collect the exact total cash amount from customer:</p>
            </div>
            <div class="text-right">
                <span class="text-2xl font-black text-emerald-900">PKR {{ number_format($order->total, 0) }}</span>
            </div>
        </div>

        <!-- Delivery & Customer Info -->
        <div class="grid grid-cols-2 gap-4 text-xs pb-6 border-b border-gray-200">
            <div>
                <h3 class="font-bold text-gray-400 uppercase text-[10px] tracking-wider mb-1">Customer Details</h3>
                <p class="font-bold text-sm text-gray-900">{{ $order->customer_name }}</p>
                <p class="text-gray-700 font-medium mt-0.5">Phone: {{ $order->customer_phone }}</p>
                @if($order->customer_email)
                    <p class="text-gray-500">{{ $order->customer_email }}</p>
                @endif
            </div>

            <div>
                <h3 class="font-bold text-gray-400 uppercase text-[10px] tracking-wider mb-1">Delivery Address</h3>
                <p class="font-semibold text-gray-800">{{ $order->delivery_area ?? 'Karachi' }}, {{ $order->delivery_city }}</p>
                <p class="text-gray-600 mt-0.5 leading-relaxed">{{ $order->delivery_address }}</p>
                @if($order->order_notes)
                    <p class="mt-2 text-amber-900 font-medium bg-amber-50 p-1.5 rounded text-[11px]">
                        <strong>Rider Note:</strong> {{ $order->order_notes }}
                    </p>
                @endif
            </div>
        </div>

        <!-- Order Items -->
        <div class="py-6 border-b border-gray-200">
            <h3 class="font-bold text-gray-400 uppercase text-[10px] tracking-wider mb-3">Order Items ({{ $order->items->count() }})</h3>
            <table class="w-full text-xs text-left">
                <thead>
                    <tr class="text-gray-400 border-b border-gray-100 pb-2">
                        <th class="py-2">Item Description</th>
                        <th class="text-center">Qty</th>
                        <th class="text-right">Price</th>
                        <th class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    @foreach($order->items as $item)
                    <tr>
                        <td class="py-2.5 font-medium text-gray-800">
                            {{ $item->product_name }}
                            @if($item->unit)
                                <span class="text-gray-400 text-[10px]">({{ $item->unit }})</span>
                            @endif
                        </td>
                        <td class="text-center font-bold">{{ $item->quantity }}</td>
                        <td class="text-right text-gray-600">PKR {{ number_format($item->price, 0) }}</td>
                        <td class="text-right font-semibold text-gray-900">PKR {{ number_format($item->subtotal, 0) }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <!-- Summary Calculation -->
        <div class="py-4 space-y-1.5 text-xs text-gray-600">
            <div class="flex justify-between">
                <span>Items Subtotal:</span>
                <span class="font-medium text-gray-900">PKR {{ number_format($order->subtotal, 0) }}</span>
            </div>
            <div class="flex justify-between">
                <span>Delivery Charges:</span>
                <span class="font-medium text-gray-900">{{ $order->delivery_fee > 0 ? 'PKR ' . number_format($order->delivery_fee, 0) : 'FREE' }}</span>
            </div>
            @if($order->discount > 0)
            <div class="flex justify-between text-fresh-600">
                <span>Discount:</span>
                <span>- PKR {{ number_format($order->discount, 0) }}</span>
            </div>
            @endif
            <div class="flex justify-between pt-2 border-t border-gray-200 text-sm font-black text-gray-900">
                <span>Total Amount Due (COD):</span>
                <span class="text-emerald-800">PKR {{ number_format($order->total, 0) }}</span>
            </div>
        </div>

        <!-- Footer -->
        <div class="pt-6 border-t border-gray-200 text-center text-[10px] text-gray-400">
            <p>Thank you for shopping with Fresh Basket Pakistan!</p>
            <p class="mt-0.5">Please check all items upon delivery before the rider departs.</p>
        </div>
    </div>

</body>
</html>

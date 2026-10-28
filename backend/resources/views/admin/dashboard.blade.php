@extends('admin.layout')

@section('content')
<div class="space-y-8">
    <!-- KPI Header Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Sales -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gross Sales</p>
                <h3 class="text-2xl font-bold text-gray-900 mt-1">PKR {{ number_format($totalSales, 0) }}</h3>
                <span class="inline-flex items-center text-xs text-fresh-600 font-medium mt-1">
                    <i class="fa-solid fa-arrow-trend-up mr-1"></i> Online & Counter
                </span>
            </div>
            <div class="w-12 h-12 rounded-xl bg-fresh-50 text-fresh-600 flex items-center justify-center text-xl">
                <i class="fa-solid fa-money-bill-wave"></i>
            </div>
        </div>

        <!-- COD Cash Collected -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">COD Collected</p>
                <h3 class="text-2xl font-bold text-emerald-700 mt-1">PKR {{ number_format($codCollected, 0) }}</h3>
                <span class="inline-flex items-center text-xs text-gray-500 font-medium mt-1">
                    Delivered & settled
                </span>
            </div>
            <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
                <i class="fa-solid fa-hand-holding-dollar"></i>
            </div>
        </div>

        <!-- COD Cash Pending -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">COD In-Transit / Pending</p>
                <h3 class="text-2xl font-bold text-amber-600 mt-1">PKR {{ number_format($codPending, 0) }}</h3>
                <span class="inline-flex items-center text-xs text-amber-600 font-medium mt-1">
                    Rider collections pending
                </span>
            </div>
            <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
                <i class="fa-solid fa-motorcycle"></i>
            </div>
        </div>

        <!-- Low Stock Alert -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Low Stock Alerts</p>
                <h3 class="text-2xl font-bold {{ $lowStockCount > 0 ? 'text-rose-600' : 'text-gray-900' }} mt-1">{{ $lowStockCount }} Items</h3>
                <span class="inline-flex items-center text-xs text-rose-500 font-medium mt-1">
                    Requires Restocking
                </span>
            </div>
            <div class="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl">
                <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
        </div>
    </div>

    <!-- Active Orders & Low Stock Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Recent Orders (2 cols) -->
        <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                    <h3 class="font-bold text-gray-900 text-lg">Recent Customer Orders</h3>
                    <p class="text-xs text-gray-500">Live order fulfillment with Cash on Delivery</p>
                </div>
                <a href="{{ route('admin.orders') }}" class="text-fresh-600 hover:text-fresh-700 text-xs font-semibold">View All &rarr;</a>
            </div>

            <div class="overflow-x-auto mt-4">
                <table class="w-full text-left text-sm">
                    <thead>
                        <tr class="text-xs text-gray-400 uppercase border-b border-gray-100 pb-2">
                            <th class="py-3">Order #</th>
                            <th>Customer</th>
                            <th>Area</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>COD Payment</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        @forelse($recentOrders as $order)
                        <tr class="hover:bg-gray-50/60 transition">
                            <td class="py-3 font-semibold text-gray-900">
                                {{ $order->order_number }}
                            </td>
                            <td>
                                <div class="font-medium text-gray-800">{{ $order->customer_name }}</div>
                                <div class="text-xs text-gray-400">{{ $order->customer_phone }}</div>
                            </td>
                            <td class="text-xs text-gray-600">
                                {{ $order->delivery_area ?? 'Karachi' }}
                            </td>
                            <td class="text-xs text-gray-600">
                                {{ $order->items->count() }} items
                            </td>
                            <td class="font-semibold text-gray-900">
                                PKR {{ number_format($order->total, 0) }}
                            </td>
                            <td>
                                @if($order->payment_status === 'paid')
                                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-fresh-100 text-fresh-800">
                                        <i class="fa-solid fa-check mr-1"></i> Paid
                                    </span>
                                @else
                                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                        <i class="fa-solid fa-clock mr-1"></i> COD Cash
                                    </span>
                                @endif
                            </td>
                            <td>
                                <span class="capitalize text-xs font-medium px-2 py-0.5 rounded-full 
                                    @if($order->order_status == 'delivered') bg-emerald-100 text-emerald-800
                                    @elseif($order->order_status == 'dispatched') bg-blue-100 text-blue-800
                                    @elseif($order->order_status == 'processing') bg-purple-100 text-purple-800
                                    @elseif($order->order_status == 'cancelled') bg-rose-100 text-rose-800
                                    @else bg-yellow-100 text-yellow-800 @endif">
                                    {{ $order->order_status }}
                                </span>
                            </td>
                            <td>
                                <a href="{{ route('admin.print_order', $order->id) }}" target="_blank" class="text-xs text-gray-500 hover:text-fresh-600 p-1" title="Print Slip">
                                    <i class="fa-solid fa-print"></i>
                                </a>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="8" class="text-center py-6 text-gray-400 text-sm">No orders recorded yet.</td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Low Stock Items (1 col) -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
            <div>
                <div class="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div>
                        <h3 class="font-bold text-gray-900 text-lg">Inventory Warning</h3>
                        <p class="text-xs text-gray-500">Products at or below threshold</p>
                    </div>
                    <a href="{{ route('admin.products', ['low_stock' => 1]) }}" class="text-fresh-600 text-xs font-semibold">View All</a>
                </div>

                <div class="space-y-3 mt-4">
                    @forelse($lowStockProducts as $prod)
                    <div class="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div class="flex items-center space-x-3">
                            <img src="{{ $prod->primary_image ?: 'https://via.placeholder.com/60' }}" class="w-10 h-10 object-cover rounded-lg border border-gray-200">
                            <div>
                                <p class="text-xs font-semibold text-gray-800 line-clamp-1">{{ $prod->name }}</p>
                                <p class="text-xs text-gray-400">SKU: {{ $prod->sku }}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                                {{ $prod->stock_quantity }} left
                            </span>
                        </div>
                    </div>
                    @empty
                    <div class="p-4 rounded-xl bg-fresh-50 text-fresh-700 text-xs text-center">
                        <i class="fa-solid fa-circle-check text-lg mb-1 block"></i>
                        All products are well stocked!
                    </div>
                    @endforelse
                </div>
            </div>

            <!-- Future POS Quick Status -->
            <div class="mt-6 pt-4 border-t border-gray-100">
                <h4 class="text-xs font-bold uppercase text-gray-400 mb-2">POS Store Integration</h4>
                <div class="bg-emerald-950 text-white p-4 rounded-xl text-xs space-y-1">
                    <div class="flex justify-between">
                        <span class="text-emerald-300">Terminal API:</span>
                        <span class="font-mono text-fresh-400">/api/v1/pos/</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-emerald-300">Database Driver:</span>
                        <span class="text-white">MySQL (Port 3307)</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-emerald-300">Barcode Lookup:</span>
                        <span class="text-fresh-400 font-semibold">Enabled</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Customer Inquiries / CRM Leads -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
                <h3 class="font-bold text-gray-900 text-lg">Customer Support & Inquiries</h3>
                <p class="text-xs text-gray-500">Direct inquiries submitted by shoppers</p>
            </div>
            <a href="{{ route('admin.leads') }}" class="text-fresh-600 hover:text-fresh-700 text-xs font-semibold">Manage Leads &rarr;</a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            @forelse($recentLeads as $lead)
            <div class="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:border-gray-200 transition">
                <div class="flex items-center justify-between mb-2">
                    <span class="font-semibold text-sm text-gray-800">{{ $lead->name }}</span>
                    <span class="text-xs px-2 py-0.5 rounded-full {{ $lead->status == 'new' ? 'bg-amber-100 text-amber-800' : 'bg-fresh-100 text-fresh-800' }} capitalize">
                        {{ $lead->status }}
                    </span>
                </div>
                <p class="text-xs font-medium text-emerald-800 mb-1">{{ $lead->subject }}</p>
                <p class="text-xs text-gray-600 line-clamp-2 mb-3">{{ $lead->message }}</p>
                <div class="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-400">
                    <span><i class="fa-solid fa-phone mr-1"></i> {{ $lead->phone ?? 'N/A' }}</span>
                    <a href="https://wa.me/{{ preg_replace('/[^0-9]/', '', $lead->phone) }}" target="_blank" class="text-emerald-600 hover:text-emerald-700 font-semibold">
                        <i class="fa-brands fa-whatsapp text-sm"></i> WhatsApp
                    </a>
                </div>
            </div>
            @empty
            <div class="col-span-3 text-center py-6 text-gray-400 text-sm">No new inquiries at this moment.</div>
            @endforelse
        </div>
    </div>
</div>
@endsection

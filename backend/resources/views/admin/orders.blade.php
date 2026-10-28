@extends('admin.layout')

@section('content')
<div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-2xl font-bold text-gray-900">Orders & Cash on Delivery (COD) Control</h2>
            <p class="text-xs text-gray-500">Manage fulfillment, dispatch riders, and reconcile COD cash collections</p>
        </div>

        <!-- Search & Filter Form -->
        <form action="{{ route('admin.orders') }}" method="GET" class="flex flex-wrap items-center gap-2">
            <div class="relative">
                <input type="text" name="search" value="{{ request('search') }}" placeholder="Order #, Name, Phone..." class="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs w-60 focus:outline-none focus:border-fresh-500 bg-white">
                <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-gray-400 text-xs"></i>
            </div>

            <select name="status" onchange="this.form.submit()" class="px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-fresh-500 bg-white">
                <option value="all" {{ request('status') == 'all' ? 'selected' : '' }}>All Statuses</option>
                <option value="pending" {{ request('status') == 'pending' ? 'selected' : '' }}>Pending</option>
                <option value="processing" {{ request('status') == 'processing' ? 'selected' : '' }}>Processing</option>
                <option value="dispatched" {{ request('status') == 'dispatched' ? 'selected' : '' }}>Dispatched</option>
                <option value="delivered" {{ request('status') == 'delivered' ? 'selected' : '' }}>Delivered</option>
                <option value="cancelled" {{ request('status') == 'cancelled' ? 'selected' : '' }}>Cancelled</option>
            </select>

            <select name="payment" onchange="this.form.submit()" class="px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-fresh-500 bg-white">
                <option value="all" {{ request('payment') == 'all' ? 'selected' : '' }}>All Payment Statuses</option>
                <option value="unpaid" {{ request('payment') == 'unpaid' ? 'selected' : '' }}>Unpaid (COD Pending)</option>
                <option value="paid" {{ request('payment') == 'paid' ? 'selected' : '' }}>Paid (Cash Collected)</option>
            </select>
        </form>
    </div>

    <!-- Orders Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="bg-gray-50/75 border-b border-gray-100 text-xs text-gray-400 uppercase font-semibold">
                    <tr>
                        <th class="py-3.5 px-6">Order Details</th>
                        <th class="px-4">Customer & Phone</th>
                        <th class="px-4">Delivery Location</th>
                        <th class="px-4">Items Summary</th>
                        <th class="px-4">Amount</th>
                        <th class="px-4">COD Payment</th>
                        <th class="px-4">Order Status</th>
                        <th class="px-6 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    @forelse($orders as $order)
                    <tr class="hover:bg-gray-50/50 transition">
                        <td class="py-4 px-6">
                            <span class="font-bold text-gray-900 block">{{ $order->order_number }}</span>
                            <span class="text-xs text-gray-400">{{ $order->created_at->format('M d, Y h:i A') }}</span>
                            <span class="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-gray-100 text-gray-600">
                                {{ $order->order_source }}
                            </span>
                        </td>

                        <td class="px-4">
                            <div class="font-semibold text-gray-800">{{ $order->customer_name }}</div>
                            <div class="text-xs text-gray-500 flex items-center space-x-1 mt-0.5">
                                <i class="fa-solid fa-phone text-[10px]"></i>
                                <span>{{ $order->customer_phone }}</span>
                            </div>
                            <a href="https://wa.me/{{ preg_replace('/[^0-9]/', '', $order->customer_phone) }}" target="_blank" class="inline-flex items-center text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold mt-1">
                                <i class="fa-brands fa-whatsapp mr-1"></i> WhatsApp
                            </a>
                        </td>

                        <td class="px-4 max-w-xs">
                            <span class="font-medium text-xs text-gray-800 block">{{ $order->delivery_area ?? 'Karachi' }}, {{ $order->delivery_city }}</span>
                            <p class="text-xs text-gray-500 line-clamp-1 mt-0.5">{{ $order->delivery_address }}</p>
                            @if($order->order_notes)
                                <p class="text-[11px] text-amber-700 bg-amber-50 p-1 rounded mt-1 line-clamp-1">
                                    <i class="fa-solid fa-note-sticky mr-1"></i> {{ $order->order_notes }}
                                </p>
                            @endif
                        </td>

                        <td class="px-4">
                            <div class="text-xs text-gray-700 font-medium">
                                {{ $order->items->count() }} item(s)
                            </div>
                            <div class="text-[11px] text-gray-400 space-y-0.5 mt-0.5 max-w-[200px]">
                                @foreach($order->items->take(2) as $item)
                                    <div class="truncate">{{ $item->quantity }}x {{ $item->product_name }}</div>
                                @endforeach
                                @if($order->items->count() > 2)
                                    <span class="text-fresh-600 text-[10px]">+{{ $order->items->count() - 2 }} more</span>
                                @endif
                            </div>
                        </td>

                        <td class="px-4">
                            <span class="font-bold text-gray-900 block">PKR {{ number_format($order->total, 0) }}</span>
                            <span class="text-[10px] text-gray-400">Delivery: {{ $order->delivery_fee > 0 ? 'PKR ' . $order->delivery_fee : 'FREE' }}</span>
                        </td>

                        <!-- Payment Status Form -->
                        <td class="px-4">
                            <form action="{{ route('admin.orders.update_status', $order->id) }}" method="POST">
                                @csrf
                                <select name="payment_status" onchange="this.form.submit()" class="text-xs font-semibold px-2 py-1 rounded-lg border {{ $order->payment_status === 'paid' ? 'bg-fresh-50 text-fresh-800 border-fresh-200' : 'bg-amber-50 text-amber-800 border-amber-200' }}">
                                    <option value="unpaid" {{ $order->payment_status === 'unpaid' ? 'selected' : '' }}>COD Pending</option>
                                    <option value="paid" {{ $order->payment_status === 'paid' ? 'selected' : '' }}>Cash Collected</option>
                                    <option value="refunded" {{ $order->payment_status === 'refunded' ? 'selected' : '' }}>Refunded</option>
                                </select>
                            </form>
                        </td>

                        <!-- Order Status Form -->
                        <td class="px-4">
                            <form action="{{ route('admin.orders.update_status', $order->id) }}" method="POST">
                                @csrf
                                <select name="order_status" onchange="this.form.submit()" class="text-xs font-semibold px-2 py-1 rounded-lg border 
                                    @if($order->order_status == 'delivered') bg-emerald-50 text-emerald-800 border-emerald-200
                                    @elseif($order->order_status == 'dispatched') bg-blue-50 text-blue-800 border-blue-200
                                    @elseif($order->order_status == 'processing') bg-purple-50 text-purple-800 border-purple-200
                                    @elseif($order->order_status == 'cancelled') bg-rose-50 text-rose-800 border-rose-200
                                    @else bg-yellow-50 text-yellow-800 border-yellow-200 @endif">
                                    <option value="pending" {{ $order->order_status === 'pending' ? 'selected' : '' }}>Pending</option>
                                    <option value="processing" {{ $order->order_status === 'processing' ? 'selected' : '' }}>Processing</option>
                                    <option value="dispatched" {{ $order->order_status === 'dispatched' ? 'selected' : '' }}>Dispatched</option>
                                    <option value="delivered" {{ $order->order_status === 'delivered' ? 'selected' : '' }}>Delivered</option>
                                    <option value="cancelled" {{ $order->order_status === 'cancelled' ? 'selected' : '' }}>Cancelled</option>
                                </select>
                            </form>
                        </td>

                        <!-- Actions -->
                        <td class="px-6 text-right space-x-2">
                            <a href="{{ route('admin.print_order', $order->id) }}" target="_blank" class="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-fresh-50 hover:text-fresh-700 text-gray-700 text-xs font-semibold transition" title="Print Rider Packing Slip">
                                <i class="fa-solid fa-print mr-1"></i> Slip
                            </a>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="8" class="text-center py-10 text-gray-400 text-sm">
                            No orders found matching your search criteria.
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="p-4 border-t border-gray-100">
            {{ $orders->links() }}
        </div>
    </div>
</div>
@endsection

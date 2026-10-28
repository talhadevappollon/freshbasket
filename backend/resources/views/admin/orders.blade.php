@extends('admin.layout')

@section('content')
<div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header with Breadcrumb -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 class="text-2xl font-black text-gray-900 tracking-tight">Order Fulfillment & COD Reconciliation</h2>
            <p class="text-xs text-gray-500">Track shipments, dispatch Karachi riders, and reconcile Cash On Delivery collections</p>
        </div>

        <div class="flex items-center space-x-3">
            <a href="{{ route('admin.pos') }}" class="bg-emerald-950 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition">
                <i class="fa-solid fa-cash-register text-fresh-400"></i>
                <span>POS Cash Counter</span>
            </a>
        </div>
    </div>

    <!-- Status Tabs Strip -->
    <div class="flex items-center space-x-2 overflow-x-auto pb-1">
        <a href="{{ route('admin.orders') }}" class="px-4 py-2 rounded-xl text-xs font-bold transition {{ !request('status') || request('status') == 'all' ? 'bg-fresh-600 text-white shadow-md shadow-fresh-600/20' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50' }}">
            All Orders ({{ $orders->total() }})
        </a>
        <a href="{{ route('admin.orders', ['status' => 'pending']) }}" class="px-4 py-2 rounded-xl text-xs font-bold transition {{ request('status') == 'pending' ? 'bg-fresh-600 text-white shadow-md shadow-fresh-600/20' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50' }}">
            Pending ({{ $pendingCount }})
        </a>
        <a href="{{ route('admin.orders', ['status' => 'processing']) }}" class="px-4 py-2 rounded-xl text-xs font-bold transition {{ request('status') == 'processing' ? 'bg-fresh-600 text-white shadow-md shadow-fresh-600/20' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50' }}">
            Processing ({{ $processingCount }})
        </a>
        <a href="{{ route('admin.orders', ['status' => 'dispatched']) }}" class="px-4 py-2 rounded-xl text-xs font-bold transition {{ request('status') == 'dispatched' ? 'bg-fresh-600 text-white shadow-md shadow-fresh-600/20' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50' }}">
            Dispatched ({{ $dispatchedCount }})
        </a>
        <a href="{{ route('admin.orders', ['status' => 'delivered']) }}" class="px-4 py-2 rounded-xl text-xs font-bold transition {{ request('status') == 'delivered' ? 'bg-fresh-600 text-white shadow-md shadow-fresh-600/20' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50' }}">
            Delivered ({{ $deliveredCount }})
        </a>
    </div>

    <!-- Filter & Search Bar -->
    <div class="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <form action="{{ route('admin.orders') }}" method="GET" class="flex flex-wrap items-center gap-3">
            <div class="relative flex-1 min-w-[240px]">
                <input
                    type="text"
                    name="search"
                    value="{{ request('search') }}"
                    placeholder="Search Order #, Customer Name, Phone, DHA/Clifton area..."
                    class="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-fresh-500 focus:outline-none transition"
                />
                <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-gray-400 text-xs"></i>
            </div>

            <select name="payment" onchange="this.form.submit()" class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-fresh-500 focus:outline-none font-medium">
                <option value="all" {{ request('payment') == 'all' ? 'selected' : '' }}>All Payment Statuses</option>
                <option value="unpaid" {{ request('payment') == 'unpaid' ? 'selected' : '' }}>COD Pending</option>
                <option value="paid" {{ request('payment') == 'paid' ? 'selected' : '' }}>Cash Collected</option>
            </select>

            <button type="submit" class="bg-fresh-600 hover:bg-fresh-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition">
                Filter
            </button>
        </form>
    </div>

    <!-- Orders Table -->
    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="bg-gray-50/75 border-b border-gray-100 text-xs text-gray-400 uppercase font-semibold">
                    <tr>
                        <th class="py-4 px-6">Order ID & Date</th>
                        <th class="px-4">Customer Info</th>
                        <th class="px-4">Delivery Destination</th>
                        <th class="px-4">Items Summary</th>
                        <th class="px-4">Amount Due</th>
                        <th class="px-4">COD Status</th>
                        <th class="px-4">Fulfillment Workflow</th>
                        <th class="px-6 text-right">Packing Slip</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    @forelse($orders as $order)
                    <tr class="hover:bg-gray-50/50 transition">
                        <td class="py-4 px-6">
                            <span class="font-mono font-bold text-gray-900 block">{{ $order->order_number }}</span>
                            <span class="text-[11px] text-gray-400">{{ $order->created_at->format('M d, Y h:i A') }}</span>
                            <span class="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-gray-100 text-gray-600">
                                {{ $order->order_source }}
                            </span>
                        </td>

                        <td class="px-4">
                            <div class="font-bold text-gray-900">{{ $order->customer_name }}</div>
                            <div class="text-xs text-gray-500 font-mono">{{ $order->customer_phone }}</div>
                            <a href="https://wa.me/{{ preg_replace('/[^0-9]/', '', $order->customer_phone) }}" target="_blank" class="inline-flex items-center text-[11px] text-emerald-600 hover:text-emerald-700 font-bold mt-1">
                                <i class="fa-brands fa-whatsapp mr-1"></i> WhatsApp
                            </a>
                        </td>

                        <td class="px-4 max-w-xs">
                            <span class="font-bold text-xs text-gray-800 block">{{ $order->delivery_area ?? 'Karachi' }}</span>
                            <p class="text-xs text-gray-500 truncate mt-0.5">{{ $order->delivery_address }}</p>
                            @if($order->order_notes)
                                <p class="text-[11px] text-amber-800 bg-amber-50 p-1 rounded mt-1 truncate">
                                    <i class="fa-solid fa-note-sticky mr-1"></i> {{ $order->order_notes }}
                                </p>
                            @endif
                        </td>

                        <td class="px-4">
                            <div class="text-xs font-bold text-gray-800">{{ $order->items->count() }} line item(s)</div>
                            <div class="text-[11px] text-gray-400 space-y-0.5 mt-0.5 max-w-[180px]">
                                @foreach($order->items->take(2) as $it)
                                    <div class="truncate">{{ $it->quantity }}x {{ $it->product_name }}</div>
                                @endforeach
                                @if($order->items->count() > 2)
                                    <span class="text-fresh-600 text-[10px] font-semibold">+{{ $order->items->count() - 2 }} more</span>
                                @endif
                            </div>
                        </td>

                        <td class="px-4">
                            <span class="font-black text-gray-900 block">PKR {{ number_format($order->total, 0) }}</span>
                            <span class="text-[10px] text-gray-400 font-medium">Delivery: {{ $order->delivery_fee > 0 ? 'PKR ' . $order->delivery_fee : 'FREE' }}</span>
                        </td>

                        <!-- Payment Status Form -->
                        <td class="px-4">
                            <form action="{{ route('admin.orders.update_status', $order->id) }}" method="POST">
                                @csrf
                                <select name="payment_status" onchange="this.form.submit()" class="text-xs font-bold px-2.5 py-1 rounded-xl border cursor-pointer {{ $order->payment_status === 'paid' ? 'bg-fresh-50 text-fresh-800 border-fresh-200' : 'bg-amber-50 text-amber-800 border-amber-200' }}">
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
                                <select name="order_status" onchange="this.form.submit()" class="text-xs font-bold px-2.5 py-1 rounded-xl border cursor-pointer
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

                        <td class="px-6 text-right">
                            <a href="{{ route('admin.print_order', $order->id) }}" target="_blank" class="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold inline-flex items-center gap-1 transition" title="Print Rider Slip">
                                <i class="fa-solid fa-print"></i>
                                <span>Slip</span>
                            </a>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="8" class="text-center py-12 text-gray-400 text-xs">No orders match your filter criteria.</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="p-6 border-t border-gray-100">
            {{ $orders->links() }}
        </div>
    </div>
</div>
@endsection

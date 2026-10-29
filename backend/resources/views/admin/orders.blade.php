@extends('admin.layout')

@section('content')
<div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header with Breadcrumb & Export -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <div class="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-1">
                <span>Operations</span>
                <i class="fa-solid fa-chevron-right text-[10px]"></i>
                <span class="text-fresh-700">Orders & Fulfillment</span>
            </div>
            <h2 class="text-2xl font-black text-slate-900 tracking-tight">Order Fulfillment & COD Reconciliation</h2>
            <p class="text-xs text-slate-500">Track shipments, dispatch Karachi riders, and reconcile Cash On Delivery collections</p>
        </div>

        <div class="flex items-center space-x-3">
            <a href="{{ route('admin.orders.export_csv') }}" class="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-2 transition">
                <i class="fa-solid fa-file-csv text-emerald-600"></i>
                <span>Export Manifest (CSV)</span>
            </a>

            <a href="{{ route('admin.pos') }}" class="bg-slate-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition">
                <i class="fa-solid fa-cash-register text-amber-400"></i>
                <span>POS Cash Counter</span>
            </a>
        </div>
    </div>

    <!-- Status Tabs Strip -->
    <div class="flex items-center space-x-2 overflow-x-auto pb-1">
        <a href="{{ route('admin.orders') }}" class="px-4 py-2 rounded-xl text-xs font-bold transition {{ !request('status') || request('status') == 'all' ? 'bg-fresh-600 text-white shadow-md shadow-fresh-600/20' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50' }}">
            All Orders ({{ $orders->total() }})
        </a>
        <a href="{{ route('admin.orders', ['status' => 'pending']) }}" class="px-4 py-2 rounded-xl text-xs font-bold transition {{ request('status') == 'pending' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50' }}">
            Pending ({{ $pendingCount }})
        </a>
        <a href="{{ route('admin.orders', ['status' => 'processing']) }}" class="px-4 py-2 rounded-xl text-xs font-bold transition {{ request('status') == 'processing' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50' }}">
            Processing ({{ $processingCount }})
        </a>
        <a href="{{ route('admin.orders', ['status' => 'dispatched']) }}" class="px-4 py-2 rounded-xl text-xs font-bold transition {{ request('status') == 'dispatched' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50' }}">
            Dispatched ({{ $dispatchedCount }})
        </a>
        <a href="{{ route('admin.orders', ['status' => 'delivered']) }}" class="px-4 py-2 rounded-xl text-xs font-bold transition {{ request('status') == 'delivered' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50' }}">
            Delivered ({{ $deliveredCount }})
        </a>
    </div>

    <!-- Filter & Search Bar -->
    <div class="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <form action="{{ route('admin.orders') }}" method="GET" class="flex flex-wrap items-center gap-3">
            <div class="relative flex-1 min-w-[240px]">
                <input
                    type="text"
                    name="search"
                    value="{{ request('search') }}"
                    placeholder="Search Order #, Customer Name, Phone, DHA, Clifton..."
                    class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-fresh-500 focus:outline-none transition font-medium"
                />
                <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
            </div>

            <select name="payment" onchange="this.form.submit()" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-fresh-500 focus:outline-none font-bold text-slate-700">
                <option value="all" {{ request('payment') == 'all' ? 'selected' : '' }}>All Payment Statuses</option>
                <option value="unpaid" {{ request('payment') == 'unpaid' ? 'selected' : '' }}>COD Pending</option>
                <option value="paid" {{ request('payment') == 'paid' ? 'selected' : '' }}>Cash Collected</option>
            </select>

            <button type="submit" class="bg-fresh-600 hover:bg-fresh-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition">
                Filter
            </button>
        </form>
    </div>

    <!-- Bulk Actions Strip (Hidden by default, shown when checkboxes clicked) -->
    <div id="bulkActionsBar" class="hidden bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between animate-fade-in">
        <div class="flex items-center space-x-3 text-xs">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span class="font-bold"><span id="selectedCount">0</span> orders selected</span>
        </div>

        <form id="bulkForm" action="{{ route('admin.orders.bulk_status') }}" method="POST" class="flex items-center space-x-2">
            @csrf
            <div id="bulkHiddenInputs"></div>

            <button type="submit" name="new_status" value="dispatched" class="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition">
                <i class="fa-solid fa-truck mr-1"></i> Mark Dispatched
            </button>
            <button type="submit" name="new_status" value="delivered" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition">
                <i class="fa-solid fa-check mr-1"></i> Mark Delivered & Paid
            </button>
            <button type="button" onclick="clearSelectedOrders()" class="text-slate-400 hover:text-white text-xs px-2 py-1">
                Cancel
            </button>
        </form>
    </div>

    <!-- Orders Table -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="bg-slate-50/75 border-b border-slate-100 text-xs text-slate-400 uppercase font-semibold">
                    <tr>
                        <th class="py-4 px-4 w-10 text-center">
                            <input type="checkbox" id="selectAllCheckbox" onchange="toggleSelectAll(this)" class="rounded text-fresh-600">
                        </th>
                        <th class="py-4 px-4">Order ID & Date</th>
                        <th class="px-4">Customer Info</th>
                        <th class="px-4">Delivery Destination</th>
                        <th class="px-4">Items Summary</th>
                        <th class="px-4">Amount Due</th>
                        <th class="px-4">COD Status</th>
                        <th class="px-4">Fulfillment Status</th>
                        <th class="px-6 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @forelse($orders as $order)
                    <tr class="hover:bg-slate-50/70 transition cursor-pointer" onclick="handleRowClick(event, {{ $order->id }})">
                        <td class="py-4 px-4 text-center" onclick="event.stopPropagation()">
                            <input type="checkbox" class="order-select-checkbox rounded text-fresh-600" value="{{ $order->id }}" onchange="updateBulkBar()">
                        </td>

                        <td class="py-4 px-4">
                            <span class="font-mono font-bold text-slate-900 block">{{ $order->order_number }}</span>
                            <span class="text-[11px] text-slate-400">{{ $order->created_at->format('M d, Y h:i A') }}</span>
                            <span class="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold {{ $order->order_source === 'pos' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600' }}">
                                {{ $order->order_source }}
                            </span>
                        </td>

                        <td class="px-4" onclick="event.stopPropagation()">
                            <div class="font-bold text-slate-900">{{ $order->customer_name }}</div>
                            <div class="text-xs text-slate-500 font-mono">{{ $order->customer_phone }}</div>
                            @php
                                $cleanPhone = preg_replace('/[^0-9]/', '', $order->customer_phone);
                                $waText = urlencode("Assalam-o-Alaikum {$order->customer_name}! Your Fresh House order #{$order->order_number} (Amount: PKR " . number_format($order->total, 0) . ") status: " . strtoupper($order->order_status) . ". Thank you for shopping fresh!");
                            @endphp
                            <a href="https://wa.me/{{ $cleanPhone }}?text={{ $waText }}" target="_blank" class="inline-flex items-center text-[11px] text-emerald-600 hover:text-emerald-700 font-bold mt-1">
                                <i class="fa-brands fa-whatsapp mr-1 text-sm"></i> WhatsApp
                            </a>
                        </td>

                        <td class="px-4 max-w-xs">
                            <span class="font-bold text-xs text-slate-800 block">{{ $order->delivery_area ?? 'Karachi' }}</span>
                            <p class="text-xs text-slate-500 truncate mt-0.5">{{ $order->delivery_address }}</p>
                            @if($order->delivery_window)
                                <p class="inline-flex items-center gap-1 text-[11px] font-bold text-fresh-800 bg-fresh-50 border border-fresh-200 px-1.5 py-0.5 rounded mt-1">
                                    <i class="fa-solid fa-clock"></i>
                                    {{ $order->delivery_date ? $order->delivery_date->format('D, j M') : '' }} &middot; {{ $order->delivery_window_label }}
                                </p>
                            @endif
                            @if($order->order_notes)
                                <p class="text-[11px] text-amber-800 bg-amber-50 p-1 rounded mt-1 truncate">
                                    <i class="fa-solid fa-note-sticky mr-1"></i> {{ $order->order_notes }}
                                </p>
                            @endif
                        </td>

                        <td class="px-4">
                            <div class="text-xs font-bold text-slate-800">{{ $order->items->count() }} line item(s)</div>
                            <div class="text-[11px] text-slate-400 space-y-0.5 mt-0.5 max-w-[180px]">
                                @foreach($order->items->take(2) as $it)
                                    <div class="truncate">{{ $it->quantity }}x {{ $it->product_name }}</div>
                                @endforeach
                                @if($order->items->count() > 2)
                                    <span class="text-fresh-600 text-[10px] font-bold">+{{ $order->items->count() - 2 }} more</span>
                                @endif
                            </div>
                        </td>

                        <td class="px-4">
                            <span class="font-black text-slate-900 block">PKR {{ number_format($order->total, 0) }}</span>
                            <span class="text-[10px] text-slate-400 font-medium">Delivery: {{ $order->delivery_fee > 0 ? 'PKR ' . $order->delivery_fee : 'FREE' }}</span>
                        </td>

                        <!-- Payment Status Form -->
                        <td class="px-4" onclick="event.stopPropagation()">
                            <form action="{{ route('admin.orders.update_status', $order->id) }}" method="POST">
                                @csrf
                                <select name="payment_status" onchange="this.form.submit()" class="text-xs font-bold px-2.5 py-1 rounded-xl border cursor-pointer {{ $order->payment_status === 'paid' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200' }}">
                                    <option value="unpaid" {{ $order->payment_status === 'unpaid' ? 'selected' : '' }}>COD Pending</option>
                                    <option value="paid" {{ $order->payment_status === 'paid' ? 'selected' : '' }}>Cash Collected</option>
                                    <option value="refunded" {{ $order->payment_status === 'refunded' ? 'selected' : '' }}>Refunded</option>
                                </select>
                            </form>
                        </td>

                        <!-- Order Status Form -->
                        <td class="px-4" onclick="event.stopPropagation()">
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

                        <td class="px-6 text-right space-x-2" onclick="event.stopPropagation()">
                            <button onclick="openOrderDetailDrawer({{ $order->toJson() }})" class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition" title="Inspect Order Details">
                                <i class="fa-solid fa-eye"></i>
                            </button>
                            <a href="{{ route('admin.print_order', $order->id) }}" target="_blank" class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs inline-block transition" title="Print Rider Slip">
                                <i class="fa-solid fa-print"></i>
                            </a>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="9" class="text-center py-12 text-slate-400 text-xs">No orders match your filter criteria.</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="p-6 border-t border-slate-100">
            {{ $orders->links() }}
        </div>
    </div>
</div>

<!-- Order Detail Slide-Over Drawer -->
<div id="orderDrawer" class="fixed inset-0 bg-black/50 backdrop-blur-xs hidden z-50 justify-end transition-opacity">
    <div class="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col overflow-hidden animate-slide-left">
        <!-- Header -->
        <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div>
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Details</span>
                <h3 class="text-lg font-black text-slate-900" id="drawerOrderNumber">FB-ORD-000000</h3>
            </div>
            <button onclick="closeOrderDetailDrawer()" class="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 flex items-center justify-center">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6" id="drawerContent">
            <!-- Customer Card -->
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-500 uppercase">Customer</span>
                    <span id="drawerOrderDate" class="text-[11px] text-slate-400 font-mono">Date</span>
                </div>
                <h4 id="drawerCustomerName" class="text-base font-black text-slate-900">Name</h4>
                <div class="flex items-center justify-between">
                    <span id="drawerCustomerPhone" class="text-xs font-mono text-slate-600">Phone</span>
                    <a id="drawerWhatsAppBtn" href="#" target="_blank" class="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition">
                        <i class="fa-brands fa-whatsapp"></i>
                        <span>WhatsApp Customer</span>
                    </a>
                </div>
                <div class="pt-2 border-t border-slate-200 text-xs text-slate-600">
                    <strong>Delivery Address:</strong>
                    <p id="drawerDeliveryAddress" class="mt-0.5 text-slate-700"></p>
                </div>
            </div>

            <!-- Items Breakdown Table -->
            <div>
                <h4 class="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Order Items Breakdown</h4>
                <div class="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden" id="drawerItemsList">
                    <!-- Injected via JS -->
                </div>
            </div>

            <!-- Financial Summary -->
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div class="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span id="drawerSubtotal" class="font-bold">PKR 0</span>
                </div>
                <div class="flex justify-between text-slate-600">
                    <span>Delivery Fee</span>
                    <span id="drawerDeliveryFee" class="font-bold">PKR 0</span>
                </div>
                <div class="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total Cash to Collect (COD)</span>
                    <span id="drawerTotal" class="text-emerald-800 font-black">PKR 0</span>
                </div>
            </div>
        </div>

        <!-- Footer Actions -->
        <div class="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <a id="drawerPrintBtn" href="#" target="_blank" class="bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition">
                <i class="fa-solid fa-print"></i>
                <span>Print Packing Slip</span>
            </a>

            <button onclick="closeOrderDetailDrawer()" class="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold transition">
                Close Drawer
            </button>
        </div>
    </div>
</div>

<script>
    function handleRowClick(event, orderId) {
        // Handled via openOrderDetailDrawer on the action button
    }

    function toggleSelectAll(master) {
        document.querySelectorAll('.order-select-checkbox').forEach(cb => {
            cb.checked = master.checked;
        });
        updateBulkBar();
    }

    function updateBulkBar() {
        const selected = Array.from(document.querySelectorAll('.order-select-checkbox:checked')).map(cb => cb.value);
        const countSpan = document.getElementById('selectedCount');
        const bulkBar = document.getElementById('bulkActionsBar');
        const hiddenInputs = document.getElementById('bulkHiddenInputs');

        countSpan.innerText = selected.length;
        if (selected.length > 0) {
            bulkBar.classList.remove('hidden');
            let inputsHtml = '';
            selected.forEach(id => {
                inputsHtml += `<input type="hidden" name="order_ids[]" value="${id}">`;
            });
            hiddenInputs.innerHTML = inputsHtml;
        } else {
            bulkBar.classList.add('hidden');
            hiddenInputs.innerHTML = '';
        }
    }

    function clearSelectedOrders() {
        document.querySelectorAll('.order-select-checkbox').forEach(cb => cb.checked = false);
        const master = document.getElementById('selectAllCheckbox');
        if (master) master.checked = false;
        updateBulkBar();
    }

    function openOrderDetailDrawer(order) {
        document.getElementById('drawerOrderNumber').innerText = '#' + order.order_number;
        document.getElementById('drawerOrderDate').innerText = new Date(order.created_at).toLocaleString();
        document.getElementById('drawerCustomerName').innerText = order.customer_name;
        document.getElementById('drawerCustomerPhone').innerText = order.customer_phone;
        document.getElementById('drawerDeliveryAddress').innerText = (order.delivery_area ? order.delivery_area + ' — ' : '') + order.delivery_address;
        
        const cleanPhone = (order.customer_phone || '').replace(/[^0-9]/g, '');
        const waMsg = encodeURIComponent(`Assalam-o-Alaikum ${order.customer_name}! Your Fresh House order #${order.order_number} (PKR ${Number(order.total).toLocaleString()}) is currently: ${order.order_status.toUpperCase()}. Our team is actively packing it.`);
        document.getElementById('drawerWhatsAppBtn').href = `https://wa.me/${cleanPhone}?text=${waMsg}`;
        document.getElementById('drawerPrintBtn').href = `/admin/orders/${order.id}/print`;

        document.getElementById('drawerSubtotal').innerText = 'PKR ' + Number(order.subtotal).toLocaleString();
        document.getElementById('drawerDeliveryFee').innerText = order.delivery_fee > 0 ? 'PKR ' + Number(order.delivery_fee).toLocaleString() : 'FREE';
        document.getElementById('drawerTotal').innerText = 'PKR ' + Number(order.total).toLocaleString();

        const itemsContainer = document.getElementById('drawerItemsList');
        let html = '';
        if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
                html += `
                    <div class="p-3 bg-white flex items-center justify-between text-xs">
                        <div class="flex items-center space-x-3">
                            <span class="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-800 font-black flex items-center justify-center text-[11px]">${item.quantity}x</span>
                            <div>
                                <h5 class="font-bold text-slate-900">${item.product_name}</h5>
                                <span class="text-[11px] text-slate-400">PKR ${Number(item.price).toLocaleString()} each</span>
                            </div>
                        </div>
                        <span class="font-black text-slate-900">PKR ${Number(item.subtotal).toLocaleString()}</span>
                    </div>
                `;
            });
        } else {
            html = '<div class="p-4 text-center text-slate-400 text-xs">No item records attached.</div>';
        }
        itemsContainer.innerHTML = html;

        const drawer = document.getElementById('orderDrawer');
        drawer.classList.remove('hidden');
        drawer.classList.add('flex');
    }

    function closeOrderDetailDrawer() {
        const drawer = document.getElementById('orderDrawer');
        drawer.classList.add('hidden');
        drawer.classList.remove('flex');
    }
</script>
@endsection
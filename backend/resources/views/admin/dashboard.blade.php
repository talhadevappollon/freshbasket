@extends('admin.layout')

@section('content')
<div class="space-y-8 max-w-7xl mx-auto">
    <!-- Top Welcome & Highlights -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-emerald-900 to-fresh-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div class="relative z-10 max-w-xl">
            <div class="inline-flex items-center space-x-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
                <i class="fa-solid fa-sparkles text-fresh-400"></i>
                <span>Executive Operations Console</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                Welcome to Fresh Basket Karachi Command
            </h1>
            <p class="text-xs sm:text-sm text-emerald-200/80 mt-1.5 leading-relaxed">
                Centralized dashboard managing 745+ live grocery catalog items, Cash on Delivery logistics, rider dispatches, and POS sync.
            </p>
        </div>

        <div class="relative z-10 flex flex-wrap items-center gap-3">
            <a href="{{ route('admin.orders') }}" class="bg-fresh-600 hover:bg-fresh-700 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-lg shadow-fresh-600/30 flex items-center space-x-2 transition">
                <i class="fa-solid fa-truck-fast"></i>
                <span>Manage Deliveries ({{ $pendingOrders }} Pending)</span>
            </a>
            <a href="{{ route('admin.pos') }}" class="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-3 rounded-2xl text-xs font-bold backdrop-blur-md flex items-center space-x-2 transition">
                <i class="fa-solid fa-barcode text-fresh-400"></i>
                <span>Open POS Terminal</span>
            </a>
        </div>
    </div>

    <!-- 4 High-Impact KPI Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Gross Sales -->
        <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Gross Sales</span>
                <div class="w-10 h-10 rounded-2xl bg-fresh-50 text-fresh-600 flex items-center justify-center text-lg">
                    <i class="fa-solid fa-money-bill-trend-up"></i>
                </div>
            </div>
            <h3 class="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
                PKR {{ number_format($totalSales, 0) }}
            </h3>
            <div class="flex items-center space-x-1.5 text-xs text-fresh-700 font-bold mt-2">
                <i class="fa-solid fa-arrow-up"></i>
                <span>Online + Store POS Combined</span>
            </div>
        </div>

        <!-- COD Collections (Collected vs Pending) -->
        <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">COD Collected</span>
                <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg">
                    <i class="fa-solid fa-hand-holding-dollar"></i>
                </div>
            </div>
            <h3 class="text-2xl sm:text-3xl font-black text-emerald-800 mt-2">
                PKR {{ number_format($codCollected, 0) }}
            </h3>
            <div class="text-xs text-amber-700 font-bold mt-2 flex items-center gap-1">
                <i class="fa-solid fa-clock"></i>
                <span>PKR {{ number_format($codPending, 0) }} pending in-transit</span>
            </div>
        </div>

        <!-- Order Volume & Dispatch -->
        <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Orders</span>
                <div class="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                    <i class="fa-solid fa-box"></i>
                </div>
            </div>
            <h3 class="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
                {{ $totalOrders }} Orders
            </h3>
            <div class="text-xs text-gray-500 font-semibold mt-2">
                <span class="text-fresh-600 font-bold">{{ $deliveredOrders }} Delivered</span> &bull; {{ $pendingOrders }} Pending
            </div>
        </div>

        <!-- Inventory Alerts -->
        <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Inventory Health</span>
                <div class="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg">
                    <i class="fa-solid fa-boxes-packing"></i>
                </div>
            </div>
            <h3 class="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
                {{ $totalProducts }} SKUs
            </h3>
            <div class="text-xs font-bold mt-2 {{ $lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-700' }}">
                @if($lowStockCount > 0)
                    <i class="fa-solid fa-triangle-exclamation mr-1"></i> {{ $lowStockCount }} items below threshold
                @else
                    <i class="fa-solid fa-circle-check mr-1"></i> All stock levels optimal
                @endif
            </div>
        </div>
    </div>

    <!-- Charts Section: Revenue Analytics & Order Doughnut -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Sales Velocity Line Chart (2 Cols) -->
        <div class="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-sm">
            <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <div>
                    <h3 class="font-black text-gray-900 text-lg">Weekly Sales Revenue Analytics</h3>
                    <p class="text-xs text-gray-400">Daily gross revenue in Pakistani Rupees (PKR)</p>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="w-3 h-3 rounded-full bg-fresh-500 inline-block"></span>
                    <span class="text-xs font-bold text-gray-700">Gross Sales</span>
                </div>
            </div>
            <div class="h-64">
                <canvas id="salesTrendChart"></canvas>
            </div>
        </div>

        <!-- Order Fulfillment Status Doughnut (1 Col) -->
        <div class="bg-white p-6 sm:p-7 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
                <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                    <div>
                        <h3 class="font-black text-gray-900 text-lg">Order Status Distribution</h3>
                        <p class="text-xs text-gray-400">Real-time fulfillment breakdown</p>
                    </div>
                </div>
                <div class="h-52 relative flex items-center justify-center">
                    <canvas id="orderStatusChart"></canvas>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs pt-4 border-t border-gray-100 mt-4">
                <div class="flex items-center space-x-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span class="text-gray-600 font-medium">Pending: <strong>{{ $pendingOrders }}</strong></span>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    <span class="text-gray-600 font-medium">Processing: <strong>{{ $processingOrders }}</strong></span>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span class="text-gray-600 font-medium">Dispatched: <strong>{{ $dispatchedOrders }}</strong></span>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span class="text-gray-600 font-medium">Delivered: <strong>{{ $deliveredOrders }}</strong></span>
                </div>
            </div>
        </div>
    </div>

    <!-- Active Orders Management Table -->
    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
                <h3 class="font-black text-gray-900 text-lg">Live Order Fulfillment & Cash Settlement</h3>
                <p class="text-xs text-gray-500">Fulfill orders, dispatch delivery riders, and reconcile Cash On Delivery (COD)</p>
            </div>
            <a href="{{ route('admin.orders') }}" class="text-xs font-bold text-fresh-700 hover:text-fresh-800 bg-fresh-50 px-4 py-2 rounded-xl border border-fresh-200 transition">
                View All Orders &rarr;
            </a>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="bg-gray-50/75 border-b border-gray-100 text-xs text-gray-400 uppercase font-semibold">
                    <tr>
                        <th class="py-3 px-6">Order ID & Date</th>
                        <th class="px-4">Customer</th>
                        <th class="px-4">Location</th>
                        <th class="px-4">Amount</th>
                        <th class="px-4">COD Payment</th>
                        <th class="px-4">Fulfillment Status</th>
                        <th class="px-6 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    @forelse($recentOrders as $order)
                    <tr class="hover:bg-gray-50/50 transition">
                        <td class="py-4 px-6">
                            <span class="font-mono font-bold text-gray-900 block">{{ $order->order_number }}</span>
                            <span class="text-[11px] text-gray-400">{{ $order->created_at->format('d M Y, h:i A') }}</span>
                            <span class="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-gray-100 text-gray-600">
                                {{ $order->order_source }}
                            </span>
                        </td>

                        <td class="px-4">
                            <div class="font-bold text-gray-800">{{ $order->customer_name }}</div>
                            <div class="text-xs text-gray-500 font-mono">{{ $order->customer_phone }}</div>
                            <a href="https://wa.me/{{ preg_replace('/[^0-9]/', '', $order->customer_phone) }}" target="_blank" class="inline-flex items-center text-[11px] text-emerald-600 hover:text-emerald-700 font-bold mt-1">
                                <i class="fa-brands fa-whatsapp mr-1"></i> WhatsApp
                            </a>
                        </td>

                        <td class="px-4 max-w-xs">
                            <span class="font-bold text-xs text-gray-800 block">{{ $order->delivery_area ?? 'Karachi' }}</span>
                            <p class="text-xs text-gray-500 truncate">{{ $order->delivery_address }}</p>
                        </td>

                        <td class="px-4 font-black text-gray-900">
                            PKR {{ number_format($order->total, 0) }}
                        </td>

                        <!-- Payment Status Form -->
                        <td class="px-4">
                            <form action="{{ route('admin.orders.update_status', $order->id) }}" method="POST">
                                @csrf
                                <select name="payment_status" onchange="this.form.submit()" class="text-xs font-bold px-2.5 py-1 rounded-xl border cursor-pointer {{ $order->payment_status === 'paid' ? 'bg-fresh-50 text-fresh-800 border-fresh-200' : 'bg-amber-50 text-amber-800 border-amber-200' }}">
                                    <option value="unpaid" {{ $order->payment_status === 'unpaid' ? 'selected' : '' }}>COD Pending</option>
                                    <option value="paid" {{ $order->payment_status === 'paid' ? 'selected' : '' }}>Cash Collected</option>
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
                        <td colspan="7" class="text-center py-8 text-gray-400 text-xs">No active orders yet.</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    <!-- Low Stock Inventory Matrix & Customer Leads -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Low Stock Fast Restock -->
        <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <div>
                    <h3 class="font-black text-gray-900 text-lg">Low Stock Replenishment</h3>
                    <p class="text-xs text-gray-400">Items below threshold requiring immediate supplier restock</p>
                </div>
                <a href="{{ route('admin.products', ['low_stock' => 1]) }}" class="text-xs font-bold text-fresh-700 hover:underline">
                    View Catalog
                </a>
            </div>

            <div class="space-y-3">
                @forelse($lowStockProducts as $prod)
                <div class="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between gap-3">
                    <div class="flex items-center space-x-3 overflow-hidden">
                        <img src="{{ $prod->primary_image ?: 'https://via.placeholder.com/60' }}" class="w-11 h-11 object-contain rounded-xl border border-gray-200 bg-white p-1 shrink-0">
                        <div class="overflow-hidden">
                            <h4 class="text-xs font-bold text-gray-900 truncate">{{ $prod->name }}</h4>
                            <p class="text-[10px] text-gray-400 font-mono">SKU: {{ $prod->sku }} &bull; Barcode: {{ $prod->barcode }}</p>
                        </div>
                    </div>

                    <div class="flex items-center space-x-2 shrink-0">
                        <span class="text-xs font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                            {{ $prod->stock_quantity }} left
                        </span>
                        <form action="{{ route('admin.products.adjust_stock', $prod->id) }}" method="POST">
                            @csrf
                            <input type="hidden" name="change_qty" value="25">
                            <input type="hidden" name="reason" value="restock">
                            <button type="submit" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition" title="Add 25 units">
                                +25
                            </button>
                        </form>
                    </div>
                </div>
                @empty
                <div class="text-center py-8 text-gray-400 text-xs">All products are adequately stocked.</div>
                @endforelse
            </div>
        </div>

        <!-- Recent Customer Support Tickets -->
        <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <div>
                    <h3 class="font-black text-gray-900 text-lg">Inquiries & Bulk Orders</h3>
                    <p class="text-xs text-gray-400">Incoming inquiries and corporate fruit basket requests</p>
                </div>
                <a href="{{ route('admin.leads') }}" class="text-xs font-bold text-fresh-700 hover:underline">
                    Manage All
                </a>
            </div>

            <div class="space-y-3">
                @forelse($recentLeads as $lead)
                <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div class="flex items-center justify-between mb-1">
                        <span class="font-bold text-xs text-gray-900">{{ $lead->name }}</span>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full {{ $lead->status == 'new' ? 'bg-amber-100 text-amber-800' : 'bg-fresh-100 text-fresh-800' }} uppercase">
                            {{ $lead->status }}
                        </span>
                    </div>
                    <p class="text-xs font-bold text-emerald-800 mb-1">{{ $lead->subject }}</p>
                    <p class="text-xs text-gray-600 line-clamp-2">{{ $lead->message }}</p>
                    <div class="mt-3 pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px]">
                        <span class="text-gray-400 font-mono">{{ $lead->phone }}</span>
                        @if($lead->phone)
                        <a href="https://wa.me/{{ preg_replace('/[^0-9]/', '', $lead->phone) }}" target="_blank" class="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1">
                            <i class="fa-brands fa-whatsapp text-sm"></i> WhatsApp Reply
                        </a>
                        @endif
                    </div>
                </div>
                @empty
                <div class="text-center py-8 text-gray-400 text-xs">No pending customer tickets.</div>
                @endforelse
            </div>
        </div>
    </div>
</div>

<!-- Chart.js Scripts -->
<script>
    document.addEventListener('DOMContentLoaded', function () {
        // Sales Trend Line Chart
        const ctxSales = document.getElementById('salesTrendChart').getContext('2d');
        const salesGradient = ctxSales.createLinearGradient(0, 0, 0, 250);
        salesGradient.addColorStop(0, 'rgba(34, 197, 94, 0.4)');
        salesGradient.addColorStop(1, 'rgba(34, 197, 94, 0.0)');

        new Chart(ctxSales, {
            type: 'line',
            data: {
                labels: {!! json_encode($salesChartLabels) !!},
                datasets: [{
                    label: 'Gross Revenue (PKR)',
                    data: {!! json_encode($salesChartValues) !!},
                    borderColor: '#16a34a',
                    borderWidth: 3,
                    backgroundColor: salesGradient,
                    fill: true,
                    tension: 0.35,
                    pointBackgroundColor: '#15803d',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f1f5f9' },
                        ticks: {
                            callback: function(val) { return 'PKR ' + val.toLocaleString(); },
                            font: { size: 10 }
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 10 } }
                    }
                }
            }
        });

        // Order Status Doughnut Chart
        const ctxStatus = document.getElementById('orderStatusChart').getContext('2d');
        new Chart(ctxStatus, {
            type: 'doughnut',
            data: {
                labels: ['Pending', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'],
                datasets: [{
                    data: [
                        {{ $pendingOrders }},
                        {{ $processingOrders }},
                        {{ $dispatchedOrders }},
                        {{ $deliveredOrders }},
                        {{ $cancelledOrders }}
                    ],
                    backgroundColor: ['#f59e0b', '#a855f7', '#3b82f6', '#10b981', '#f43f5e'],
                    borderWidth: 2,
                    borderColor: '#ffffff',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                cutout: '72%'
            }
        });
    });
</script>
@endsection

@extends('admin.layout')

@section('content')
<div class="space-y-8 max-w-7xl mx-auto">
    <!-- Top Welcome & Highlights -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-fresh-950 via-fresh-900 to-fresh-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-800/40">
        <div class="relative z-10 max-w-xl">
            <div class="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3 border border-white/10">
                <i class="fa-solid fa-wand-magic-sparkles text-fresh-400"></i>
                <span>Fresh House Executive Operations Hub</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                Karachi Central Warehouse{{ config('features.pos') ? ' & POS' : '' }} Command
            </h1>
            <p class="text-xs sm:text-sm text-emerald-100/80 mt-2 leading-relaxed">
                Centralized ERP controlling 745+ grocery items, Cash on Delivery logistics, rider dispatches, customer loyalty{{ config('features.pos') ? ', and real-time physical store POS counter' : '' }}.
            </p>
        </div>

        <div class="relative z-10 flex flex-wrap items-center gap-3">
            <a href="{{ route('admin.orders') }}" class="bg-fresh-500 hover:bg-fresh-600 text-white px-5 py-3 rounded-2xl text-xs font-black shadow-lg shadow-fresh-600/30 flex items-center space-x-2 transition transform hover:-translate-y-0.5">
                <i class="fa-solid fa-truck-fast"></i>
                <span>Deliveries ({{ $pendingOrders }} Pending)</span>
            </a>
@if(config('features.pos'))
            <a href="{{ route('admin.pos') }}" class="bg-amber-400 hover:bg-amber-500 text-slate-950 px-5 py-3 rounded-2xl text-xs font-black shadow-lg shadow-amber-400/20 flex items-center space-x-2 transition transform hover:-translate-y-0.5">
                <i class="fa-solid fa-cash-register"></i>
                <span>Open POS Terminal</span>
            </a>
@endif
            <a href="{{ route('admin.products.barcode_sheet') }}" target="_blank" class="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-3 rounded-2xl text-xs font-bold backdrop-blur-md flex items-center space-x-2 transition">
                <i class="fa-solid fa-barcode text-fresh-300"></i>
                <span class="hidden sm:inline">Shelf Labels</span>
            </a>
        </div>
    </div>

    <!-- 6 KPI Metrics Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <!-- Gross Sales -->
        <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition lg:col-span-2">
            <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Sales Revenue</span>
                <div class="w-10 h-10 rounded-2xl bg-fresh-50 text-fresh-600 flex items-center justify-center text-lg">
                    <i class="fa-solid fa-chart-line"></i>
                </div>
            </div>
            <h3 class="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                PKR {{ number_format($totalSales, 0) }}
            </h3>
            <div class="flex items-center space-x-1.5 text-xs text-fresh-700 font-bold mt-2">
                <i class="fa-solid fa-circle-check text-fresh-500"></i>
                <span>{{ config('features.pos') ? 'Combined Store POS + Online Orders' : 'All online orders' }}</span>
            </div>
        </div>

        <!-- COD Collections (Collected vs Pending) -->
        <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition lg:col-span-2">
            <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">COD Cash Flow</span>
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

        <!-- Average Order Value (AOV) -->
        <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Order Value</span>
                <div class="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-base">
                    <i class="fa-solid fa-receipt"></i>
                </div>
            </div>
            @php
                $aov = $totalOrders > 0 ? round($totalSales / $totalOrders) : 0;
            @endphp
            <h3 class="text-xl font-black text-slate-900 mt-2">
                PKR {{ number_format($aov, 0) }}
            </h3>
            <div class="text-[11px] text-slate-500 font-semibold mt-1">Per transaction</div>
        </div>

        <!-- Inventory Alerts -->
        <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Health</span>
                <div class="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-base">
                    <i class="fa-solid fa-boxes-packing"></i>
                </div>
            </div>
            <h3 class="text-xl font-black text-slate-900 mt-2">
                {{ $totalProducts }} SKUs
            </h3>
            <div class="text-[11px] font-bold mt-1 {{ $lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-700' }}">
                @if($lowStockCount > 0)
                    <i class="fa-solid fa-triangle-exclamation mr-0.5"></i> {{ $lowStockCount }} Low stock
                @else
                    <i class="fa-solid fa-circle-check mr-0.5"></i> Optimal
                @endif
            </div>
        </div>
    </div>

    @if(config('features.pos'))
    <!-- Quick Barcode Instant Lookup / Restock Box -->
    <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 text-lg">
                    <i class="fa-solid fa-barcode text-fresh-600"></i>
                </div>
                <div>
                    <h3 class="font-black text-slate-900 text-sm">Quick Barcode Scanner & Shelf Auditor</h3>
                    <p class="text-xs text-slate-400">Scan physical product barcode or type SKU to instantly verify live stock and price</p>
                </div>
            </div>

            <div class="flex items-center space-x-2 flex-1 max-w-md">
                <div class="relative flex-1">
                    <input
                        type="text"
                        id="dashboardBarcodeInput"
                        placeholder="Scan or enter barcode (e.g. 896400...)"
                        class="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:bg-white focus:border-fresh-500 focus:outline-none transition"
                        onkeydown="if(event.key === 'Enter') checkBarcodeOnDashboard()"
                    />
                    <i class="fa-solid fa-barcode absolute left-3 top-3 text-slate-400 text-xs"></i>
                </div>
                <button
                    onclick="checkBarcodeOnDashboard()"
                    class="bg-slate-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0"
                >
                    Check Item
                </button>
            </div>
        </div>

        <div id="barcodeAuditResult" class="hidden mt-4 pt-4 border-t border-slate-100"></div>
    </div>
    @endif

    <!-- Charts Section: Revenue Analytics & Order Doughnut -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Sales Velocity Line Chart (2 Cols) -->
        <div class="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                    <h3 class="font-black text-slate-900 text-lg">Weekly Sales Revenue Analytics</h3>
                    <p class="text-xs text-slate-400">Daily gross revenue in Pakistani Rupees (PKR)</p>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="w-3 h-3 rounded-full bg-fresh-500 inline-block"></span>
                    <span class="text-xs font-bold text-slate-700">Gross Sales (PKR)</span>
                </div>
            </div>
            <div class="h-64">
                <canvas id="salesTrendChart"></canvas>
            </div>
        </div>

        <!-- Order Fulfillment Status Doughnut (1 Col) -->
        <div class="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
                <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                    <div>
                        <h3 class="font-black text-slate-900 text-lg">Order Status Distribution</h3>
                        <p class="text-xs text-slate-400">Real-time fulfillment breakdown</p>
                    </div>
                </div>
                <div class="h-52 relative flex items-center justify-center">
                    <canvas id="orderStatusChart"></canvas>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs pt-4 border-t border-slate-100 mt-4">
                <div class="flex items-center space-x-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span class="text-slate-600 font-medium">Pending: <strong>{{ $pendingOrders }}</strong></span>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    <span class="text-slate-600 font-medium">Processing: <strong>{{ $processingOrders }}</strong></span>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span class="text-slate-600 font-medium">Dispatched: <strong>{{ $dispatchedOrders }}</strong></span>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span class="text-slate-600 font-medium">Delivered: <strong>{{ $deliveredOrders }}</strong></span>
                </div>
            </div>
        </div>
    </div>

    <!-- Active Orders Management Table -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
                <h3 class="font-black text-slate-900 text-lg">Live Order Fulfillment & Cash Settlement</h3>
                <p class="text-xs text-slate-500">Fulfill orders, dispatch delivery riders, and reconcile Cash On Delivery (COD)</p>
            </div>
            <a href="{{ route('admin.orders') }}" class="text-xs font-bold text-fresh-700 hover:text-fresh-800 bg-fresh-50 px-4 py-2 rounded-xl border border-fresh-200 transition">
                View All Orders &rarr;
            </a>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="bg-slate-50/75 border-b border-slate-100 text-xs text-slate-400 uppercase font-semibold">
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
                <tbody class="divide-y divide-slate-100">
                    @forelse($recentOrders as $order)
                    <tr class="hover:bg-slate-50/50 transition">
                        <td class="py-4 px-6">
                            <span class="font-mono font-bold text-slate-900 block">{{ $order->order_number }}</span>
                            <span class="text-[11px] text-slate-400">{{ $order->created_at->format('d M Y, h:i A') }}</span>
                            <span class="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 text-slate-600">
                                {{ $order->order_source }}
                            </span>
                        </td>

                        <td class="px-4">
                            <div class="font-bold text-slate-800">{{ $order->customer_name }}</div>
                            <div class="text-xs text-slate-500 font-mono">{{ $order->customer_phone }}</div>
                            <a href="https://wa.me/{{ preg_replace('/[^0-9]/', '', $order->customer_phone) }}?text={{ urlencode('Assalam-o-Alaikum! Fresh House order #' . $order->order_number . ' is being processed.') }}" target="_blank" class="inline-flex items-center text-[11px] text-emerald-600 hover:text-emerald-700 font-bold mt-1">
                                <i class="fa-brands fa-whatsapp mr-1"></i> WhatsApp
                            </a>
                        </td>

                        <td class="px-4 text-xs text-slate-600 max-w-xs">
                            <span class="font-bold block text-slate-800">{{ $order->delivery_area ?: 'Karachi' }}</span>
                            <span class="truncate block text-slate-400">{{ $order->delivery_address }}</span>
                        </td>

                        <td class="px-4 font-black text-slate-900">
                            PKR {{ number_format($order->total, 0) }}
                        </td>

                        <td class="px-4">
                            @if($order->payment_status === 'paid')
                                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                    <i class="fa-solid fa-circle-check mr-1 text-[10px]"></i> Cash Collected
                                </span>
                            @else
                                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                                    <i class="fa-solid fa-clock mr-1 text-[10px]"></i> Pending COD
                                </span>
                            @endif
                        </td>

                        <td class="px-4">
                            <form action="{{ route('admin.orders.update_status', $order->id) }}" method="POST" class="inline">
                                @csrf
                                <select name="order_status" onchange="this.form.submit()" class="text-xs font-bold rounded-lg px-2.5 py-1 border border-slate-200 focus:outline-none bg-white cursor-pointer shadow-2xs">
                                    <option value="pending" {{ $order->order_status === 'pending' ? 'selected' : '' }}>Pending</option>
                                    <option value="processing" {{ $order->order_status === 'processing' ? 'selected' : '' }}>Processing</option>
                                    <option value="dispatched" {{ $order->order_status === 'dispatched' ? 'selected' : '' }}>Dispatched</option>
                                    <option value="delivered" {{ $order->order_status === 'delivered' ? 'selected' : '' }}>Delivered (Paid)</option>
                                    <option value="cancelled" {{ $order->order_status === 'cancelled' ? 'selected' : '' }}>Cancelled</option>
                                </select>
                            </form>
                        </td>

                        <td class="px-6 text-right space-x-2">
                            <a href="{{ route('admin.print_order', $order->id) }}" target="_blank" class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs inline-block" title="Print Packing Slip">
                                <i class="fa-solid fa-print"></i>
                            </a>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="7" class="text-center py-10 text-slate-400 text-xs">No active orders found.</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    <!-- Bottom Two Columns: Low Stock Alerts & Customer Inquiries -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Low Stock Alert Box -->
        <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div class="flex items-center space-x-2 text-rose-600 font-black">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <h3 class="text-base text-slate-900">Critical Stock Depletion (Restock Required)</h3>
                </div>
                <a href="{{ route('admin.products', ['low_stock' => 1]) }}" class="text-xs font-bold text-slate-500 hover:text-slate-800">
                    View All &rarr;
                </a>
            </div>

            <div class="divide-y divide-slate-100">
                @forelse($lowStockProducts as $lp)
                <div class="py-3 flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <img src="{{ $lp->primary_image ?: 'https://via.placeholder.com/40' }}" class="w-10 h-10 object-contain rounded-xl bg-slate-50 border border-slate-200 p-1">
                        <div>
                            <h4 class="text-xs font-bold text-slate-900 line-clamp-1">{{ $lp->name }}</h4>
                            <span class="text-[11px] text-slate-400">{{ $lp->unit }} &bull; SKU: {{ $lp->sku }}</span>
                        </div>
                    </div>
                    <div class="flex items-center space-x-3">
                        <span class="text-xs font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                            {{ $lp->stock_quantity }} units left
                        </span>
                        <form action="{{ route('admin.products.adjust_stock', $lp->id) }}" method="POST">
                            @csrf
                            <input type="hidden" name="change_qty" value="25">
                            <input type="hidden" name="reason" value="restock">
                            <button type="submit" class="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition" title="Restock +25">
                                +25 Restock
                            </button>
                        </form>
                    </div>
                </div>
                @empty
                <div class="text-center py-6 text-slate-400 text-xs">
                    <i class="fa-solid fa-circle-check text-emerald-500 text-base mb-1 block"></i>
                    All grocery stock levels healthy!
                </div>
                @endforelse
            </div>
        </div>

        <!-- Recent Customer Inquiries / Leads -->
        <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div class="flex items-center space-x-2 text-fresh-700 font-black">
                    <i class="fa-solid fa-headset"></i>
                    <h3 class="text-base text-slate-900">Recent Customer Inquiries & Leads</h3>
                </div>
                <a href="{{ route('admin.leads') }}" class="text-xs font-bold text-slate-500 hover:text-slate-800">
                    All Inquiries &rarr;
                </a>
            </div>

            <div class="divide-y divide-slate-100">
                @forelse($recentLeads as $lead)
                <div class="py-3 flex items-start justify-between gap-3">
                    <div>
                        <div class="flex items-center space-x-2">
                            <span class="font-bold text-xs text-slate-900">{{ $lead->name }}</span>
                            <span class="text-[10px] text-slate-400 font-mono">{{ $lead->phone }}</span>
                        </div>
                        <p class="text-xs text-slate-600 mt-1 line-clamp-1 font-medium">{{ $lead->message }}</p>
                    </div>
                    <a href="https://wa.me/{{ preg_replace('/[^0-9]/', '', $lead->phone) }}?text={{ urlencode('Assalam-o-Alaikum ' . $lead->name . ', thank you for contacting Fresh House.') }}" target="_blank" class="shrink-0 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition">
                        <i class="fa-brands fa-whatsapp text-sm"></i>
                        <span>Reply</span>
                    </a>
                </div>
                @empty
                <div class="text-center py-6 text-slate-400 text-xs">
                    No open support tickets.
                </div>
                @endforelse
            </div>
        </div>
    </div>
</div>

<!-- Chart Scripts & Barcode Checker -->
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Sales Trend Chart
        const ctxTrend = document.getElementById('salesTrendChart').getContext('2d');
        const gradient = ctxTrend.createLinearGradient(0, 0, 0, 240);
        gradient.addColorStop(0, 'rgba(34, 197, 94, 0.4)');
        gradient.addColorStop(1, 'rgba(34, 197, 94, 0.0)');

        new Chart(ctxTrend, {
            type: 'line',
            data: {
                labels: @json($salesChartLabels),
                datasets: [{
                    label: 'Gross Sales (PKR)',
                    data: @json($salesChartValues),
                    borderColor: '#478f45',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#478f45',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'PKR ' + Number(context.raw).toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'PKR ' + (value >= 1000 ? (value / 1000) + 'k' : value);
                            }
                        },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });

        // Order Status Doughnut
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
                    backgroundColor: [
                        '#fbbf24', // Amber
                        '#a855f7', // Purple
                        '#3b82f6', // Blue
                        '#478f45', // Brand green
                        '#b20f0b'  // Brand red
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { display: false }
                }
            }
        });
    });

    @if(config('features.pos'))
    function checkBarcodeOnDashboard() {
        const input = document.getElementById('dashboardBarcodeInput');
        const code = input.value.trim();
        const resDiv = document.getElementById('barcodeAuditResult');
        if (!code) return;

        resDiv.classList.remove('hidden');
        resDiv.innerHTML = '<div class="text-xs text-slate-500"><i class="fa-solid fa-spinner fa-spin mr-1.5"></i>Looking up barcode ' + code + '...</div>';

        fetch('/api/v1/pos/barcode/' + encodeURIComponent(code))
            .then(res => res.json())
            .then(data => {
                if (!data.success || !data.product) {
                    resDiv.innerHTML = '<div class="text-xs text-rose-600 font-bold"><i class="fa-solid fa-circle-exclamation mr-1"></i>Barcode not found in catalog!</div>';
                    return;
                }
                const p = data.product;
                resDiv.innerHTML = `
                    <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                        <div class="flex items-center space-x-3">
                            <img src="${p.primary_image || 'https://via.placeholder.com/40'}" class="w-12 h-12 object-contain rounded-xl bg-white border border-slate-200 p-1">
                            <div>
                                <h4 class="text-xs font-black text-slate-900">${p.name}</h4>
                                <div class="text-[11px] text-slate-500 font-mono">SKU: ${p.sku} &bull; Barcode: ${p.barcode}</div>
                            </div>
                        </div>
                        <div class="flex items-center space-x-4">
                            <div class="text-right">
                                <span class="text-xs font-black text-emerald-800">PKR ${Number(p.price).toLocaleString()}</span>
                                <span class="block text-[11px] text-slate-500">Live Stock: <strong class="${p.stock_quantity < 10 ? 'text-rose-600' : 'text-slate-800'}">${p.stock_quantity} units</strong></span>
                            </div>
                            <a href="/admin/products?search=${encodeURIComponent(p.sku)}" class="bg-fresh-600 hover:bg-fresh-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition">
                                Manage Stock &rarr;
                            </a>
                        </div>
                    </div>
                `;
            })
            .catch(err => {
                resDiv.innerHTML = '<div class="text-xs text-rose-600 font-bold">Error querying barcode.</div>';
            });
    }
    @endif
</script>
@endsection
@extends('admin.layout')

@section('content')
<div class="space-y-8 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <div class="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-1">
                <span>Administration</span>
                <i class="fa-solid fa-chevron-right text-[10px]"></i>
                <span class="text-fresh-700">Financial Reports & Profit</span>
            </div>
            <h2 class="text-2xl font-black text-slate-900 tracking-tight">Financial Auditing, COGS & Margin Analysis</h2>
            <p class="text-xs text-slate-500">Gross revenue reconciliation, supplier cost of goods sold, profit margins, and warehouse inventory valuation</p>
        </div>

        <div class="flex items-center space-x-3">
            <button onclick="window.print()" class="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-2 transition">
                <i class="fa-solid fa-print text-fresh-600"></i>
                <span>Print Audit Statement</span>
            </button>
            <a href="{{ route('admin.orders.export_csv') }}" class="bg-slate-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition">
                <i class="fa-solid fa-file-excel text-emerald-400"></i>
                <span>Export Ledger (CSV)</span>
            </a>
        </div>
    </div>

    <!-- 4 High Impact Financial Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Revenue (PKR)</span>
            <h3 class="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                PKR {{ number_format($totalSales, 0) }}
            </h3>
            <span class="text-xs text-fresh-700 font-bold mt-2 block">
                <i class="fa-solid fa-arrow-trend-up mr-1"></i> Net Sales Recognized
            </span>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">COD Collected to Bank</span>
            <h3 class="text-2xl sm:text-3xl font-black text-emerald-800 mt-2">
                PKR {{ number_format($codCollected, 0) }}
            </h3>
            <span class="text-xs text-slate-500 font-medium mt-2 block">
                PKR {{ number_format($codPending, 0) }} in transit
            </span>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Warehouse Stock Valuation</span>
            <h3 class="text-2xl sm:text-3xl font-black text-indigo-700 mt-2">
                PKR {{ number_format($totalStockValue, 0) }}
            </h3>
            <span class="text-xs text-slate-500 font-medium mt-2 block">
                Retail value of 745+ SKUs
            </span>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Est. Gross Markup Margin</span>
            <h3 class="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">
                +{{ $estimatedProfitMargin }}%
            </h3>
            <span class="text-xs text-emerald-700 font-bold mt-2 block">
                Avg wholesale-to-retail markup
            </span>
        </div>
    </div>

    <!-- Breakdown Tables: Departments & Valuation -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Top Departments by SKU Volume -->
        <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 class="font-black text-slate-900 text-base">Top Departments by Inventory Breadth</h3>
                <span class="text-xs text-slate-400 font-bold">Catalog Share</span>
            </div>

            <div class="space-y-4">
                @foreach($categoryBreakdown as $cat)
                @php
                    $pct = $totalStockValue > 0 ? round(($cat->products_count / 745) * 100) : 0;
                @endphp
                <div>
                    <div class="flex justify-between text-xs mb-1">
                        <span class="font-bold text-slate-800">{{ $cat->name }}</span>
                        <span class="font-mono text-slate-500 font-bold">{{ $cat->products_count }} SKUs ({{ $pct }}%)</span>
                    </div>
                    <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div class="h-full bg-fresh-500 rounded-full" style="width: {{ $pct * 2 }}%"></div>
                    </div>
                </div>
                @endforeach
            </div>
        </div>

        <!-- Inventory Restock Valuation Matrix -->
        <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 class="font-black text-slate-900 text-base">High-Asset Inventory Assets (Sample)</h3>
                <a href="{{ route('admin.products.export_csv') }}" class="text-xs font-bold text-fresh-700 hover:text-fresh-800">
                    Export All CSV &rarr;
                </a>
            </div>

            <div class="divide-y divide-slate-100">
                @foreach($topProducts as $tp)
                <div class="py-3 flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <img src="{{ $tp->primary_image ?: 'https://via.placeholder.com/40' }}" class="w-10 h-10 object-contain rounded-xl bg-slate-50 border border-slate-200 p-1">
                        <div>
                            <h4 class="text-xs font-bold text-slate-900 line-clamp-1">{{ $tp->name }}</h4>
                            <span class="text-[11px] text-slate-400 font-mono">{{ $tp->sku }} &bull; Stock: {{ $tp->stock_quantity }} units</span>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="text-xs font-black text-slate-900">PKR {{ number_format($tp->price * $tp->stock_quantity, 0) }}</span>
                        <span class="block text-[10px] text-slate-400">@ PKR {{ number_format($tp->price, 0) }}/unit</span>
                    </div>
                </div>
                @endforeach
            </div>
        </div>
    </div>
</div>
@endsection
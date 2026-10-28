@extends('admin.layout')

@section('content')
<div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header with Breadcrumb -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 class="text-2xl font-black text-gray-900 tracking-tight">POS & Multi-Channel Inventory Audit Trail</h2>
            <p class="text-xs text-gray-500">Real-time ledger recording every single stock movement across Online Storefront and Store POS Counter</p>
        </div>

        <div class="flex items-center space-x-3">
            <a href="{{ route('admin.pos') }}" class="bg-emerald-950 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition">
                <i class="fa-solid fa-cash-register text-fresh-400"></i>
                <span>Open POS Terminal</span>
            </a>
        </div>
    </div>

    <!-- Inventory Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Stock Events</span>
                <h3 class="text-xl sm:text-2xl font-black text-gray-900 mt-1">{{ $totalLogsCount }} Movements</h3>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-fresh-50 text-fresh-600 flex items-center justify-center text-lg">
                <i class="fa-solid fa-arrow-right-arrow-left"></i>
            </div>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Online Store Orders</span>
                <h3 class="text-xl sm:text-2xl font-black text-blue-600 mt-1">{{ $onlineDeductions }} Deductions</h3>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                <i class="fa-solid fa-globe"></i>
            </div>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Store POS Walk-in Sales</span>
                <h3 class="text-xl sm:text-2xl font-black text-purple-600 mt-1">{{ $posDeductions }} Counter Sales</h3>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg">
                <i class="fa-solid fa-cash-register"></i>
            </div>
        </div>
    </div>

    <!-- Movement Logs Table -->
    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="bg-gray-50/75 border-b border-gray-100 text-xs text-gray-400 uppercase font-semibold">
                    <tr>
                        <th class="py-4 px-6">Timestamp</th>
                        <th class="px-4">Product Name</th>
                        <th class="px-4">Channel / Reason</th>
                        <th class="px-4">Stock Change</th>
                        <th class="px-4">Balance After</th>
                        <th class="px-4">Order / Event Ref</th>
                        <th class="px-6">Operator / Station</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 font-mono text-xs">
                    @forelse($logs as $log)
                    <tr class="hover:bg-gray-50/50 transition">
                        <td class="py-4 px-6 text-gray-400">
                            {{ $log->created_at->format('Y-m-d H:i:s') }}
                        </td>

                        <td class="px-4 font-sans font-bold text-gray-900">
                            {{ $log->product->name ?? 'Unknown Item' }}
                        </td>

                        <td class="px-4 font-sans">
                            <span class="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                                @if($log->reason == 'online_order') bg-blue-100 text-blue-800
                                @elseif($log->reason == 'pos_sale') bg-purple-100 text-purple-800
                                @elseif($log->reason == 'restock') bg-emerald-100 text-emerald-800
                                @else bg-gray-100 text-gray-800 @endif">
                                {{ str_replace('_', ' ', $log->reason) }}
                            </span>
                        </td>

                        <td class="px-4 font-black {{ $log->change_qty > 0 ? 'text-emerald-600' : 'text-rose-600' }}">
                            {{ $log->change_qty > 0 ? '+' . $log->change_qty : $log->change_qty }} units
                        </td>

                        <td class="px-4 font-black text-gray-800">
                            {{ $log->balance_after }} units
                        </td>

                        <td class="px-4 text-gray-500 font-bold">
                            {{ $log->reference_id ?? 'N/A' }}
                        </td>

                        <td class="px-6 font-sans text-gray-600">
                            {{ $log->operator_name ?? 'System' }}
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="7" class="text-center py-12 text-gray-400 text-xs">No inventory movements recorded yet.</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="p-6 border-t border-gray-100 font-sans">
            {{ $logs->links() }}
        </div>
    </div>
</div>
@endsection

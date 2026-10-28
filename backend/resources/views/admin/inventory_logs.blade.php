@extends('admin.layout')

@section('content')
<div class="space-y-6">
    <div>
        <h2 class="text-2xl font-bold text-gray-900">POS & Online Inventory Audit Trail</h2>
        <p class="text-xs text-gray-500">Real-time bi-directional log of all stock deductions, physical store counter sales, restocks, and audits</p>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="bg-gray-50/75 border-b border-gray-100 text-xs text-gray-400 uppercase font-semibold">
                    <tr>
                        <th class="py-3.5 px-6">Timestamp</th>
                        <th class="px-4">Product Name</th>
                        <th class="px-4">Channel / Reason</th>
                        <th class="px-4">Stock Change</th>
                        <th class="px-4">Balance After</th>
                        <th class="px-4">Reference #</th>
                        <th class="px-6">Operator / Station</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 font-mono text-xs">
                    @forelse($logs as $log)
                    <tr class="hover:bg-gray-50/50 transition">
                        <td class="py-4 px-6 text-gray-400">
                            {{ $log->created_at->format('Y-m-d H:i:s') }}
                        </td>

                        <td class="px-4 font-sans font-semibold text-gray-900">
                            {{ $log->product->name ?? 'Unknown Item' }}
                        </td>

                        <td class="px-4 font-sans">
                            <span class="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase
                                @if($log->reason == 'online_order') bg-blue-100 text-blue-800
                                @elseif($log->reason == 'pos_sale') bg-purple-100 text-purple-800
                                @elseif($log->reason == 'restock') bg-emerald-100 text-emerald-800
                                @else bg-gray-100 text-gray-800 @endif">
                                {{ str_replace('_', ' ', $log->reason) }}
                            </span>
                        </td>

                        <td class="px-4 font-bold {{ $log->change_qty > 0 ? 'text-emerald-600' : 'text-rose-600' }}">
                            {{ $log->change_qty > 0 ? '+' . $log->change_qty : $log->change_qty }} units
                        </td>

                        <td class="px-4 font-bold text-gray-800">
                            {{ $log->balance_after }} units
                        </td>

                        <td class="px-4 text-gray-500">
                            {{ $log->reference_id ?? 'N/A' }}
                        </td>

                        <td class="px-6 font-sans text-gray-600">
                            {{ $log->operator_name ?? 'System' }}
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="7" class="text-center py-10 text-gray-400 text-sm">
                            No inventory movements recorded yet.
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="p-4 border-t border-gray-100">
            {{ $logs->links() }}
        </div>
    </div>
</div>
@endsection

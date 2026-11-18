@extends('admin.layout')

@section('content')
@php
    // Every kind of stock change, in plain words: [label, colour]
    $kinds = [
        'online_order' => ['Sold online', 'bg-blue-50 text-blue-800'],
        'pos_sale' => ['Sold in store', 'bg-purple-50 text-purple-800'],
        'order_cancelled' => ['Order cancelled, back in stock', 'bg-amber-50 text-amber-800'],
        'order_reinstated' => ['Order un-cancelled, taken again', 'bg-orange-50 text-orange-800'],
        'restock' => ['New stock added', 'bg-emerald-50 text-emerald-800'],
        'return' => ['Customer return', 'bg-emerald-50 text-emerald-800'],
        'adjustment' => ['Stock count corrected', 'bg-slate-100 text-slate-700'],
        'damage' => ['Damaged / expired', 'bg-red-50 text-red-800'],
    ];
    $tabLink = fn ($t, $extra = []) => route('admin.inventory_logs', array_merge(['tab' => $t], $extra));
    $pill = 'px-3 h-8 inline-flex items-center rounded-full text-xs font-bold border transition';
    $on = 'bg-fresh-600 text-white border-fresh-600';
    $off = 'bg-white text-slate-600 border-slate-200 hover:border-fresh-400';
@endphp
<div class="space-y-5 max-w-6xl mx-auto">
    <div>
        <h2 class="text-2xl font-black text-slate-900 tracking-tight">Inventory</h2>
        <p class="text-xs text-slate-500 mt-1">How much of each product is on the shelf, and every change to it. Orders take stock off by themselves; cancelling an order puts it back.</p>
    </div>

    {{-- Tabs --}}
    <div class="flex gap-1 p-1 rounded-2xl bg-slate-100 w-fit" role="tablist">
        <a href="{{ $tabLink('stock') }}" role="tab" aria-selected="{{ $tab === 'stock' ? 'true' : 'false' }}" class="px-5 h-10 inline-flex items-center gap-2 rounded-xl text-sm font-bold {{ $tab === 'stock' ? 'bg-white text-fresh-800 shadow-sm' : 'text-slate-600 hover:text-slate-900' }}">
            <i class="fa-solid fa-boxes-stacked"></i> Stock
        </a>
        <a href="{{ $tabLink('history') }}" role="tab" aria-selected="{{ $tab === 'history' ? 'true' : 'false' }}" class="px-5 h-10 inline-flex items-center gap-2 rounded-xl text-sm font-bold {{ $tab === 'history' ? 'bg-white text-fresh-800 shadow-sm' : 'text-slate-600 hover:text-slate-900' }}">
            <i class="fa-solid fa-clock-rotate-left"></i> History
        </a>
    </div>

    {{-- Search + filters --}}
    <form method="GET" action="{{ route('admin.inventory_logs') }}" class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center gap-3">
        <input type="hidden" name="tab" value="{{ $tab }}">
        @if($show !== 'all')<input type="hidden" name="show" value="{{ $show }}">@endif
        <div class="relative flex-1">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input type="search" name="search" value="{{ $search }}" placeholder="{{ $tab === 'stock' ? 'Search product name, SKU or barcode' : 'Search product or order number' }}" aria-label="Search"
                   class="w-full pl-9 pr-3 h-10 rounded-xl border border-slate-200 text-sm focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none">
        </div>
        <div class="flex flex-wrap gap-2">
            @if($tab === 'stock')
                @foreach(['all' => 'All products', 'low' => 'Low (' . $counts['low'] . ')', 'out' => 'Out of stock (' . $counts['out'] . ')', 'untracked' => 'Not tracked'] as $key => $name)
                    <a href="{{ $tabLink('stock', array_filter(['show' => $key === 'all' ? null : $key, 'search' => $search ?: null])) }}" class="{{ $pill }} {{ $show === $key ? $on : $off }}">{{ $name }}</a>
                @endforeach
            @else
                @foreach(['all' => 'All changes', 'sold' => 'Sold', 'added' => 'Added', 'removed' => 'Removed', 'cancelled' => 'Cancelled orders'] as $key => $name)
                    <a href="{{ $tabLink('history', array_filter(['show' => $key === 'all' ? null : $key, 'search' => $search ?: null])) }}" class="{{ $pill }} {{ $show === $key ? $on : $off }}">{{ $name }}</a>
                @endforeach
            @endif
        </div>
    </form>

    @if($tab === 'stock')
        {{-- STOCK --}}
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="bg-slate-50 border-b border-slate-100 text-[11px] text-slate-500 uppercase tracking-wider">
                        <tr>
                            <th class="py-3 px-5 font-bold">Product</th>
                            <th class="px-4 font-bold text-right">In stock</th>
                            <th class="px-4 font-bold">Status</th>
                            <th class="px-5 font-bold text-right">Change stock</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        @forelse($products as $p)
                            @php
                                if (! $p->track_stock) { [$state, $cls] = ['Not tracked', 'bg-slate-100 text-slate-500']; }
                                elseif ($p->stock_quantity <= 0) { [$state, $cls] = ['Out of stock', 'bg-red-50 text-red-700']; }
                                elseif ($p->stock_quantity <= $p->low_stock_threshold) { [$state, $cls] = ['Low', 'bg-amber-50 text-amber-800']; }
                                else { [$state, $cls] = ['In stock', 'bg-emerald-50 text-emerald-800']; }
                            @endphp
                            <tr>
                                <td class="py-3 px-5">
                                    <span class="font-bold text-slate-900 block">{{ $p->name }}</span>
                                    <span class="text-[11px] text-slate-400">{{ $p->sku ? 'SKU ' . $p->sku : '' }}{{ $p->track_stock ? ($p->sku ? ' · ' : '') . 'low at ' . $p->low_stock_threshold : '' }}</span>
                                </td>
                                <td class="px-4 text-right font-black text-lg {{ $p->track_stock && $p->stock_quantity <= 0 ? 'text-red-600' : 'text-slate-900' }}">
                                    {{ $p->track_stock ? number_format($p->stock_quantity) : '–' }}
                                </td>
                                <td class="px-4"><span class="px-2.5 py-1 rounded-full text-[11px] font-bold {{ $cls }}">{{ $state }}</span></td>
                                <td class="px-5 text-right whitespace-nowrap">
                                    <button type="button" onclick="openAdjust({{ $p->id }}, @js($p->name), {{ (int) $p->stock_quantity }})" class="px-3 h-9 rounded-xl text-xs font-bold bg-fresh-50 hover:bg-fresh-100 text-fresh-800 border border-fresh-200">
                                        <i class="fa-solid fa-plus-minus"></i> Add / remove
                                    </button>
                                    <a href="{{ $tabLink('history', ['search' => $p->sku ?: $p->name]) }}" class="ml-1 px-3 h-9 inline-flex items-center rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100" title="History of {{ $p->name }}">History</a>
                                </td>
                            </tr>
                        @empty
                            <tr><td colspan="4" class="text-center py-12 text-slate-400 text-xs">No products match.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            <div class="px-5 py-4 border-t border-slate-100">{{ $products->links() }}</div>
        </div>
    @else
        {{-- HISTORY --}}
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="bg-slate-50 border-b border-slate-100 text-[11px] text-slate-500 uppercase tracking-wider">
                        <tr>
                            <th class="py-3 px-5 font-bold">When</th>
                            <th class="px-4 font-bold">Product</th>
                            <th class="px-4 font-bold">What happened</th>
                            <th class="px-4 font-bold text-right">Change</th>
                            <th class="px-4 font-bold text-right">Stock after</th>
                            <th class="px-5 font-bold">By</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        @forelse($logs as $log)
                            @php
                                [$what, $cls] = $kinds[$log->reason] ?? [ucfirst(str_replace('_', ' ', $log->reason)), 'bg-slate-100 text-slate-700'];
                                $opening = $log->reference_id === 'INIT-STOCK';
                                if ($opening) { [$what, $cls] = ['Opening stock', 'bg-slate-100 text-slate-700']; }
                                // Only real orders get a link to the order
                                $isOrder = $log->reference_id && in_array($log->reason, ['online_order', 'pos_sale', 'order_cancelled', 'order_reinstated'], true);
                                $note = ! $opening && $log->notes && ! in_array($log->notes, ['Manual inventory adjustment via CRM', 'Deducted via Online Checkout'], true) && ! str_starts_with($log->notes, 'Returned to stock:') && ! str_starts_with($log->notes, 'Taken from stock again:') ? $log->notes : null;
                            @endphp
                            <tr class="align-top">
                                <td class="py-3 px-5 whitespace-nowrap text-xs text-slate-500">{{ $log->created_at->timezone('Asia/Karachi')->format('d M Y') }}<br>{{ $log->created_at->timezone('Asia/Karachi')->format('g:i a') }}</td>
                                <td class="py-3 px-4 font-bold text-slate-900">{{ $log->product->name ?? 'Deleted product' }}</td>
                                <td class="py-3 px-4">
                                    <span class="px-2.5 py-1 rounded-full text-[11px] font-bold {{ $cls }}">{{ $what }}</span>
                                    @if($isOrder)
                                        <a href="{{ route('admin.orders', ['search' => $log->reference_id]) }}" class="ml-1 text-xs font-bold text-fresh-700 hover:underline">{{ $log->reference_id }}</a>
                                    @endif
                                    @if($note)<span class="block text-[11px] text-slate-500 mt-1">{{ $note }}</span>@endif
                                </td>
                                <td class="py-3 px-4 text-right font-black whitespace-nowrap {{ $log->change_qty > 0 ? 'text-emerald-600' : 'text-red-600' }}">{{ $log->change_qty > 0 ? '+' : '−' }}{{ abs($log->change_qty) }}</td>
                                <td class="py-3 px-4 text-right font-bold text-slate-800">{{ $log->balance_after }}</td>
                                <td class="py-3 px-5 text-xs text-slate-600">{{ $log->operator_name ?: 'System' }}</td>
                            </tr>
                        @empty
                            <tr><td colspan="6" class="text-center py-12 text-slate-400 text-xs">No stock changes match.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            <div class="px-5 py-4 border-t border-slate-100">{{ $logs->links() }}</div>
        </div>
    @endif
</div>

{{-- Add / remove stock --}}
<div id="adjustModal" class="fixed inset-0 bg-black/60 backdrop-blur-xs hidden items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="adjustTitle">
    <form id="adjustForm" method="POST" action="" class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4" onsubmit="return prepareAdjust()">
        @csrf
        <div>
            <h3 id="adjustTitle" class="font-black text-slate-900 text-lg">Change stock</h3>
            <p class="text-xs text-slate-500 mt-0.5"><span id="adjustName"></span> · now <b id="adjustNow"></b> in stock</p>
        </div>
        <div class="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Add or remove">
            <label class="cursor-pointer"><input type="radio" name="direction" value="add" class="peer sr-only" checked onchange="syncReasons()"><span class="flex h-11 items-center justify-center rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-600 peer-checked:border-fresh-600 peer-checked:bg-fresh-50 peer-checked:text-fresh-800"><i class="fa-solid fa-plus mr-1.5"></i> Add</span></label>
            <label class="cursor-pointer"><input type="radio" name="direction" value="remove" class="peer sr-only" onchange="syncReasons()"><span class="flex h-11 items-center justify-center rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-600 peer-checked:border-red-500 peer-checked:bg-red-50 peer-checked:text-red-700"><i class="fa-solid fa-minus mr-1.5"></i> Remove</span></label>
        </div>
        <div>
            <label for="adjustQty" class="block text-xs font-bold text-slate-700 mb-1">How many</label>
            <input id="adjustQty" type="number" min="1" max="100000" step="1" required class="w-full px-3.5 h-11 rounded-xl border border-slate-200 text-sm font-bold focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none">
            <input type="hidden" name="change_qty" id="adjustChange">
        </div>
        <div>
            <label for="adjustReason" class="block text-xs font-bold text-slate-700 mb-1">Why</label>
            <select id="adjustReason" name="reason" class="w-full px-3.5 h-11 rounded-xl border border-slate-200 text-sm bg-white focus:border-fresh-500 focus:outline-none"></select>
        </div>
        <div>
            <label for="adjustNotes" class="block text-xs font-bold text-slate-700 mb-1">Note <span class="font-normal text-slate-400">(optional)</span></label>
            <input id="adjustNotes" type="text" name="notes" maxlength="500" placeholder="e.g. supplier invoice 1234" class="w-full px-3.5 h-11 rounded-xl border border-slate-200 text-sm focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none">
        </div>
        <div class="flex justify-end gap-2 pt-2">
            <button type="button" onclick="closeAdjust()" class="px-4 h-10 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
            <button type="submit" class="px-5 h-10 rounded-xl text-xs font-bold bg-fresh-600 hover:bg-fresh-700 text-white shadow-md shadow-fresh-600/30">Save</button>
        </div>
    </form>
</div>

<script>
    const adjustUrl = @js(route('admin.products.adjust_stock', ['id' => '__ID__']));
    const reasons = {
        add: [['restock', 'New stock arrived'], ['return', 'Customer return'], ['adjustment', 'Stock count was wrong']],
        remove: [['damage', 'Damaged or expired'], ['adjustment', 'Stock count was wrong']],
    };
    function syncReasons() {
        const dir = document.querySelector('#adjustForm input[name="direction"]:checked').value;
        document.getElementById('adjustReason').innerHTML = reasons[dir].map(([v, t]) => `<option value="${v}">${t}</option>`).join('');
    }
    function openAdjust(id, name, now) {
        const form = document.getElementById('adjustForm');
        form.action = adjustUrl.replace('__ID__', id);
        form.reset();
        document.getElementById('adjustName').textContent = name;
        document.getElementById('adjustNow').textContent = now;
        syncReasons();
        const modal = document.getElementById('adjustModal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        setTimeout(() => document.getElementById('adjustQty').focus(), 50);
    }
    function closeAdjust() {
        const modal = document.getElementById('adjustModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    function prepareAdjust() {
        const qty = Math.abs(parseInt(document.getElementById('adjustQty').value, 10) || 0);
        if (!qty) return false;
        const dir = document.querySelector('#adjustForm input[name="direction"]:checked').value;
        document.getElementById('adjustChange').value = dir === 'remove' ? -qty : qty;
        return true;
    }
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAdjust(); });
</script>
@endsection

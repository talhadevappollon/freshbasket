@extends('admin.layout')

@section('content')
<div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-2xl font-bold text-gray-900">Products & POS Inventory Control</h2>
            <p class="text-xs text-gray-500">Manage catalog, real-time stock levels, barcodes, and supplier costs</p>
        </div>

        <!-- Filter and Search -->
        <form action="{{ route('admin.products') }}" method="GET" class="flex flex-wrap items-center gap-2">
            <div class="relative">
                <input type="text" name="search" value="{{ request('search') }}" placeholder="Name, SKU, Barcode..." class="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs w-60 focus:outline-none focus:border-fresh-500 bg-white">
                <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-gray-400 text-xs"></i>
            </div>

            <select name="category" onchange="this.form.submit()" class="px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-fresh-500 bg-white max-w-[180px]">
                <option value="">All Categories</option>
                @foreach($categories as $cat)
                    <option value="{{ $cat->id }}" {{ request('category') == $cat->id ? 'selected' : '' }}>{{ $cat->name }}</option>
                @endforeach
            </select>

            <label class="flex items-center space-x-1.5 text-xs text-gray-700 bg-white px-3 py-2 rounded-xl border border-gray-200 cursor-pointer">
                <input type="checkbox" name="low_stock" value="1" onchange="this.form.submit()" {{ request('low_stock') ? 'checked' : '' }} class="rounded text-fresh-600 focus:ring-0">
                <span>Low Stock Only</span>
            </label>
        </form>
    </div>

    <!-- Products Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="bg-gray-50/75 border-b border-gray-100 text-xs text-gray-400 uppercase font-semibold">
                    <tr>
                        <th class="py-3.5 px-6">Product Item</th>
                        <th class="px-4">Category</th>
                        <th class="px-4">SKU / Barcode</th>
                        <th class="px-4">Retail Price</th>
                        <th class="px-4">Cost Price (Margin)</th>
                        <th class="px-4">Stock Quantity</th>
                        <th class="px-6 text-right">Quick Stock Adjustment</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    @forelse($products as $product)
                    <tr class="hover:bg-gray-50/50 transition">
                        <td class="py-4 px-6 flex items-center space-x-3">
                            <img src="{{ $product->primary_image ?: 'https://via.placeholder.com/60' }}" class="w-12 h-12 object-cover rounded-xl border border-gray-100 shrink-0">
                            <div>
                                <span class="font-bold text-gray-900 block line-clamp-1">{{ $product->name }}</span>
                                <span class="text-xs text-gray-400">{{ $product->unit }} &bull; {{ $product->brand ?? 'Fresh Basket' }}</span>
                            </div>
                        </td>

                        <td class="px-4">
                            <span class="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                {{ $product->category->name ?? 'General' }}
                            </span>
                        </td>

                        <td class="px-4">
                            <div class="text-xs font-mono font-medium text-gray-800">{{ $product->sku }}</div>
                            <div class="text-[11px] font-mono text-gray-400 flex items-center space-x-1 mt-0.5">
                                <i class="fa-solid fa-barcode text-xs"></i>
                                <span>{{ $product->barcode }}</span>
                            </div>
                        </td>

                        <td class="px-4 font-bold text-gray-900">
                            PKR {{ number_format($product->price, 0) }}
                        </td>

                        <td class="px-4 text-xs">
                            <div class="text-gray-600">PKR {{ number_format($product->cost_price, 0) }}</div>
                            @php
                                $margin = $product->price > 0 ? round((($product->price - $product->cost_price) / $product->price) * 100) : 0;
                            @endphp
                            <span class="text-[11px] font-semibold text-emerald-600">+{{ $margin }}% margin</span>
                        </td>

                        <td class="px-4">
                            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold 
                                {{ $product->stock_quantity <= $product->low_stock_threshold ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800' }}">
                                {{ $product->stock_quantity }} units
                            </span>
                        </td>

                        <td class="px-6 text-right">
                            <div class="inline-flex items-center space-x-1">
                                <!-- Quick +10 Restock -->
                                <form action="{{ route('admin.products.adjust_stock', $product->id) }}" method="POST" class="inline">
                                    @csrf
                                    <input type="hidden" name="change_qty" value="10">
                                    <input type="hidden" name="reason" value="restock">
                                    <button type="submit" class="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition" title="Add 10 units">
                                        +10
                                    </button>
                                </form>

                                <!-- Quick +50 Restock -->
                                <form action="{{ route('admin.products.adjust_stock', $product->id) }}" method="POST" class="inline">
                                    @csrf
                                    <input type="hidden" name="change_qty" value="50">
                                    <input type="hidden" name="reason" value="restock">
                                    <button type="submit" class="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition" title="Add 50 units">
                                        +50
                                    </button>
                                </form>

                                <!-- Manual Adjustment Dialog trigger -->
                                <button onclick="openStockModal({{ $product->id }}, '{{ addslashes($product->name) }}', {{ $product->stock_quantity }})" class="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs transition" title="Custom Adjustment">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="7" class="text-center py-10 text-gray-400 text-sm">
                            No products found matching your search.
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="p-4 border-t border-gray-100">
            {{ $products->links() }}
        </div>
    </div>
</div>

<!-- Modal for Custom Stock Adjustment -->
<div id="stockModal" class="fixed inset-0 bg-black/50 hidden items-center justify-center p-4 z-50">
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <h3 class="font-bold text-gray-900 text-lg mb-1" id="modalProductName">Adjust Inventory</h3>
        <p class="text-xs text-gray-500 mb-4" id="modalCurrentStock">Current stock: 0 units</p>

        <form id="stockModalForm" method="POST" action="">
            @csrf
            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1">Stock Change Quantity</label>
                    <input type="number" name="change_qty" required placeholder="e.g. +20 or -5" class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-fresh-500 focus:outline-none">
                    <span class="text-[11px] text-gray-400 mt-0.5 block">Use positive for restock, negative for deduction</span>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1">Reason for Audit Log</label>
                    <select name="reason" class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-fresh-500 focus:outline-none">
                        <option value="restock">Supplier Restock</option>
                        <option value="adjustment">Physical Count Audit Adjustment</option>
                        <option value="damage">Damaged / Expired Item</option>
                        <option value="return">Customer Return</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1">Operator Notes</label>
                    <textarea name="notes" rows="2" placeholder="Optional notes for log..." class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-fresh-500 focus:outline-none"></textarea>
                </div>
            </div>

            <div class="flex justify-end space-x-3 mt-6">
                <button type="button" onclick="closeStockModal()" class="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
                <button type="submit" class="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow">Save Changes</button>
            </div>
        </form>
    </div>
</div>

<script>
    function openStockModal(productId, productName, currentStock) {
        document.getElementById('modalProductName').innerText = productName;
        document.getElementById('modalCurrentStock').innerText = 'Current Balance: ' + currentStock + ' units';
        document.getElementById('stockModalForm').action = '/admin/products/' + productId + '/stock';
        document.getElementById('stockModal').classList.remove('hidden');
        document.getElementById('stockModal').classList.add('flex');
    }

    function closeStockModal() {
        document.getElementById('stockModal').classList.add('hidden');
        document.getElementById('stockModal').classList.remove('flex');
    }
</script>
@endsection

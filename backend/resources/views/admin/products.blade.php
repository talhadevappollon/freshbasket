@extends('admin.layout')

@section('content')
<div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header with Breadcrumb -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 class="text-2xl font-black text-gray-900 tracking-tight">Products &{{ config('features.pos') ? ' POS' : '' }} Inventory Matrix</h2>
            <p class="text-xs text-gray-500">Real-time inventory levels, barcode indexes, supplier cost prices, and retail markups</p>
        </div>

        <div class="flex items-center space-x-3">
            <button
                onclick="document.getElementById('quickAddProductModal').classList.remove('hidden'); document.getElementById('quickAddProductModal').classList.add('flex');"
                class="bg-fresh-600 hover:bg-fresh-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-fresh-600/30 flex items-center gap-1.5 transition"
            >
                <i class="fa-solid fa-plus"></i>
                <span>Add Product</span>
            </button>

@if(config('features.pos'))
            <a href="{{ route('admin.pos') }}" class="bg-emerald-950 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition">
                <i class="fa-solid fa-barcode text-fresh-400"></i>
                <span>Barcode Terminal</span>
            </a>
@endif
        </div>
    </div>

    <!-- Inventory Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Catalog Size</span>
                <h3 class="text-xl sm:text-2xl font-black text-gray-900 mt-1">{{ $products->total() }} Active Items</h3>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-fresh-50 text-fresh-600 flex items-center justify-center text-lg">
                <i class="fa-solid fa-boxes-stacked"></i>
            </div>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Stock Value</span>
                <h3 class="text-xl sm:text-2xl font-black text-emerald-800 mt-1">PKR {{ number_format($totalStockValue, 0) }}</h3>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                <i class="fa-solid fa-vault"></i>
            </div>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Restock Required</span>
                <h3 class="text-xl sm:text-2xl font-black text-rose-600 mt-1">{{ $lowStockCount }} SKUs</h3>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg">
                <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
        </div>
    </div>

    <!-- Filter & Search Bar -->
    <div class="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <form action="{{ route('admin.products') }}" method="GET" class="flex flex-wrap items-center gap-3">
            <div class="relative flex-1 min-w-[240px]">
                <input
                    type="text"
                    name="search"
                    value="{{ request('search') }}"
                    placeholder="Search Product Name, SKU, Barcode, Brand..."
                    class="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-fresh-500 focus:outline-none transition"
                />
                <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-gray-400 text-xs"></i>
            </div>

            <select name="category" onchange="this.form.submit()" class="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-fresh-500 focus:outline-none font-medium max-w-[200px]">
                <option value="">All Categories</option>
                @foreach($categories as $cat)
                    <option value="{{ $cat->id }}" {{ request('category') == $cat->id ? 'selected' : '' }}>{{ $cat->name }}</option>
                @endforeach
            </select>

            <label class="flex items-center space-x-2 text-xs text-gray-700 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl border border-gray-200 cursor-pointer transition">
                <input type="checkbox" name="low_stock" value="1" onchange="this.form.submit()" {{ request('low_stock') ? 'checked' : '' }} class="rounded text-fresh-600 focus:ring-0">
                <span class="font-bold">Low Stock Warning Only</span>
            </label>

            <button type="submit" class="bg-fresh-600 hover:bg-fresh-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition">
                Filter
            </button>
        </form>
    </div>

    <!-- Products Matrix Table -->
    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="bg-gray-50/75 border-b border-gray-100 text-xs text-gray-400 uppercase font-semibold">
                    <tr>
                        <th class="py-4 px-6">Product Details</th>
                        <th class="px-4">Category</th>
                        <th class="px-4">SKU / Barcode</th>
                        <th class="px-4">Retail Price</th>
                        <th class="px-4">Cost Price (Margin)</th>
                        <th class="px-4">Live Inventory</th>
                        <th class="px-4">Availability</th>
                        <th class="px-6 text-right">Quick Stock Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    @forelse($products as $product)
                    <tr class="hover:bg-gray-50/50 transition">
                        <td class="py-4 px-6 flex items-center space-x-3.5">
                            <img src="{{ $product->primary_image ?: 'https://via.placeholder.com/60' }}" class="w-12 h-12 object-contain rounded-xl border border-gray-100 bg-white p-1 shrink-0">
                            <div>
                                <span class="font-bold text-gray-900 block line-clamp-1">{{ $product->name }}</span>
                                <span class="text-xs text-gray-400">{{ $product->unit }} &bull; {{ $product->brand ?? 'Fresh House' }}</span>
                            </div>
                        </td>

                        <td class="px-4">
                            <span class="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                {{ $product->category->name ?? 'General' }}
                            </span>
                        </td>

                        <td class="px-4">
                            <div class="text-xs font-mono font-bold text-gray-800">{{ $product->sku }}</div>
                            <div class="text-[11px] font-mono text-gray-400 flex items-center space-x-1 mt-0.5">
                                <i class="fa-solid fa-barcode text-xs"></i>
                                <span>{{ $product->barcode }}</span>
                            </div>
                        </td>

                        <td class="px-4 font-black text-gray-900">
                            PKR {{ number_format($product->price, 0) }}
                        </td>

                        <td class="px-4 text-xs">
                            <div class="text-gray-600 font-mono">PKR {{ number_format($product->cost_price, 0) }}</div>
                            @php
                                $margin = $product->price > 0 ? round((($product->price - $product->cost_price) / $product->price) * 100) : 0;
                            @endphp
                            <span class="text-[11px] font-bold text-emerald-700">+{{ $margin }}% margin</span>
                        </td>

                        <td class="px-4">
                            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black 
                                {{ $product->stock_quantity <= $product->low_stock_threshold ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800' }}">
                                {{ $product->stock_quantity }} units
                            </span>
                        </td>

                        <td class="px-4">
                            <form action="{{ route('admin.products.availability', $product->id) }}" method="POST">
                                @csrf
                                @php $av = $product->availability ?? 'available'; @endphp
                                <select name="availability" onchange="this.form.submit()" title="Stays on the website; only the button changes"
                                    class="text-xs font-bold rounded-lg border px-2 py-1 cursor-pointer {{ $av === 'available' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : ($av === 'out_of_season' ? 'bg-yellow-50 border-yellow-300 text-yellow-800' : 'bg-rose-50 border-rose-200 text-rose-700') }}">
                                    @foreach(\App\Models\Product::AVAILABILITY as $key => $label)
                                        <option value="{{ $key }}" {{ $av === $key ? 'selected' : '' }}>{{ $label }}</option>
                                    @endforeach
                                </select>
                            </form>
                        </td>

                        <td class="px-6 text-right">
                            <div class="inline-flex items-center space-x-1.5">
                                <button type="button"
                                    onclick="openEditProduct(this)"
                                    data-action="{{ route('admin.products.save', $product->id) }}"
                                    data-product="{{ json_encode(array_merge($product->only(['name', 'slug', 'sku', 'barcode', 'brand', 'category_id', 'unit', 'price', 'compare_at_price', 'cost_price', 'primary_image', 'short_description', 'description', 'availability', 'is_active', 'is_featured', 'track_stock', 'low_stock_threshold', 'stock_quantity']), ['gallery' => $product->images->sortBy('sort_order')->pluck('image_url')->implode("\n")])) }}"
                                    class="px-2.5 py-1 rounded-lg bg-fresh-600 hover:bg-fresh-700 text-white text-xs font-bold transition flex items-center gap-1"
                                    title="Edit everything about this product: text, prices, pictures, codes and visibility">
                                    <i class="fa-solid fa-pen"></i>
                                    <span>Edit</span>
                                </button>

                                <form action="{{ route('admin.products.adjust_stock', $product->id) }}" method="POST" class="inline">
                                    @csrf
                                    <input type="hidden" name="change_qty" value="10">
                                    <input type="hidden" name="reason" value="restock">
                                    <button type="submit" class="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition" title="Add 10 units">
                                        +10
                                    </button>
                                </form>

                                <form action="{{ route('admin.products.adjust_stock', $product->id) }}" method="POST" class="inline">
                                    @csrf
                                    <input type="hidden" name="change_qty" value="50">
                                    <input type="hidden" name="reason" value="restock">
                                    <button type="submit" class="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition" title="Add 50 units">
                                        +50
                                    </button>
                                </form>

                                <button onclick="openStockModal({{ $product->id }}, '{{ addslashes($product->name) }}', {{ $product->stock_quantity }})" class="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs transition" title="Audit adjustment">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="8" class="text-center py-12 text-gray-400 text-xs">No products match your search.</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="p-6 border-t border-gray-100">
            {{ $products->links() }}
        </div>
    </div>
</div>

<!-- Modal for Custom Stock Adjustment -->
<div id="stockModal" class="fixed inset-0 bg-black/60 backdrop-blur-xs hidden items-center justify-center p-4 z-50">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <h3 class="font-black text-gray-900 text-lg mb-1" id="modalProductName">Adjust Inventory</h3>
        <p class="text-xs text-gray-500 mb-4 font-mono" id="modalCurrentStock">Current stock: 0 units</p>

        <form id="stockModalForm" method="POST" action="">
            @csrf
            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1">Stock Change Quantity</label>
                    <input type="number" name="change_qty" required placeholder="e.g. +20 or -5" class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-bold font-mono focus:border-fresh-500 focus:outline-none">
                    <span class="text-[11px] text-gray-400 mt-0.5 block">Use positive for restock, negative for deduction</span>
                </div>

                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1">Reason for Audit Log</label>
                    <select name="reason" class="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:outline-none bg-white">
                        <option value="restock">Supplier Restock</option>
                        <option value="adjustment">Physical Count Audit Adjustment</option>
                        <option value="damage">Damaged / Expired Item</option>
                        <option value="return">Customer Return</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1">Operator Notes</label>
                    <textarea name="notes" rows="2" placeholder="Optional notes for log..." class="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:outline-none"></textarea>
                </div>
            </div>

            <div class="flex justify-end space-x-3 mt-6">
                <button type="button" onclick="closeStockModal()" class="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                <button type="submit" class="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow">Save Changes</button>
            </div>
        </form>
    </div>
</div>

<!-- Modal: edit a product's details (what the website's product page shows) -->
<div id="editProductModal" role="dialog" aria-modal="true" aria-labelledby="editProductTitle" class="fixed inset-0 bg-black/60 backdrop-blur-xs hidden items-center justify-center p-4 z-50">
    <div class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
            <div>
                <h3 class="font-black text-gray-900 text-lg" id="editProductTitle">Edit Product</h3>
                <p class="text-xs text-gray-500">Saved changes appear on the website's product page straight away</p>
            </div>
            <button type="button" onclick="closeEditProduct()" aria-label="Close" class="w-11 h-11 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <form id="editProductForm" method="POST" action="" enctype="multipart/form-data" class="space-y-4">
            @csrf
            <p class="text-[11px] font-black uppercase tracking-wider text-gray-400 pt-2">Basics</p>
            <div>
                <label for="ep_name" class="block text-xs font-bold text-gray-700 mb-1">Product Title</label>
                <input id="ep_name" type="text" name="name" required maxlength="191" class="w-full px-3.5 h-11 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none">
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label for="ep_category_id" class="block text-xs font-bold text-gray-700 mb-1">Category</label>
                    <select id="ep_category_id" name="category_id" required class="w-full px-3.5 h-11 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none px-3 bg-white font-medium">
                        @foreach($categories as $cat)
                            <option value="{{ $cat->id }}">{{ $cat->name }}</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label for="ep_brand" class="block text-xs font-bold text-gray-700 mb-1">Brand</label>
                    <input id="ep_brand" type="text" name="brand" maxlength="100" placeholder="e.g. Fresh House" class="w-full px-3.5 h-11 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label for="ep_unit" class="block text-xs font-bold text-gray-700 mb-1">Pack Unit / Weight</label>
                    <input id="ep_unit" type="text" name="unit" maxlength="50" placeholder="e.g. 500g, 1 kg, 1 dozen" class="w-full px-3.5 h-11 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none">
                </div>
                <div>
                    <label for="ep_availability" class="block text-xs font-bold text-gray-700 mb-1">Availability</label>
                    <select id="ep_availability" name="availability" class="w-full px-3.5 h-11 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none px-3 bg-white font-medium">
                        @foreach(\App\Models\Product::AVAILABILITY as $key => $text)
                            <option value="{{ $key }}">{{ $text }}</option>
                        @endforeach
                    </select>
                </div>
            </div>

            <p class="text-[11px] font-black uppercase tracking-wider text-gray-400 pt-2">Prices</p>
            <div class="grid grid-cols-3 gap-3">
                <div>
                    <label for="ep_price" class="block text-xs font-bold text-gray-700 mb-1">Retail Price (PKR)</label>
                    <input id="ep_price" type="number" step="0.01" min="0" name="price" required class="w-full px-3.5 h-11 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none font-bold text-emerald-800">
                </div>
                <div>
                    <label for="ep_compare_at_price" class="block text-xs font-bold text-gray-700 mb-1">Was Price (PKR)</label>
                    <input id="ep_compare_at_price" type="number" step="0.01" min="0" name="compare_at_price" placeholder="Optional" title="Shown crossed out when higher than the retail price" class="w-full px-3.5 h-11 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none">
                </div>
                <div>
                    <label for="ep_cost_price" class="block text-xs font-bold text-gray-700 mb-1">Cost Price (PKR)</label>
                    <input id="ep_cost_price" type="number" step="0.01" min="0" name="cost_price" class="w-full px-3.5 h-11 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none">
                </div>
            </div>

            <p class="text-[11px] font-black uppercase tracking-wider text-gray-400 pt-2">Pictures</p>
            <div class="flex gap-3 items-start">
                <img id="ep_preview" src="" alt="" class="w-20 h-20 rounded-xl border border-gray-100 bg-white object-contain p-1 shrink-0">
                <div class="flex-1 min-w-0 space-y-2">
                    <div>
                        <label for="ep_primary_image" class="block text-xs font-bold text-gray-700 mb-1">Main Picture (web address)</label>
                        <input id="ep_primary_image" type="text" name="primary_image" maxlength="2048" placeholder="https://... or /uploads/..." class="w-full px-3.5 h-11 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none">
                    </div>
                    <div>
                        <label for="ep_primary_image_file" class="block text-xs font-bold text-gray-700 mb-1">…or upload a new main picture</label>
                        <input id="ep_primary_image_file" type="file" name="primary_image_file" accept="image/jpeg,image/png,image/webp,image/gif" class="block w-full text-xs text-gray-600 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-fresh-50 file:text-fresh-800 file:font-bold">
                        <span class="text-[11px] text-gray-400 mt-1 block">JPG, PNG, WebP or GIF, up to 5 MB. An upload replaces the address above.</span>
                    </div>
                </div>
            </div>
            <div>
                <label for="ep_gallery" class="block text-xs font-bold text-gray-700 mb-1">Extra Pictures on the Product Page</label>
                <textarea id="ep_gallery" name="gallery" rows="3" placeholder="One web address per line" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none font-mono"></textarea>
                <input id="ep_gallery_files" type="file" name="gallery_files[]" multiple accept="image/jpeg,image/png,image/webp,image/gif" class="mt-2 block w-full text-xs text-gray-600 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-fresh-50 file:text-fresh-800 file:font-bold">
                <span class="text-[11px] text-gray-400 mt-1 block">Delete a line to remove that picture. Uploaded files are added after the list (up to 12 at once).</span>
            </div>

            <p class="text-[11px] font-black uppercase tracking-wider text-gray-400 pt-2">Text on the Website</p>
            <div>
                <label for="ep_short_description" class="block text-xs font-bold text-gray-700 mb-1">Short Description</label>
                <textarea id="ep_short_description" name="short_description" rows="2" maxlength="1000" placeholder="One or two lines shown beside the price" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none"></textarea>
            </div>
            <div>
                <label for="ep_description" class="block text-xs font-bold text-gray-700 mb-1">Product Details</label>
                <textarea id="ep_description" name="description" rows="8" maxlength="20000" placeholder="Shown on the product page under &quot;Product Details&quot;. Line breaks are kept." class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none leading-relaxed"></textarea>
            </div>

            <p class="text-[11px] font-black uppercase tracking-wider text-gray-400 pt-2">Codes &amp; Web Address</p>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label for="ep_sku" class="block text-xs font-bold text-gray-700 mb-1">SKU</label>
                    <input id="ep_sku" type="text" name="sku" required maxlength="100" class="w-full px-3.5 h-11 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none font-mono">
                </div>
                <div>
                    <label for="ep_barcode" class="block text-xs font-bold text-gray-700 mb-1">Barcode</label>
                    <input id="ep_barcode" type="text" name="barcode" maxlength="100" class="w-full px-3.5 h-11 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none font-mono">
                </div>
            </div>
            <div>
                <label for="ep_slug" class="block text-xs font-bold text-gray-700 mb-1">Web Address</label>
                <div class="flex items-center rounded-xl border border-gray-200 focus-within:border-fresh-500 focus-within:ring-4 focus-within:ring-fresh-500/15">
                    <span class="pl-3.5 text-xs text-gray-400 shrink-0">/products/</span>
                    <input id="ep_slug" type="text" name="slug" required maxlength="191" pattern="[A-Za-z0-9_-]+" class="flex-1 min-w-0 px-1 h-11 rounded-xl text-xs font-mono focus:outline-none">
                </div>
                <span class="text-[11px] text-gray-400 mt-1 block">Letters, numbers and dashes. Changing it breaks links people saved to the old address.</span>
                <a id="ep_view" href="#" target="_blank" rel="noopener" class="inline-flex items-center gap-1 mt-1 text-xs font-bold text-fresh-700 hover:underline"><i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i> View on website</a>
            </div>

            <p class="text-[11px] font-black uppercase tracking-wider text-gray-400 pt-2">Stock &amp; Visibility</p>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <span class="block text-xs font-bold text-gray-700 mb-1">Stock</span>
                    <p id="ep_stock" class="h-11 px-3.5 rounded-xl bg-gray-50 border border-gray-100 text-xs font-bold text-gray-700 flex items-center"></p>
                    <span class="text-[11px] text-gray-400 mt-1 block">Change it with the +10 / +50 / adjust buttons, so every change is logged.</span>
                </div>
                <div>
                    <label for="ep_low_stock_threshold" class="block text-xs font-bold text-gray-700 mb-1">Low-Stock Alert At (units)</label>
                    <input id="ep_low_stock_threshold" type="number" min="0" step="1" name="low_stock_threshold" class="w-full px-3.5 h-11 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none">
                </div>
            </div>
            <div class="grid sm:grid-cols-3 gap-2">
                <label class="flex items-center gap-2 h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 cursor-pointer">
                    <input type="hidden" name="is_active" value="0"><input id="ep_is_active" type="checkbox" name="is_active" value="1" class="rounded text-fresh-600 focus:ring-0"> Show on website
                </label>
                <label class="flex items-center gap-2 h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 cursor-pointer">
                    <input type="hidden" name="is_featured" value="0"><input id="ep_is_featured" type="checkbox" name="is_featured" value="1" class="rounded text-fresh-600 focus:ring-0"> Featured
                </label>
                <label class="flex items-center gap-2 h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 cursor-pointer">
                    <input type="hidden" name="track_stock" value="0"><input id="ep_track_stock" type="checkbox" name="track_stock" value="1" class="rounded text-fresh-600 focus:ring-0"> Track stock
                </label>
            </div>

            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onclick="closeEditProduct()" class="px-4 h-11 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100">Cancel</button>
                <button type="submit" class="px-6 h-11 rounded-xl text-xs font-bold bg-fresh-600 hover:bg-fresh-700 active:bg-fresh-800 text-white shadow-lg shadow-fresh-600/30">Save Changes</button>
            </div>
        </form>
    </div>
</div>

<script>
    function openEditProduct(btn) {
        const p = JSON.parse(btn.dataset.product);
        const form = document.getElementById('editProductForm');
        form.action = btn.dataset.action;
        ['name', 'slug', 'sku', 'barcode', 'brand', 'category_id', 'unit', 'availability', 'price', 'compare_at_price', 'cost_price', 'primary_image', 'gallery', 'short_description', 'description', 'low_stock_threshold'].forEach(function (key) {
            const field = document.getElementById('ep_' + key);
            if (field) field.value = p[key] === null || p[key] === undefined ? '' : p[key];
        });
        if (!p.availability) document.getElementById('ep_availability').value = 'available';
        ['is_active', 'is_featured', 'track_stock'].forEach(function (key) {
            document.getElementById('ep_' + key).checked = !!Number(p[key]);
        });
        ['ep_primary_image_file', 'ep_gallery_files'].forEach(function (id) { document.getElementById(id).value = ''; });
        document.getElementById('ep_preview').src = p.primary_image || '';
        document.getElementById('ep_stock').innerText = p.stock_quantity + ' units';
        document.getElementById('ep_view').href = '/products/' + encodeURIComponent(p.slug);
        document.getElementById('editProductTitle').innerText = 'Edit: ' + p.name;
        const modal = document.getElementById('editProductModal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.getElementById('ep_name').focus();
    }

    function closeEditProduct() {
        const modal = document.getElementById('editProductModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeEditProduct();
    });

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

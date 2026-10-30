@extends('admin.layout')

@section('content')
<div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <div class="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-1">
                <span>Inventory & Catalog</span>
                <i class="fa-solid fa-chevron-right text-[10px]"></i>
                <span class="text-fresh-700">Categories</span>
            </div>
            <h2 class="text-2xl font-black text-slate-900 tracking-tight">Supermarket Category Management</h2>
            <p class="text-xs text-slate-500">Configure catalog departments, department banners, and product taxonomy across the Online Store{{ config('features.pos') ? ' and POS' : '' }}</p>
        </div>

        <div class="flex items-center space-x-3">
            <button
                onclick="openCategoryModal()"
                class="bg-fresh-600 hover:bg-fresh-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-fresh-600/30 flex items-center gap-1.5 transition"
            >
                <i class="fa-solid fa-plus"></i>
                <span>Add Department</span>
            </button>
        </div>
    </div>

    <!-- Quick Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Catalog Departments</span>
                <h3 class="text-2xl font-black text-slate-900 mt-1">{{ $totalCategories }} Categories</h3>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-fresh-50 text-fresh-600 flex items-center justify-center text-lg">
                <i class="fa-solid fa-layer-group"></i>
            </div>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Products Mapped</span>
                <h3 class="text-2xl font-black text-emerald-800 mt-1">{{ $totalProductsCount }} SKUs</h3>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                <i class="fa-solid fa-boxes-stacked"></i>
            </div>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Products / Category</span>
                @php
                    $avgPerCat = $totalCategories > 0 ? round($totalProductsCount / $totalCategories) : 0;
                @endphp
                <h3 class="text-2xl font-black text-indigo-700 mt-1">~{{ $avgPerCat }} Items</h3>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
                <i class="fa-solid fa-calculator"></i>
            </div>
        </div>
    </div>

    <!-- Search Bar -->
    <div class="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <form action="{{ route('admin.categories') }}" method="GET" class="flex items-center gap-3">
            <div class="relative flex-1">
                <input
                    type="text"
                    name="search"
                    value="{{ request('search') }}"
                    placeholder="Search category by name or slug..."
                    class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-fresh-500 focus:outline-none transition"
                />
                <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
            </div>
            <button type="submit" class="bg-fresh-600 hover:bg-fresh-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition">
                Search
            </button>
        </form>
    </div>

    <!-- Categories Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        @forelse($categories as $category)
        <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between group">
            <div>
                <div class="flex items-center justify-between mb-3">
                    <div class="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1.5 overflow-hidden">
                        @if($category->image_url)
                            <img src="{{ $category->image_url }}" alt="{{ $category->name }}" class="w-full h-full object-contain">
                        @else
                            <i class="fa-solid fa-basket-shopping text-emerald-600 text-lg"></i>
                        @endif
                    </div>
                    <span class="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                        {{ $category->products_count }} items
                    </span>
                </div>

                <h4 class="font-black text-slate-900 text-sm group-hover:text-fresh-700 transition">{{ $category->name }}</h4>
                <span class="text-[11px] font-mono text-slate-400 block mt-0.5">/category/{{ $category->slug }}</span>
            </div>

            <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <a href="{{ route('admin.products', ['category' => $category->id]) }}" class="text-slate-600 hover:text-fresh-700 font-bold flex items-center gap-1">
                    <span>View SKUs</span>
                    <i class="fa-solid fa-arrow-right text-[10px]"></i>
                </a>

                <button onclick="editCategory({{ $category->toJson() }})" class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition" title="Edit Department">
                    <i class="fa-solid fa-pen-to-square text-xs"></i>
                </button>
            </div>
        </div>
        @empty
        <div class="col-span-4 text-center py-12 text-slate-400 text-xs">
            No categories found matching your query.
        </div>
        @endforelse
    </div>

    <div class="mt-4">
        {{ $categories->links() }}
    </div>
</div>

<!-- Category Modal -->
<div id="categoryModal" class="fixed inset-0 bg-black/60 backdrop-blur-xs hidden items-center justify-center p-4 z-50">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <h3 class="font-black text-slate-900 text-lg mb-1" id="categoryModalTitle">Add Department</h3>
        <p class="text-xs text-slate-500 mb-4">Syncs with online storefront navigation{{ config('features.pos') ? ' and POS department breakdown' : '' }}</p>

        <form id="categoryModalForm" method="POST" action="{{ route('admin.categories.save') }}" class="space-y-4">
            @csrf
            <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Department Name</label>
                <input type="text" name="name" id="modalCategoryName" required placeholder="e.g. Organic Dairy & Farm Eggs" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-fresh-500 focus:outline-none">
            </div>

            <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Icon / Image URL</label>
                <input type="url" name="image_url" id="modalCategoryImg" placeholder="https://cdn.shopify.com/..." class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-fresh-500 focus:outline-none">
            </div>

            <div class="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onclick="closeCategoryModal()" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
                <button type="submit" class="px-5 py-2.5 rounded-xl text-xs font-bold bg-fresh-600 hover:bg-fresh-700 text-white shadow-md shadow-fresh-600/30">Save Department</button>
            </div>
        </form>
    </div>
</div>

<script>
    function openCategoryModal() {
        document.getElementById('categoryModalTitle').innerText = 'Add New Department';
        document.getElementById('categoryModalForm').action = "{{ route('admin.categories.save') }}";
        document.getElementById('modalCategoryName').value = '';
        document.getElementById('modalCategoryImg').value = '';
        document.getElementById('categoryModal').classList.remove('hidden');
        document.getElementById('categoryModal').classList.add('flex');
    }

    function editCategory(cat) {
        document.getElementById('categoryModalTitle').innerText = 'Edit Department: ' + cat.name;
        document.getElementById('categoryModalForm').action = "/admin/categories/save/" + cat.id;
        document.getElementById('modalCategoryName').value = cat.name;
        document.getElementById('modalCategoryImg').value = cat.image_url || '';
        document.getElementById('categoryModal').classList.remove('hidden');
        document.getElementById('categoryModal').classList.add('flex');
    }

    function closeCategoryModal() {
        document.getElementById('categoryModal').classList.add('hidden');
        document.getElementById('categoryModal').classList.remove('flex');
    }
</script>
@endsection

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fresh Basket Pakistan — Enterprise Admin CRM & POS Command Center</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- FontAwesome 6 Pro-style icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <!-- Chart.js for executive analytics -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        fresh: {
                            50: '#f0fdf4',
                            100: '#dcfce7',
                            200: '#bbf7d0',
                            300: '#86efac',
                            400: '#4ade80',
                            500: '#22c55e',
                            600: '#16a34a',
                            700: '#15803d',
                            800: '#166534',
                            900: '#14532d',
                            950: '#062d16',
                        }
                    }
                }
            }
        }
    </script>
    <style>
        /* Smooth scrollbars */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f8fafc; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
    </style>
</head>
<body class="bg-[#f8fafc] text-slate-800 font-sans antialiased min-h-screen flex flex-col selection:bg-fresh-600 selection:text-white">

    <div class="flex flex-1 min-h-screen">
        <!-- Sidebar -->
        <aside class="w-72 bg-gradient-to-b from-[#062d16] via-[#09351b] to-[#041d0e] text-white flex flex-col shrink-0 border-r border-emerald-900/60 shadow-2xl relative z-20">
            <!-- Brand Section -->
            <div class="p-6 border-b border-emerald-900/50 flex items-center justify-between">
                <div class="flex items-center space-x-3.5">
                    <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-fresh-400 to-fresh-600 flex items-center justify-center text-white text-xl shadow-lg shadow-fresh-500/30">
                        <i class="fa-solid fa-basket-shopping"></i>
                    </div>
                    <div>
                        <div class="flex items-center space-x-1">
                            <span class="font-black text-lg tracking-tight text-white">FRESH</span>
                            <span class="font-black text-lg tracking-tight text-fresh-400">BASKET</span>
                        </div>
                        <span class="text-[10px] text-emerald-300 font-semibold tracking-wider uppercase block">CRM & POS COMMAND</span>
                    </div>
                </div>
            </div>

            <!-- Navigation Menu -->
            <nav class="flex-1 p-4 space-y-6 overflow-y-auto">
                <!-- Group 1: Operations -->
                <div>
                    <span class="px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-400/70">Operations & Sales</span>
                    <div class="mt-2 space-y-1">
                        <a href="{{ route('admin.dashboard') }}" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition {{ request()->routeIs('admin.dashboard') ? 'bg-fresh-600 text-white shadow-lg shadow-fresh-600/30 font-bold' : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white' }}">
                            <div class="flex items-center space-x-3">
                                <i class="fa-solid fa-chart-line w-4 text-center"></i>
                                <span>Executive Dashboard</span>
                            </div>
                            <i class="fa-solid fa-angle-right text-[10px] opacity-60"></i>
                        </a>

                        <a href="{{ route('admin.orders') }}" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition {{ request()->routeIs('admin.orders') ? 'bg-fresh-600 text-white shadow-lg shadow-fresh-600/30 font-bold' : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white' }}">
                            <div class="flex items-center space-x-3">
                                <i class="fa-solid fa-bag-shopping w-4 text-center"></i>
                                <span>Orders & COD Collection</span>
                            </div>
                            <span class="bg-amber-400/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-bold">Active</span>
                        </a>

                        <a href="{{ route('admin.pos') }}" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition {{ request()->routeIs('admin.pos') ? 'bg-fresh-600 text-white shadow-lg shadow-fresh-600/30 font-bold' : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white' }}">
                            <div class="flex items-center space-x-3">
                                <i class="fa-solid fa-cash-register w-4 text-center text-fresh-300"></i>
                                <span>POS Cashier Terminal</span>
                            </div>
                            <span class="bg-fresh-500/20 text-fresh-300 text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">Counter</span>
                        </a>
                    </div>
                </div>

                <!-- Group 2: Inventory & Catalog -->
                <div>
                    <span class="px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-400/70">Inventory & Products</span>
                    <div class="mt-2 space-y-1">
                        <a href="{{ route('admin.products') }}" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition {{ request()->routeIs('admin.products') ? 'bg-fresh-600 text-white shadow-lg shadow-fresh-600/30 font-bold' : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white' }}">
                            <div class="flex items-center space-x-3">
                                <i class="fa-solid fa-boxes-stacked w-4 text-center"></i>
                                <span>Products & Stock Levels</span>
                            </div>
                            <i class="fa-solid fa-angle-right text-[10px] opacity-60"></i>
                        </a>

                        <a href="{{ route('admin.inventory_logs') }}" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition {{ request()->routeIs('admin.inventory_logs') ? 'bg-fresh-600 text-white shadow-lg shadow-fresh-600/30 font-bold' : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white' }}">
                            <div class="flex items-center space-x-3">
                                <i class="fa-solid fa-arrow-right-arrow-left w-4 text-center"></i>
                                <span>POS / Stock Movement Logs</span>
                            </div>
                            <i class="fa-solid fa-angle-right text-[10px] opacity-60"></i>
                        </a>
                    </div>
                </div>

                <!-- Group 3: Customer Relationship (CRM) -->
                <div>
                    <span class="px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-400/70">Customer Care & CRM</span>
                    <div class="mt-2 space-y-1">
                        <a href="{{ route('admin.customers') }}" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition {{ request()->routeIs('admin.customers') ? 'bg-fresh-600 text-white shadow-lg shadow-fresh-600/30 font-bold' : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white' }}">
                            <div class="flex items-center space-x-3">
                                <i class="fa-solid fa-users-gear w-4 text-center"></i>
                                <span>Customer Directory 360</span>
                            </div>
                            <i class="fa-solid fa-angle-right text-[10px] opacity-60"></i>
                        </a>

                        <a href="{{ route('admin.leads') }}" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition {{ request()->routeIs('admin.leads') ? 'bg-fresh-600 text-white shadow-lg shadow-fresh-600/30 font-bold' : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white' }}">
                            <div class="flex items-center space-x-3">
                                <i class="fa-solid fa-headset w-4 text-center"></i>
                                <span>Support Tickets & Leads</span>
                            </div>
                            <i class="fa-solid fa-angle-right text-[10px] opacity-60"></i>
                        </a>
                    </div>
                </div>
            </nav>

            <!-- Bottom System Status -->
            <div class="p-4 border-t border-emerald-900/50 space-y-2">
                <div class="bg-black/30 backdrop-blur-md p-3 rounded-2xl border border-white/5 text-xs space-y-1.5">
                    <div class="flex items-center justify-between">
                        <span class="text-emerald-400 font-semibold flex items-center gap-1.5">
                            <span class="w-2 h-2 rounded-full bg-fresh-400 animate-ping"></span>
                            MySQL POS Sync
                        </span>
                        <span class="text-[10px] font-mono text-emerald-300">Port 3307</span>
                    </div>
                    <p class="text-[11px] text-emerald-200/70">Live bi-directional sync ready for store barcode terminals.</p>
                </div>
            </div>
        </aside>

        <!-- Main Workspace -->
        <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
            <!-- Top Header -->
            <header class="bg-white border-b border-gray-200/80 px-8 py-4 flex items-center justify-between shadow-xs sticky top-0 z-10">
                <div class="flex items-center space-x-4">
                    <div>
                        <h2 class="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                            <span>Fresh Basket Pakistan Operations Hub</span>
                        </h2>
                        <div class="flex items-center space-x-3 text-xs text-gray-500 mt-0.5 font-medium">
                            <span class="flex items-center gap-1 text-fresh-700">
                                <i class="fa-solid fa-circle text-[7px] text-fresh-600"></i> Karachi Central Warehouse
                            </span>
                            <span>&bull;</span>
                            <span id="liveClock" class="font-mono text-gray-600">Loading time...</span>
                        </div>
                    </div>
                </div>

                <!-- Topbar Actions -->
                <div class="flex items-center space-x-3">
                    <!-- Quick Add Product Trigger -->
                    <button
                        onclick="document.getElementById('quickAddProductModal').classList.remove('hidden'); document.getElementById('quickAddProductModal').classList.add('flex');"
                        class="bg-fresh-600 hover:bg-fresh-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-fresh-600/20 flex items-center gap-1.5 transition"
                    >
                        <i class="fa-solid fa-plus"></i>
                        <span>New Product</span>
                    </button>

                    <!-- POS Terminal Shortcut -->
                    <a
                        href="{{ route('admin.pos') }}"
                        class="bg-emerald-950 hover:bg-black text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
                    >
                        <i class="fa-solid fa-barcode text-fresh-400"></i>
                        <span>POS Terminal</span>
                    </a>

                    <!-- View Storefront -->
                    <a
                        href="http://localhost:3000"
                        target="_blank"
                        class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                        <i class="fa-solid fa-arrow-up-right-from-square text-xs text-gray-500"></i>
                        <span class="hidden sm:inline">Storefront</span>
                    </a>

                    <!-- Admin Profile Pill -->
                    <div class="flex items-center space-x-2 pl-3 border-l border-gray-200">
                        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-700 to-fresh-800 text-white font-black flex items-center justify-center text-xs shadow-xs">
                            FB
                        </div>
                        <div class="hidden md:block text-left">
                            <span class="block text-xs font-bold text-gray-900 leading-tight">Administrator</span>
                            <span class="block text-[10px] text-gray-400 leading-tight">admin@freshbasket.com.pk</span>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Success Alert -->
            @if(session('success'))
                <div class="mx-8 mt-6 p-4 rounded-2xl bg-fresh-50 border border-fresh-200 text-fresh-800 flex items-center justify-between shadow-xs">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 rounded-xl bg-fresh-500 text-white flex items-center justify-center font-bold text-sm">
                            <i class="fa-solid fa-check"></i>
                        </div>
                        <span class="text-xs font-bold">{{ session('success') }}</span>
                    </div>
                    <button onclick="this.parentElement.remove()" class="text-fresh-700 hover:text-fresh-900">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            @endif

            <!-- Main Content Container -->
            <main class="flex-1 overflow-y-auto p-8">
                @yield('content')
            </main>
        </div>
    </div>

    <!-- Quick Add Product Modal -->
    <div id="quickAddProductModal" class="fixed inset-0 bg-black/60 backdrop-blur-xs hidden items-center justify-center p-4 z-50">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <div>
                    <h3 class="font-black text-gray-900 text-lg">Add New Fresh Basket Product</h3>
                    <p class="text-xs text-gray-500">Item will be synced across Online Storefront & POS Counter</p>
                </div>
                <button
                    onclick="document.getElementById('quickAddProductModal').classList.add('hidden'); document.getElementById('quickAddProductModal').classList.remove('flex');"
                    class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center"
                >
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <form action="{{ route('admin.products.save') }}" method="POST" class="space-y-4">
                @csrf
                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1">Product Title</label>
                    <input type="text" name="name" required placeholder="e.g. Organic Strawberries (250g)" class="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:outline-none">
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-bold text-gray-700 mb-1">Category</label>
                        <select name="category_id" required class="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:outline-none bg-white">
                            @foreach(\App\Models\Category::orderBy('name')->get() as $cat)
                                <option value="{{ $cat->id }}">{{ $cat->name }}</option>
                            @endforeach
                        </select>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-700 mb-1">Pack Unit / Weight</label>
                        <input type="text" name="unit" placeholder="e.g. 500g, 1 kg, 1 dozen" class="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:outline-none">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-bold text-gray-700 mb-1">Retail Price (PKR)</label>
                        <input type="number" step="0.01" name="price" required placeholder="PKR 450" class="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:outline-none font-bold">
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-700 mb-1">Supplier Cost Price (PKR)</label>
                        <input type="number" step="0.01" name="cost_price" placeholder="PKR 350" class="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:outline-none">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-bold text-gray-700 mb-1">Initial Stock (Units)</label>
                        <input type="number" name="stock_quantity" value="50" required class="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:outline-none font-bold">
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-700 mb-1">Barcode (EAN-13)</label>
                        <input type="text" name="barcode" placeholder="Optional (Auto-generated)" class="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-mono focus:border-fresh-500 focus:outline-none">
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1">Image URL</label>
                    <input type="url" name="primary_image" placeholder="https://cdn.shopify.com/..." class="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:outline-none">
                </div>

                <div class="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onclick="document.getElementById('quickAddProductModal').classList.add('hidden'); document.getElementById('quickAddProductModal').classList.remove('flex');"
                        class="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        class="px-6 py-2.5 rounded-xl text-xs font-bold bg-fresh-600 hover:bg-fresh-700 text-white shadow-lg shadow-fresh-600/30"
                    >
                        Save & Add to Catalog
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Live Clock Script -->
    <script>
        function updateClock() {
            const now = new Date();
            const options = { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, weekday: 'short', month: 'short', day: 'numeric' };
            const timeStr = new Intl.DateTimeFormat('en-US', options).format(now);
            const el = document.getElementById('liveClock');
            if (el) el.innerText = timeStr + ' (PKT)';
        }
        setInterval(updateClock, 1000);
        updateClock();
    </script>
</body>
</html>

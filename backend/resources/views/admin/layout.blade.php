<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fresh Basket Admin CRM & Control Panel</title>
    <!-- Tailwind CSS CDN for instant, zero-build admin styling -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        fresh: {
                            50: '#f0fdf4',
                            100: '#dcfce7',
                            500: '#22c55e',
                            600: '#16a34a',
                            700: '#15803d',
                            800: '#166534',
                            900: '#14532d',
                        }
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50 text-gray-800 font-sans antialiased min-h-screen flex flex-col">

    <div class="flex flex-1">
        <!-- Sidebar -->
        <aside class="w-64 bg-emerald-950 text-white flex flex-col shrink-0 shadow-xl border-r border-emerald-900">
            <div class="p-6 border-b border-emerald-900/50 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-xl bg-fresh-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        <i class="fa-solid fa-basket-shopping"></i>
                    </div>
                    <div>
                        <h1 class="font-bold text-lg leading-tight tracking-wide">Fresh Basket</h1>
                        <span class="text-xs text-fresh-400 font-medium">CRM & POS Control</span>
                    </div>
                </div>
            </div>

            <!-- Navigation Links -->
            <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
                <a href="{{ route('admin.dashboard') }}" class="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition {{ request()->routeIs('admin.dashboard') ? 'bg-fresh-600 text-white shadow-md' : 'text-emerald-200 hover:bg-emerald-900/60 hover:text-white' }}">
                    <i class="fa-solid fa-chart-pie w-5"></i>
                    <span>Dashboard</span>
                </a>

                <a href="{{ route('admin.orders') }}" class="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition {{ request()->routeIs('admin.orders') ? 'bg-fresh-600 text-white shadow-md' : 'text-emerald-200 hover:bg-emerald-900/60 hover:text-white' }}">
                    <div class="flex items-center space-x-3">
                        <i class="fa-solid fa-bag-shopping w-5"></i>
                        <span>Orders (COD)</span>
                    </div>
                    <span class="bg-emerald-800/80 text-emerald-200 text-xs px-2 py-0.5 rounded-full font-semibold">Active</span>
                </a>

                <a href="{{ route('admin.products') }}" class="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition {{ request()->routeIs('admin.products') ? 'bg-fresh-600 text-white shadow-md' : 'text-emerald-200 hover:bg-emerald-900/60 hover:text-white' }}">
                    <i class="fa-solid fa-boxes-stacked w-5"></i>
                    <span>Products & Stock</span>
                </a>

                <a href="{{ route('admin.customers') }}" class="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition {{ request()->routeIs('admin.customers') ? 'bg-fresh-600 text-white shadow-md' : 'text-emerald-200 hover:bg-emerald-900/60 hover:text-white' }}">
                    <i class="fa-solid fa-users w-5"></i>
                    <span>Customers CRM</span>
                </a>

                <a href="{{ route('admin.inventory_logs') }}" class="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition {{ request()->routeIs('admin.inventory_logs') ? 'bg-fresh-600 text-white shadow-md' : 'text-emerald-200 hover:bg-emerald-900/60 hover:text-white' }}">
                    <i class="fa-solid fa-arrow-right-arrow-left w-5"></i>
                    <span>POS / Stock Logs</span>
                </a>

                <a href="{{ route('admin.leads') }}" class="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition {{ request()->routeIs('admin.leads') ? 'bg-fresh-600 text-white shadow-md' : 'text-emerald-200 hover:bg-emerald-900/60 hover:text-white' }}">
                    <i class="fa-solid fa-headset w-5"></i>
                    <span>Customer Inquiries</span>
                </a>
            </nav>

            <!-- Store & POS Status -->
            <div class="p-4 border-t border-emerald-900/50">
                <div class="bg-emerald-900/40 p-3 rounded-xl flex items-center justify-between">
                    <div>
                        <p class="text-xs text-emerald-300 font-medium">POS Terminal Ready</p>
                        <p class="text-xs text-emerald-400">Port 3307 MySQL Sync</p>
                    </div>
                    <span class="inline-block w-2.5 h-2.5 rounded-full bg-fresh-400 animate-pulse"></span>
                </div>
            </div>
        </aside>

        <!-- Main Body -->
        <div class="flex-1 flex flex-col overflow-hidden">
            <!-- Topbar -->
            <header class="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
                <div>
                    <h2 class="text-xl font-bold text-gray-800">Fresh Basket Operations & CRM</h2>
                    <p class="text-xs text-gray-500">Live Storefront & POS Inventory Hub (Karachi, PK)</p>
                </div>
                <div class="flex items-center space-x-4">
                    <a href="http://localhost:3000" target="_blank" class="inline-flex items-center space-x-2 bg-emerald-50 hover:bg-emerald-100 text-fresh-700 text-xs font-semibold px-3 py-2 rounded-lg border border-emerald-200 transition">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i>
                        <span>Visit Storefront</span>
                    </a>
                    <div class="flex items-center space-x-2 border-l pl-4 border-gray-200">
                        <div class="w-8 h-8 rounded-full bg-fresh-600 text-white font-bold flex items-center justify-center text-xs">
                            AD
                        </div>
                        <span class="text-sm font-medium text-gray-700">Admin</span>
                    </div>
                </div>
            </header>

            <!-- Flash Alert -->
            @if(session('success'))
                <div class="mx-8 mt-4 p-4 rounded-xl bg-fresh-50 border border-fresh-200 text-fresh-800 flex items-center justify-between shadow-sm">
                    <div class="flex items-center space-x-2">
                        <i class="fa-solid fa-circle-check text-fresh-600 text-lg"></i>
                        <span class="text-sm font-medium">{{ session('success') }}</span>
                    </div>
                    <button onclick="this.parentElement.remove()" class="text-fresh-600 hover:text-fresh-800 text-sm">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            @endif

            <!-- Content Area -->
            <main class="flex-1 overflow-y-auto p-8 bg-gray-50">
                @yield('content')
            </main>
        </div>
    </div>

</body>
</html>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fresh House — Admin CRM &amp; POS</title>
    <!-- Favicon -->
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" href="/icon-512.png">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <meta name="theme-color" content="#101e10">
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Google Fonts: Plus Jakarta Sans -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <!-- FontAwesome 6 Pro-style icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <!-- Chart.js for executive analytics -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        // Brand palette sampled from the Fresh House logo (same values as the storefront): leaf green #478f45, apple red #b20f0b
        const FRESH = {
            50: '#f3f7f3', 100: '#e7efe6', 200: '#cde0cc', 300: '#a5cca4', 400: '#6db26c', 500: '#478f45',
            600: '#3a7538', 700: '#2e5d2d', 800: '#254724', 900: '#1d361c', 950: '#101e10',
        };
        const BRAND = {
            50: '#fdf2f1', 100: '#fce4e4', 200: '#f9c9c8', 300: '#f69a98', 400: '#f44d48', 500: '#d4261e',
            600: '#b20f0b', 700: '#950d09', 800: '#750d0a', 900: '#570c0a', 950: '#2e0605',
        };
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
                    },
                    colors: {
                        fresh: FRESH,
                        brand: BRAND,
                        // Existing views use the default green hues; point them at the logo green. Status colours that carry
                        // meaning (amber = pending, blue/indigo/purple = in progress) are left alone; danger reds use the logo red.
                        emerald: FRESH, green: FRESH, teal: FRESH, lime: FRESH,
                        rose: BRAND, red: BRAND,
                    },
                    // Tailwind v3 (CDN) has no xs / 2xs shadows or blur, and no fade-in animation; the views use them.
                    boxShadow: {
                        '2xs': '0 1px 0 0 rgb(15 23 42 / 0.04)',
                        xs: '0 1px 2px 0 rgb(15 23 42 / 0.06)',
                    },
                    backdropBlur: { xs: '2px' },
                    keyframes: {
                        fadeIn: { '0%': { opacity: '0', transform: 'translateY(-6px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
                        menuIn: { '0%': { opacity: '0', transform: 'translateY(8px) scale(0.98)' }, '100%': { opacity: '1', transform: 'translateY(0) scale(1)' } },
                    },
                    animation: {
                        'fade-in': 'fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
                        'menu-in': 'menuIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
                    },
                }
            }
        }
    </script>
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        html { scroll-behavior: smooth; }
        /* Keyboard focus: visible ring on every control, none for mouse clicks */
        :focus-visible { outline: 2px solid #478f45; outline-offset: 2px; }
        input:focus-visible, select:focus-visible, textarea:focus-visible { outline-offset: 0; }
        .skip-link { position: absolute; left: 12px; top: -64px; z-index: 100; background: #101e10; color: #fff; padding: 10px 16px; border-radius: 12px; font-size: 13px; font-weight: 700; transition: top .2s; }
        .skip-link:focus { top: 12px; }
        /* Buttons respond to press as well as hover */
        button:not(:disabled) { transition-property: color, background-color, border-color, box-shadow, transform, opacity; transition-duration: .15s; }
        button:not(:disabled):active { transform: scale(.97); }
        button:disabled { cursor: not-allowed; }
        /* Tables: row hover */
        tbody tr { transition: background-color .15s; }
        tbody tr:hover { background-color: rgb(243 247 243 / .7); }
        /* Data tables scroll sideways on phones instead of squeezing every column to a sliver */
        @media (max-width: 767px) { main .overflow-x-auto > table { min-width: 820px; } }
        /* Stops iOS from zooming into small inputs */
        @media (max-width: 640px) { input, select, textarea { font-size: 16px !important; } }
        /* Touch screens: comfortable targets for the dense admin controls (tables, filters, status buttons) */
        @media (pointer: coarse) {
            aside nav a { min-height: 44px; }
            main button, main select, main a[class*="rounded"], main a[class*="flex"], main input:not([type=checkbox]):not([type=radio]):not([type=hidden]), header a, header button { min-height: 40px; }
            main button:not([class*="w-"]), header button:not([class*="w-"]) { min-width: 40px; }
            main input[type=checkbox], main input[type=radio] { width: 20px; height: 20px; }
        }
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
        }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f8fafc; }
        ::-webkit-scrollbar-thumb { background: #a5cca4; border-radius: 9999px; }
        .glass-header {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
        }
        .badge-pulse {
            position: relative;
        }
        .badge-pulse::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            border-radius: inherit;
            background: inherit;
            animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
            z-index: -1;
        }
        @keyframes pulse-ring {
            0% { transform: scale(0.95); opacity: 0.8; }
            100% { transform: scale(1.4); opacity: 0; }
        }
    </style>
</head>
<body class="bg-[#f3f6f3] text-slate-800 font-sans antialiased min-h-screen flex flex-col selection:bg-fresh-600 selection:text-white">

    <a href="#admin-main" class="skip-link">Skip to content</a>
    <div class="flex flex-1 min-h-screen">
        <!-- Mobile Backdrop Overlay -->
        <div id="sidebarBackdrop" onclick="toggleSidebar()" class="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 hidden lg:hidden"></div>

        <!-- Sidebar (Hidden by default on mobile, slide-over drawer) -->
        <aside id="adminSidebar" class="hidden lg:flex fixed lg:static inset-y-0 left-0 w-72 bg-gradient-to-b from-fresh-950 via-[#17301a] to-[#0b160b] text-white flex-col shrink-0 border-r border-fresh-950 shadow-2xl z-50 lg:z-30 transition-all duration-300">
            <!-- Brand Section -->
            <div class="p-6 border-b border-emerald-900/40 flex items-center justify-between">
                <a href="{{ route('admin.dashboard') }}" class="flex flex-col gap-2 group" aria-label="Fresh House admin home">
                    <span class="bg-white rounded-xl px-3 py-2 shadow-lg shadow-black/20 group-hover:shadow-black/30 transition">
                        <img src="/logo.png" alt="Fresh House" width="150" height="34" class="h-8 w-auto">
                    </span>
                    <span class="flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-fresh-400 animate-pulse"></span>
                        <span class="text-[10px] text-fresh-300 font-bold tracking-widest uppercase">Admin CRM &amp; POS</span>
                    </span>
                </a>
                <button onclick="toggleSidebar()" aria-label="Close menu" class="lg:hidden text-emerald-400/80 hover:text-white w-11 h-11 flex items-center justify-center rounded-xl hover:bg-white/10 transition">
                    <i class="fa-solid fa-xmark text-lg"></i>
                </button>
            </div>

            <!-- Fast Action Badge Strip -->
            <div class="px-5 pt-4 pb-2">
                <div class="bg-white/5 border border-white/10 rounded-2xl p-2.5 flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 badge-pulse"></span>
                        <span class="text-xs font-bold text-emerald-100">POS Core Engine</span>
                    </div>
                    <span class="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800">MariaDB 3307</span>
                </div>
            </div>

            <!-- Navigation Menu -->
            <nav class="flex-1 px-4 py-3 space-y-6 overflow-y-auto">
                <!-- Group 1: Operations -->
                <div>
                    <span class="px-3 text-[10px] font-black uppercase tracking-widest text-emerald-400/60">Operations & Sales</span>
                    <div class="mt-2 space-y-1">
                        <a href="{{ route('admin.dashboard') }}" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition {{ request()->routeIs('admin.dashboard') ? 'bg-fresh-600 text-white shadow-lg shadow-fresh-600/30' : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white' }}">
                            <div class="flex items-center space-x-3">
                                <i class="fa-solid fa-chart-pie w-4 text-center"></i>
                                <span>Executive Dashboard</span>
                            </div>
                            <i class="fa-solid fa-chevron-right text-[10px] opacity-60"></i>
                        </a>

                        <a href="{{ route('admin.orders') }}" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition {{ request()->routeIs('admin.orders') ? 'bg-fresh-600 text-white shadow-lg shadow-fresh-600/30' : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white' }}">
                            <div class="flex items-center space-x-3">
                                <i class="fa-solid fa-truck-ramp-box w-4 text-center"></i>
                                <span>Orders & COD Dispatch</span>
                            </div>
                            <span class="bg-amber-400 text-slate-900 text-[10px] px-2 py-0.5 rounded-full font-black">COD</span>
                        </a>

                        <a href="{{ route('admin.riders') }}" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition {{ request()->routeIs('admin.riders') ? 'bg-fresh-600 text-white shadow-lg shadow-fresh-600/30' : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white' }}">
                            <div class="flex items-center space-x-3">
                                <i class="fa-solid fa-motorcycle w-4 text-center text-emerald-300"></i>
                                <span>Riders & Fleet Dispatch</span>
                            </div>
                            <span class="text-[10px] text-emerald-300 font-mono">Fleet</span>
                        </a>

                        <a href="{{ route('admin.pos') }}" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition {{ request()->routeIs('admin.pos') ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20' : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white' }}">
                            <div class="flex items-center space-x-3">
                                <i class="fa-solid fa-cash-register w-4 text-center text-amber-300"></i>
                                <span>POS Cashier Counter</span>
                            </div>
                            <span class="bg-emerald-400 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">Store</span>
                        </a>
                    </div>
                </div>

                <!-- Group 2: Inventory & Catalog -->
                <div>
                    <span class="px-3 text-[10px] font-black uppercase tracking-widest text-emerald-400/60">Inventory & Catalog</span>
                    <div class="mt-2 space-y-1">
                        <a href="{{ route('admin.products') }}" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition {{ request()->routeIs('admin.products') ? 'bg-fresh-600 text-white shadow-lg shadow-fresh-600/30' : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white' }}">
                            <div class="flex items-center space-x-3">
                                <i class="fa-solid fa-boxes-stacked w-4 text-center"></i>
                                <span>Products Matrix & Stock</span>
                            </div>
                            <span class="text-[10px] text-emerald-300 font-mono">745+</span>
                        </a>

                        <a href="{{ route('admin.categories') }}" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition {{ request()->routeIs('admin.categories') ? 'bg-fresh-600 text-white shadow-lg shadow-fresh-600/30' : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white' }}">
                            <div class="flex items-center space-x-3">
                                <i class="fa-solid fa-layer-group w-4 text-center text-fresh-300"></i>
                                <span>Categories & Aisle Manager</span>
                            </div>
                            <span class="text-[10px] text-emerald-300 font-mono">36</span>
                        </a>

                        <a href="{{ route('admin.products.barcode_sheet') }}" target="_blank" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition {{ request()->routeIs('admin.products.barcode_sheet') ? 'bg-fresh-600 text-white' : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white' }}">
                            <div class="flex items-center space-x-3">
                                <i class="fa-solid fa-barcode w-4 text-center text-fresh-300"></i>
                                <span>Shelf Barcode Sheets</span>
                            </div>
                            <span class="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-emerald-300">Print</span>
                        </a>

                        <a href="{{ route('admin.inventory_logs') }}" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition {{ request()->routeIs('admin.inventory_logs') ? 'bg-fresh-600 text-white shadow-lg shadow-fresh-600/30' : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white' }}">
                            <div class="flex items-center space-x-3">
                                <i class="fa-solid fa-clock-rotate-left w-4 text-center"></i>
                                <span>POS & Stock Audit Trail</span>
                            </div>
                            <i class="fa-solid fa-chevron-right text-[10px] opacity-60"></i>
                        </a>
                    </div>
                </div>

                <!-- Group 3: Marketing & Promotions -->
                <div>
                    <span class="px-3 text-[10px] font-black uppercase tracking-widest text-emerald-400/60">Marketing & Promotions</span>
                    <div class="mt-2 space-y-1">
                        <a href="{{ route('admin.coupons') }}" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition {{ request()->routeIs('admin.coupons') ? 'bg-fresh-600 text-white shadow-lg shadow-fresh-600/30' : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white' }}">
                            <div class="flex items-center space-x-3">
                                <i class="fa-solid fa-ticket w-4 text-center text-amber-300"></i>
                                <span>Coupons & Discount Vouchers</span>
                            </div>
                            <span class="bg-amber-400 text-slate-900 text-[10px] px-2 py-0.5 rounded-full font-black">Promo</span>
                        </a>
                    </div>
                </div>

                <!-- Group 4: Customer Relationship (CRM) -->
                <div>
                    <span class="px-3 text-[10px] font-black uppercase tracking-widest text-emerald-400/60">Customer Care & CRM</span>
                    <div class="mt-2 space-y-1">
                        <a href="{{ route('admin.customers') }}" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition {{ request()->routeIs('admin.customers') ? 'bg-fresh-600 text-white shadow-lg shadow-fresh-600/30' : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white' }}">
                            <div class="flex items-center space-x-3">
                                <i class="fa-solid fa-users w-4 text-center"></i>
                                <span>Customer 360 Directory</span>
                            </div>
                            <i class="fa-solid fa-chevron-right text-[10px] opacity-60"></i>
                        </a>

                        <a href="{{ route('admin.leads') }}" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition {{ request()->routeIs('admin.leads') ? 'bg-fresh-600 text-white shadow-lg shadow-fresh-600/30' : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white' }}">
                            <div class="flex items-center space-x-3">
                                <i class="fa-solid fa-headset w-4 text-center"></i>
                                <span>Support Tickets & Leads</span>
                            </div>
                            <i class="fa-solid fa-chevron-right text-[10px] opacity-60"></i>
                        </a>
                    </div>
                </div>

                <!-- Group 5: Administration & Settings -->
                <div>
                    <span class="px-3 text-[10px] font-black uppercase tracking-widest text-emerald-400/60">Administration & Reports</span>
                    <div class="mt-2 space-y-1">
                        <a href="{{ route('admin.reports') }}" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition {{ request()->routeIs('admin.reports') ? 'bg-fresh-600 text-white shadow-lg shadow-fresh-600/30' : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white' }}">
                            <div class="flex items-center space-x-3">
                                <i class="fa-solid fa-file-invoice-dollar w-4 text-center text-emerald-300"></i>
                                <span>Financial & Profit Reports</span>
                            </div>
                            <i class="fa-solid fa-chevron-right text-[10px] opacity-60"></i>
                        </a>

                        <a href="{{ route('admin.branches') }}" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition {{ request()->routeIs('admin.branches') ? 'bg-fresh-600 text-white shadow-lg shadow-fresh-600/30' : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white' }}">
                            <div class="flex items-center space-x-3">
                                <i class="fa-solid fa-store w-4 text-center text-fresh-300"></i>
                                <span>Warehouses & Outlets</span>
                            </div>
                            <i class="fa-solid fa-chevron-right text-[10px] opacity-60"></i>
                        </a>

                        <a href="{{ route('admin.settings') }}" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition {{ request()->routeIs('admin.settings') ? 'bg-fresh-600 text-white shadow-lg shadow-fresh-600/30' : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white' }}">
                            <div class="flex items-center space-x-3">
                                <i class="fa-solid fa-sliders w-4 text-center text-slate-300"></i>
                                <span>Store & Delivery Settings</span>
                            </div>
                            <i class="fa-solid fa-gear text-[10px] opacity-60"></i>
                        </a>
                    </div>
                </div>
            </nav>

            <!-- Bottom System Status -->
            <div class="p-4 border-t border-emerald-900/40 space-y-2">
                <div class="bg-black/40 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-xs space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="text-emerald-400 font-bold flex items-center gap-1.5">
                            <span class="w-2 h-2 rounded-full bg-fresh-400 animate-ping"></span>
                            Live Inventory Sync
                        </span>
                        <span class="text-[10px] font-mono text-emerald-300">v2.4 Active</span>
                    </div>
                    <p class="text-[11px] text-emerald-200/70 leading-snug">Online cart and offline POS cashier shared real-time database.</p>
                </div>
            </div>
        </aside>

        <!-- Main Workspace -->
        <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
            <!-- Top Header (Glassmorphic) -->
            <header class="glass-header border-b border-slate-200/80 px-3 sm:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 shadow-xs sticky top-0 z-20">
                <div class="flex items-center space-x-4">
                    <button onclick="toggleSidebar()" aria-label="Open menu" class="lg:hidden w-11 h-11 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition">
                        <i class="fa-solid fa-bars text-lg"></i>
                    </button>

                    <div>
                        <div class="flex items-center space-x-2">
                            <h2 class="text-sm sm:text-lg font-black text-slate-900 tracking-tight truncate max-w-[120px] sm:max-w-none">
                                Fresh House Command
                            </h2>
                            <span class="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-fresh-100 text-fresh-800 border border-fresh-200">
                                Karachi Hub
                            </span>
                        </div>
                        <div class="hidden sm:flex items-center space-x-3 whitespace-nowrap text-xs text-slate-500 mt-0.5 font-medium">
                            <span class="flex items-center gap-1.5 text-fresh-700 font-bold">
                                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                                Hub Operations Active
                            </span>
                            <span class="hidden 2xl:inline">&bull;</span>
                            <span id="liveClock" class="hidden 2xl:inline font-mono text-slate-700 font-bold">Loading PKT...</span>
                        </div>
                    </div>
                </div>

                <!-- Topbar Actions -->
                <div class="flex items-center space-x-2 sm:space-x-3 shrink-0">
                    <!-- Global Search Button (Ctrl+K) -->
                    <button
                        onclick="openGlobalSearch()"
                        class="hidden md:flex items-center space-x-2 whitespace-nowrap bg-slate-100 hover:bg-slate-200/80 text-slate-500 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 transition"
                    >
                        <i class="fa-solid fa-magnifying-glass text-slate-400"></i>
                        <span>Search<span class="hidden xl:inline"> orders, products...</span></span>
                        <kbd class="ml-2 font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-300 text-slate-600 font-bold">Ctrl K</kbd>
                    </button>

                    <!-- Quick Add Product Trigger -->
                    <button
                        onclick="document.getElementById('quickAddProductModal').classList.remove('hidden'); document.getElementById('quickAddProductModal').classList.add('flex');"
                        class="bg-fresh-600 hover:bg-fresh-700 text-white px-3.5 h-10 whitespace-nowrap rounded-xl text-xs font-bold shadow-md shadow-fresh-600/20 flex items-center gap-1.5 transition"
                    >
                        <i class="fa-solid fa-plus"></i>
                        <span class="hidden sm:inline">Add SKU</span>
                    </button>

                    <!-- POS Terminal Shortcut -->
                    <a
                        href="{{ route('admin.pos') }}"
                        class="bg-gradient-to-r from-fresh-900 to-fresh-950 hover:from-fresh-800 hover:to-fresh-900 text-white px-3.5 h-10 whitespace-nowrap rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition"
                    >
                        <i class="fa-solid fa-cash-register text-amber-400"></i>
                        <span class="hidden sm:inline">POS Counter</span>
                    </a>

                    <!-- View Storefront -->
                    <a
                        href="{{ url('/') }}"
                        target="_blank"
                        aria-label="Open storefront"
                        class="max-sm:hidden bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
                    >
                        <i class="fa-solid fa-arrow-up-right-from-square text-xs text-fresh-600"></i>
                        <span class="hidden md:inline">Storefront</span>
                    </a>

                    <!-- Admin Profile Pill -->
                    <div class="max-sm:hidden flex items-center space-x-2 pl-2 sm:pl-3 border-l border-slate-200">
                        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-fresh-500 to-fresh-800 text-white font-black flex items-center justify-center text-xs shadow-sm">
                            FB
                        </div>
                        <div class="hidden lg:block text-left">
                            <span class="block text-xs font-bold text-slate-900 leading-tight">Admin Manager</span>
                            <span class="block text-[10px] text-slate-400 leading-tight">Karachi HQ</span>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Success Alert -->
            @if(session('success'))
                <div id="toastSuccess" role="status" class="mx-6 sm:mx-8 mt-6 p-4 rounded-2xl bg-fresh-50 border border-fresh-200 text-fresh-800 flex items-center justify-between shadow-sm animate-fade-in">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 rounded-xl bg-fresh-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                            <i class="fa-solid fa-check"></i>
                        </div>
                        <span class="text-xs font-bold">{{ session('success') }}</span>
                    </div>
                    <button onclick="document.getElementById('toastSuccess').remove()" aria-label="Dismiss" class="text-fresh-700 hover:text-fresh-900 w-9 h-9 rounded-lg hover:bg-fresh-100">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            @endif

            <!-- Main Content Container -->
            <main id="admin-main" tabindex="-1" class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 focus:outline-none">
                @yield('content')
            </main>
        </div>
    </div>

    <!-- Quick Add Product Modal -->
    <div id="quickAddProductModal" role="dialog" aria-modal="true" aria-label="Add new product" class="fixed inset-0 bg-black/60 backdrop-blur-xs hidden items-center justify-center p-4 z-50">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <div>
                    <h3 class="font-black text-gray-900 text-lg">Add New Fresh House Product</h3>
                    <p class="text-xs text-gray-500">Item will be synced across Online Storefront & POS Counter</p>
                </div>
                <button
                    onclick="document.getElementById('quickAddProductModal').classList.add('hidden'); document.getElementById('quickAddProductModal').classList.remove('flex');"
                    aria-label="Close" class="w-11 h-11 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center"
                >
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <form action="{{ route('admin.products.save') }}" method="POST" class="space-y-4">
                @csrf
                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1">Product Title</label>
                    <input type="text" name="name" required placeholder="e.g. Fresh Red Apples (1 kg)" class="w-full px-3.5 h-11 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none">
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-bold text-gray-700 mb-1">Category</label>
                        <select name="category_id" required class="w-full px-3 h-11 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none bg-white font-medium">
                            @foreach(\App\Models\Category::orderBy('name')->get() as $cat)
                                <option value="{{ $cat->id }}">{{ $cat->name }}</option>
                            @endforeach
                        </select>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-700 mb-1">Pack Unit / Weight</label>
                        <input type="text" name="unit" placeholder="e.g. 500g, 1 kg, 1 dozen" class="w-full px-3.5 h-11 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-bold text-gray-700 mb-1">Retail Price (PKR)</label>
                        <input type="number" step="0.01" name="price" required placeholder="PKR 450" class="w-full px-3.5 h-11 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none font-bold text-emerald-800">
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-700 mb-1">Supplier Cost Price (PKR)</label>
                        <input type="number" step="0.01" name="cost_price" placeholder="PKR 350" class="w-full px-3.5 h-11 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-bold text-gray-700 mb-1">Initial Stock (Units)</label>
                        <input type="number" name="stock_quantity" value="50" required class="w-full px-3.5 h-11 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none font-bold">
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-700 mb-1">Barcode (EAN-13)</label>
                        <input type="text" name="barcode" placeholder="Optional (Auto-generated)" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-mono focus:border-fresh-500 focus:outline-none">
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1">Image URL</label>
                    <input type="url" name="primary_image" placeholder="https://cdn.shopify.com/..." class="w-full px-3.5 h-11 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none">
                </div>

                <div class="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onclick="document.getElementById('quickAddProductModal').classList.add('hidden'); document.getElementById('quickAddProductModal').classList.remove('flex');"
                        class="px-4 h-11 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        class="px-6 h-11 rounded-xl text-xs font-bold bg-fresh-600 hover:bg-fresh-700 active:bg-fresh-800 text-white shadow-lg shadow-fresh-600/30"
                    >
                        Save & Add to Catalog
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Global Search Modal (Ctrl + K) -->
    <div id="globalSearchModal" role="dialog" aria-modal="true" aria-label="Global search" class="fixed inset-0 bg-black/60 backdrop-blur-xs hidden items-start justify-center p-4 sm:p-12 z-50">
        <div class="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[calc(100dvh-2rem)] flex flex-col">
            <div class="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div class="flex items-center space-x-2 text-slate-800">
                    <i class="fa-solid fa-magnifying-glass text-fresh-600"></i>
                    <h3 class="font-black text-base">Global Storefront & POS Search</h3>
                </div>
                <button onclick="closeGlobalSearch()" aria-label="Close search" class="w-11 h-11 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                    <i class="fa-solid fa-xmark text-lg"></i>
                </button>
            </div>

            <div class="relative mb-4">
                <input
                    type="text"
                    id="globalSearchInput"
                    placeholder="Search by Product Name, SKU, Barcode, or Customer..."
                    class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:border-fresh-500 focus:outline-none font-medium"
                    oninput="handleGlobalSearch(this.value)"
                />
                <i class="fa-solid fa-search absolute left-3.5 top-3.5 text-slate-400"></i>
            </div>

            <div class="flex-1 overflow-y-auto space-y-2 pr-1" id="globalSearchResults">
                <div class="text-center py-10 text-slate-400 text-xs">
                    Type at least 2 characters to search across 745+ products, orders, and barcodes...
                </div>
            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Press <kbd class="font-mono bg-slate-100 px-1 py-0.5 rounded border border-slate-200">ESC</kbd> to close</span>
                <span class="text-fresh-700 font-bold">Fast POS & Online Indexed</span>
            </div>
        </div>
    </div>

    <!-- Live Clock & Global Search Scripts -->
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

        function toggleSidebar() {
            const sb = document.getElementById('adminSidebar');
            const bd = document.getElementById('sidebarBackdrop');
            if (sb.classList.contains('hidden')) {
                sb.classList.remove('hidden');
                sb.classList.add('flex');
                if (bd) bd.classList.remove('hidden');
            } else {
                sb.classList.add('hidden');
                sb.classList.remove('flex');
                if (bd) bd.classList.add('hidden');
            }
        }

        function openGlobalSearch() {
            const m = document.getElementById('globalSearchModal');
            m.classList.remove('hidden');
            m.classList.add('flex');
            setTimeout(() => {
                document.getElementById('globalSearchInput').focus();
            }, 100);
        }

        function closeGlobalSearch() {
            const m = document.getElementById('globalSearchModal');
            m.classList.add('hidden');
            m.classList.remove('flex');
        }

        // Global hotkey: Ctrl+K or Cmd+K
        window.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                openGlobalSearch();
            }
            if (e.key === 'Escape') {
                closeGlobalSearch();
                const qm = document.getElementById('quickAddProductModal');
                if (qm) {
                    qm.classList.add('hidden');
                    qm.classList.remove('flex');
                }
            }
        });

        let searchDebounce;
        function handleGlobalSearch(term) {
            clearTimeout(searchDebounce);
            const resultsContainer = document.getElementById('globalSearchResults');
            if (!term || term.trim().length < 2) {
                resultsContainer.innerHTML = '<div class="text-center py-10 text-slate-400 text-xs">Type at least 2 characters to search across 745+ products, orders, and barcodes...</div>';
                return;
            }

            searchDebounce = setTimeout(() => {
                resultsContainer.innerHTML = '<div class="text-center py-8 text-slate-400 text-xs"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Searching database...</div>';
                fetch('/api/v1/products?search=' + encodeURIComponent(term) + '&per_page=8')
                    .then(res => res.json())
                    .then(data => {
                        const products = data.data || [];
                        if (products.length === 0) {
                            resultsContainer.innerHTML = '<div class="text-center py-8 text-slate-400 text-xs">No matching products found. Try searching for "Apple", "Milk", or a barcode.</div>';
                            return;
                        }

                        let html = '';
                        products.forEach(p => {
                            html += `
                                <a href="/admin/products?search=${encodeURIComponent(p.sku)}" class="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition group">
                                    <div class="flex items-center space-x-3">
                                        <img src="${p.primary_image || 'https://via.placeholder.com/40'}" class="w-10 h-10 object-contain rounded-xl bg-white border border-slate-200 p-0.5">
                                        <div>
                                            <h4 class="text-xs font-bold text-slate-900 group-hover:text-fresh-700">${p.name}</h4>
                                            <div class="text-[11px] text-slate-400 space-x-2">
                                                <span class="font-mono text-slate-600 font-bold">${p.sku}</span>
                                                <span>&bull;</span>
                                                <span>Stock: <strong class="${p.stock_quantity < 10 ? 'text-rose-600' : 'text-emerald-700'}">${p.stock_quantity}</strong> units</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <span class="text-xs font-black text-slate-900">PKR ${Number(p.price).toLocaleString()}</span>
                                        <span class="block text-[10px] text-slate-400 font-mono">${p.barcode || ''}</span>
                                    </div>
                                </a>
                            `;
                        });
                        resultsContainer.innerHTML = html;
                    })
                    .catch(err => {
                        resultsContainer.innerHTML = '<div class="text-center py-8 text-rose-500 text-xs">Error fetching search results.</div>';
                    });
            }, 250);
        }
    </script>
</body>
</html>
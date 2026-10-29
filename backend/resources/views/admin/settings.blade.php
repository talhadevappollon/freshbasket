@extends('admin.layout')

@section('content')
<div class="space-y-6 max-w-5xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <div class="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-1">
                <span>Administration</span>
                <i class="fa-solid fa-chevron-right text-[10px]"></i>
                <span class="text-fresh-700">Settings & Configuration</span>
            </div>
            <h2 class="text-2xl font-black text-slate-900 tracking-tight">Storefront, Logistics & POS Configuration</h2>
            <p class="text-xs text-slate-500">Configure delivery rules, Karachi customer helplines, WhatsApp support numbers, and store operational parameters</p>
        </div>
    </div>

    <!-- Settings Form -->
    <form action="{{ route('admin.settings.update') }}" method="POST" class="space-y-6">
        @csrf

        <!-- General Identity -->
        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div class="border-b border-slate-100 pb-4">
                <h3 class="font-black text-slate-900 text-lg flex items-center gap-2">
                    <i class="fa-solid fa-store text-fresh-600"></i>
                    <span>Storefront Brand & Identity</span>
                </h3>
                <p class="text-xs text-slate-500">Public store identity reflected on website and receipts</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Store Name</label>
                    <input type="text" name="store_name" value="{{ $settings['store_name'] ?? 'Fresh House' }}" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-fresh-500 focus:outline-none">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Store Slogan / Tagline</label>
                    <input type="text" name="store_tagline" value="{{ $settings['store_tagline'] ?? 'Karachi\'s Premier Gourmet & Daily Fresh Grocery Store' }}" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-fresh-500 focus:outline-none">
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Operating Hours</label>
                    <input type="text" name="operating_hours" value="{{ $settings['operating_hours'] ?? '8:00 AM - 12:00 Midnight (Mon - Sun)' }}" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-fresh-500 focus:outline-none">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Base Currency</label>
                    <input type="text" name="currency" value="{{ $settings['currency'] ?? 'PKR' }}" readonly class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-600">
                </div>
            </div>
        </div>

        <!-- Contact & Helplines -->
        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div class="border-b border-slate-100 pb-4">
                <h3 class="font-black text-slate-900 text-lg flex items-center gap-2">
                    <i class="fa-solid fa-headset text-emerald-600"></i>
                    <span>Karachi Support Hotlines & WhatsApp</span>
                </h3>
                <p class="text-xs text-slate-500">Contact channels shown in the header, footer, and order alerts</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Customer Helpline Phone</label>
                    <input type="text" name="helpline_phone" value="{{ $settings['helpline_phone'] ?? '+92 300 1234567' }}" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-fresh-500 focus:outline-none">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">WhatsApp Order Support</label>
                    <input type="text" name="whatsapp_number" value="{{ $settings['whatsapp_number'] ?? '+92 300 1234567' }}" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-emerald-700 font-bold focus:border-fresh-500 focus:outline-none">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Support Email</label>
                    <input type="email" name="support_email" value="{{ $settings['support_email'] ?? 'support@freshbasket.com.pk' }}" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-fresh-500 focus:outline-none">
                </div>
            </div>
        </div>

        <!-- Delivery & Logistics Economics -->
        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div class="border-b border-slate-100 pb-4">
                <h3 class="font-black text-slate-900 text-lg flex items-center gap-2">
                    <i class="fa-solid fa-truck-fast text-blue-600"></i>
                    <span>Delivery Economics & Free Shipping Threshold</span>
                </h3>
                <p class="text-xs text-slate-500">Controls automated shipping charges on the client cart</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Free Delivery Threshold (PKR)</label>
                    <input type="number" name="free_shipping_threshold" value="{{ $settings['free_shipping_threshold'] ?? '2000' }}" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-black text-emerald-800 focus:border-fresh-500 focus:outline-none">
                    <span class="text-[11px] text-slate-400 mt-0.5 block">Orders above this get 100% Free Shipping</span>
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Standard Delivery Fee (PKR)</label>
                    <input type="number" name="default_shipping_fee" value="{{ $settings['default_shipping_fee'] ?? '150' }}" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-fresh-500 focus:outline-none">
                    <span class="text-[11px] text-slate-400 mt-0.5 block">Applied to orders under threshold</span>
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Express Delivery Guarantee</label>
                    <input type="number" name="express_delivery_mins" value="{{ $settings['express_delivery_mins'] ?? '90' }}" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-fresh-500 focus:outline-none">
                    <span class="text-[11px] text-slate-400 mt-0.5 block">Minutes displayed on client banners</span>
                </div>
            </div>
        </div>

        <div class="flex justify-end pt-2">
            <button
                type="submit"
                class="bg-fresh-600 hover:bg-fresh-700 text-white px-8 py-3 rounded-2xl text-xs font-black shadow-lg shadow-fresh-600/30 flex items-center gap-2 transition"
            >
                <i class="fa-solid fa-floppy-disk"></i>
                <span>Save Store Configuration</span>
            </button>
        </div>
    </form>
</div>
@endsection

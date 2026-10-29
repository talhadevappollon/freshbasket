@extends('admin.layout')

@section('content')
<div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header with Breadcrumb -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <div class="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-1">
                <span>Customer Care & CRM</span>
                <i class="fa-solid fa-chevron-right text-[10px]"></i>
                <span class="text-fresh-700">Customer 360 Directory</span>
            </div>
            <h2 class="text-2xl font-black text-slate-900 tracking-tight">Customer Relationship Management (CRM 360)</h2>
            <p class="text-xs text-slate-500">Shopper directory, lifetime value metrics, delivery preferences & direct WhatsApp customer engagement</p>
        </div>

        <form action="{{ route('admin.customers') }}" method="GET" class="flex items-center gap-2">
            <div class="relative">
                <input
                    type="text"
                    name="search"
                    value="{{ request('search') }}"
                    placeholder="Search name, phone, DHA, Clifton..."
                    class="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs w-64 focus:outline-none focus:border-fresh-500 transition shadow-2xs font-medium"
                />
                <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
            </div>
            <button type="submit" class="px-4 py-2 bg-fresh-600 hover:bg-fresh-700 text-white rounded-xl text-xs font-bold shadow-sm transition">
                Search
            </button>
        </form>
    </div>

    <!-- CRM Overview Metrics -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Shoppers</span>
                <h3 class="text-xl sm:text-2xl font-black text-slate-900 mt-1">{{ $customers->total() }} Customers</h3>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-fresh-50 text-fresh-600 flex items-center justify-center text-lg">
                <i class="fa-solid fa-users"></i>
            </div>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Customer Spend</span>
                <h3 class="text-xl sm:text-2xl font-black text-emerald-800 mt-1">PKR {{ number_format($totalCustomerSpend, 0) }}</h3>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                <i class="fa-solid fa-coins"></i>
            </div>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">VIP Loyalty Shoppers</span>
                <h3 class="text-xl sm:text-2xl font-black text-amber-600 mt-1">{{ $vipCount }} VIP Members</h3>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
                <i class="fa-solid fa-crown"></i>
            </div>
        </div>
    </div>

    <!-- Customers Directory Table -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="bg-slate-50/75 border-b border-slate-100 text-xs text-slate-400 uppercase font-semibold">
                    <tr>
                        <th class="py-4 px-6">Customer Profile</th>
                        <th class="px-4">Phone & WhatsApp</th>
                        <th class="px-4">Primary Delivery Address</th>
                        <th class="px-4">Orders Count</th>
                        <th class="px-4">Lifetime Spend (PKR)</th>
                        <th class="px-4">CRM Tier</th>
                        <th class="px-6 text-right">Delivery Notes & Preferences</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @forelse($customers as $customer)
                    <tr class="hover:bg-slate-50/50 transition">
                        <td class="py-4 px-6 flex items-center space-x-3.5">
                            <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-900 font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                                {{ strtoupper(substr($customer->name, 0, 2)) }}
                            </div>
                            <div>
                                <span class="font-bold text-slate-900 block">{{ $customer->name }}</span>
                                <span class="text-xs text-slate-400">{{ $customer->email ?? 'No email on file' }}</span>
                            </div>
                        </td>

                        <td class="px-4">
                            <div class="text-xs font-mono font-bold text-slate-800">{{ $customer->phone }}</div>
                            @php
                                $cleanPhone = preg_replace('/[^0-9]/', '', $customer->phone);
                                $waText = urlencode("Assalam-o-Alaikum {$customer->name}! Special greetings from Fresh House. Check out today's fresh arrival organic fruits & vegetables at freshbasket.com.pk");
                            @endphp
                            <a href="https://wa.me/{{ $cleanPhone }}?text={{ $waText }}" target="_blank" class="inline-flex items-center text-xs text-emerald-600 hover:text-emerald-700 font-bold mt-1">
                                <i class="fa-brands fa-whatsapp text-sm mr-1"></i> WhatsApp
                            </a>
                        </td>

                        <td class="px-4 max-w-xs">
                            <span class="font-bold text-xs text-slate-800 block">{{ $customer->area ?? 'Karachi' }}, {{ $customer->city }}</span>
                            <p class="text-xs text-slate-500 truncate mt-0.5">{{ $customer->address }}</p>
                        </td>

                        <td class="px-4 font-bold text-slate-900">
                            {{ $customer->orders_count }} orders
                        </td>

                        <td class="px-4 font-black text-emerald-900">
                            PKR {{ number_format($customer->total_spent, 0) }}
                        </td>

                        <td class="px-4">
                            <form action="{{ route('admin.customers.update', $customer->id) }}" method="POST">
                                @csrf
                                <select name="status" onchange="this.form.submit()" class="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border cursor-pointer
                                    {{ $customer->status == 'vip' ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-100 text-slate-700 border-slate-200' }}">
                                    <option value="active" {{ $customer->status === 'active' ? 'selected' : '' }}>Standard</option>
                                    <option value="vip" {{ $customer->status === 'vip' ? 'selected' : '' }}>VIP Club</option>
                                    <option value="inactive" {{ $customer->status === 'inactive' ? 'selected' : '' }}>Inactive</option>
                                </select>
                            </form>
                        </td>

                        <td class="px-6 text-right">
                            <form action="{{ route('admin.customers.update', $customer->id) }}" method="POST" class="inline-flex items-center space-x-2">
                                @csrf
                                <input
                                    type="text"
                                    name="customer_notes"
                                    value="{{ $customer->customer_notes }}"
                                    placeholder="Add rider note..."
                                    class="px-3 py-1.5 text-xs border border-slate-200 rounded-xl w-48 focus:outline-none focus:border-fresh-500 bg-slate-50"
                                />
                                <button type="submit" class="p-2 bg-slate-100 hover:bg-fresh-50 text-slate-600 hover:text-fresh-700 rounded-xl text-xs transition" title="Save Preference Note">
                                    <i class="fa-solid fa-check"></i>
                                </button>
                            </form>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="7" class="text-center py-12 text-slate-400 text-xs">No customer profiles found.</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="p-6 border-t border-slate-100">
            {{ $customers->links() }}
        </div>
    </div>
</div>
@endsection
@extends('admin.layout')

@section('content')
<div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-2xl font-bold text-gray-900">Customer Relationship Management (CRM 360)</h2>
            <p class="text-xs text-gray-500">Track shopper loyalty, total lifetime value, delivery instructions & WhatsApp engagement</p>
        </div>

        <form action="{{ route('admin.customers') }}" method="GET" class="flex items-center gap-2">
            <div class="relative">
                <input type="text" name="search" value="{{ request('search') }}" placeholder="Search name, phone, area..." class="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs w-64 focus:outline-none focus:border-fresh-500 bg-white">
                <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-gray-400 text-xs"></i>
            </div>
            <button type="submit" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow">Search</button>
        </form>
    </div>

    <!-- Customer Directory Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="bg-gray-50/75 border-b border-gray-100 text-xs text-gray-400 uppercase font-semibold">
                    <tr>
                        <th class="py-3.5 px-6">Customer Profile</th>
                        <th class="px-4">Phone & WhatsApp</th>
                        <th class="px-4">Primary Area & Address</th>
                        <th class="px-4">Orders Count</th>
                        <th class="px-4">Lifetime Spend</th>
                        <th class="px-4">CRM Status</th>
                        <th class="px-6 text-right">Customer Notes</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    @forelse($customers as $customer)
                    <tr class="hover:bg-gray-50/50 transition">
                        <td class="py-4 px-6 flex items-center space-x-3">
                            <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shrink-0">
                                {{ strtoupper(substr($customer->name, 0, 2)) }}
                            </div>
                            <div>
                                <span class="font-bold text-gray-900 block">{{ $customer->name }}</span>
                                <span class="text-xs text-gray-400">{{ $customer->email ?? 'No email on file' }}</span>
                            </div>
                        </td>

                        <td class="px-4">
                            <div class="text-xs font-medium text-gray-800">{{ $customer->phone }}</div>
                            <a href="https://wa.me/{{ preg_replace('/[^0-9]/', '', $customer->phone) }}" target="_blank" class="inline-flex items-center text-xs text-emerald-600 hover:text-emerald-700 font-semibold mt-1">
                                <i class="fa-brands fa-whatsapp text-sm mr-1"></i> WhatsApp Chat
                            </a>
                        </td>

                        <td class="px-4 max-w-xs">
                            <span class="font-semibold text-xs text-gray-800 block">{{ $customer->area ?? 'Karachi' }}, {{ $customer->city }}</span>
                            <p class="text-xs text-gray-500 line-clamp-1 mt-0.5">{{ $customer->address }}</p>
                        </td>

                        <td class="px-4 font-bold text-gray-800">
                            {{ $customer->orders_count }} orders
                        </td>

                        <td class="px-4 font-black text-gray-900">
                            PKR {{ number_format($customer->total_spent, 0) }}
                        </td>

                        <td class="px-4">
                            <span class="inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase
                                {{ $customer->status == 'vip' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-gray-100 text-gray-700' }}">
                                {{ $customer->status }}
                            </span>
                        </td>

                        <td class="px-6 text-right">
                            <form action="{{ route('admin.customers.update', $customer->id) }}" method="POST" class="inline-flex items-center space-x-2">
                                @csrf
                                <input type="text" name="customer_notes" value="{{ $customer->customer_notes }}" placeholder="Add note..." class="px-2 py-1 text-xs border border-gray-200 rounded-lg w-44 focus:outline-none focus:border-fresh-500">
                                <button type="submit" class="p-1.5 bg-gray-100 hover:bg-fresh-50 text-gray-600 hover:text-fresh-700 rounded-lg text-xs" title="Save note">
                                    <i class="fa-solid fa-check"></i>
                                </button>
                            </form>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="7" class="text-center py-10 text-gray-400 text-sm">
                            No customers found.
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="p-4 border-t border-gray-100">
            {{ $customers->links() }}
        </div>
    </div>
</div>
@endsection

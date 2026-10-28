@extends('admin.layout')

@section('content')
<div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header with Breadcrumb -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 class="text-2xl font-black text-gray-900 tracking-tight">Customer Support & Bulk Order Inquiries</h2>
            <p class="text-xs text-gray-500">Corporate fruit basket requests, customer questions, and delivery slot inquiries</p>
        </div>
    </div>

    <!-- Leads Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Inquiries</span>
                <h3 class="text-xl sm:text-2xl font-black text-gray-900 mt-1">{{ $leads->total() }} Tickets</h3>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-fresh-50 text-fresh-600 flex items-center justify-center text-lg">
                <i class="fa-solid fa-headset"></i>
            </div>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">New Attention Needed</span>
                <h3 class="text-xl sm:text-2xl font-black text-amber-600 mt-1">{{ $newLeads }} Unresolved</h3>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
                <i class="fa-solid fa-bell"></i>
            </div>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Resolved Tickets</span>
                <h3 class="text-xl sm:text-2xl font-black text-emerald-800 mt-1">{{ $resolvedLeads }} Closed</h3>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                <i class="fa-solid fa-circle-check"></i>
            </div>
        </div>
    </div>

    <!-- Leads Table -->
    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="bg-gray-50/75 border-b border-gray-100 text-xs text-gray-400 uppercase font-semibold">
                    <tr>
                        <th class="py-4 px-6">Shopper</th>
                        <th class="px-4">Subject</th>
                        <th class="px-4">Message Details</th>
                        <th class="px-4">Date</th>
                        <th class="px-4">Ticket Status</th>
                        <th class="px-6 text-right">WhatsApp Response</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    @forelse($leads as $lead)
                    <tr class="hover:bg-gray-50/50 transition">
                        <td class="py-4 px-6">
                            <span class="font-bold text-gray-900 block">{{ $lead->name }}</span>
                            <span class="text-xs text-gray-500 font-mono">{{ $lead->phone }}</span>
                            @if($lead->email)
                                <span class="text-xs text-gray-400 block">{{ $lead->email }}</span>
                            @endif
                        </td>

                        <td class="px-4 font-bold text-emerald-900 text-xs">
                            {{ $lead->subject }}
                        </td>

                        <td class="px-4 max-w-sm">
                            <p class="text-xs text-gray-700 leading-relaxed">{{ $lead->message }}</p>
                            @if($lead->agent_notes)
                                <p class="text-[11px] text-gray-500 italic mt-1 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
                                    <strong>Admin Note:</strong> {{ $lead->agent_notes }}
                                </p>
                            @endif
                        </td>

                        <td class="px-4 text-xs text-gray-400">
                            {{ $lead->created_at->format('M d, Y') }}
                        </td>

                        <td class="px-4">
                            <form action="{{ route('admin.leads.update', $lead->id) }}" method="POST">
                                @csrf
                                <select name="status" onchange="this.form.submit()" class="text-xs font-bold px-2.5 py-1 rounded-xl border cursor-pointer
                                    {{ $lead->status == 'resolved' ? 'bg-fresh-50 text-fresh-800 border-fresh-200' : 'bg-amber-50 text-amber-800 border-amber-200' }}">
                                    <option value="new" {{ $lead->status == 'new' ? 'selected' : '' }}>New</option>
                                    <option value="contacted" {{ $lead->status == 'contacted' ? 'selected' : '' }}>Contacted</option>
                                    <option value="resolved" {{ $lead->status == 'resolved' ? 'selected' : '' }}>Resolved</option>
                                    <option value="closed" {{ $lead->status == 'closed' ? 'selected' : '' }}>Closed</option>
                                </select>
                            </form>
                        </td>

                        <td class="px-6 text-right">
                            @if($lead->phone)
                            <a href="https://wa.me/{{ preg_replace('/[^0-9]/', '', $lead->phone) }}?text=Hello%20{{ urlencode($lead->name) }},%20we%20received%20your%20inquiry%20regarding%20'{{ urlencode($lead->subject) }}'%20at%20Fresh%20Basket!" target="_blank" class="inline-flex items-center px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition">
                                <i class="fa-brands fa-whatsapp text-sm mr-1.5 text-emerald-600"></i> WhatsApp
                            </a>
                            @endif
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="6" class="text-center py-12 text-gray-400 text-xs">No customer inquiries recorded.</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="p-6 border-t border-gray-100">
            {{ $leads->links() }}
        </div>
    </div>
</div>
@endsection

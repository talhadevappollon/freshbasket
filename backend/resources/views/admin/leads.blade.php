@extends('admin.layout')

@section('content')
<div class="space-y-6">
    <div>
        <h2 class="text-2xl font-bold text-gray-900">Customer Inquiries & Support Tickets</h2>
        <p class="text-xs text-gray-500">Corporate bulk orders, customer feedback, and delivery slot requests</p>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="bg-gray-50/75 border-b border-gray-100 text-xs text-gray-400 uppercase font-semibold">
                    <tr>
                        <th class="py-3.5 px-6">Shopper</th>
                        <th class="px-4">Subject</th>
                        <th class="px-4">Message Details</th>
                        <th class="px-4">Date</th>
                        <th class="px-4">Status</th>
                        <th class="px-6 text-right">Actions & WhatsApp</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    @forelse($leads as $lead)
                    <tr class="hover:bg-gray-50/50 transition">
                        <td class="py-4 px-6">
                            <span class="font-bold text-gray-900 block">{{ $lead->name }}</span>
                            <span class="text-xs text-gray-500">{{ $lead->phone }}</span>
                            @if($lead->email)
                                <span class="text-xs text-gray-400 block">{{ $lead->email }}</span>
                            @endif
                        </td>

                        <td class="px-4 font-semibold text-emerald-800 text-xs">
                            {{ $lead->subject }}
                        </td>

                        <td class="px-4 max-w-sm">
                            <p class="text-xs text-gray-700 leading-relaxed">{{ $lead->message }}</p>
                            @if($lead->agent_notes)
                                <p class="text-[11px] text-gray-500 italic mt-1 bg-gray-50 p-1.5 rounded">
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
                                <select name="status" onchange="this.form.submit()" class="text-xs font-semibold px-2 py-1 rounded-lg border 
                                    {{ $lead->status == 'resolved' ? 'bg-fresh-50 text-fresh-800 border-fresh-200' : 'bg-amber-50 text-amber-800 border-amber-200' }}">
                                    <option value="new" {{ $lead->status == 'new' ? 'selected' : '' }}>New</option>
                                    <option value="contacted" {{ $lead->status == 'contacted' ? 'selected' : '' }}>Contacted</option>
                                    <option value="resolved" {{ $lead->status == 'resolved' ? 'selected' : '' }}>Resolved</option>
                                    <option value="closed" {{ $lead->status == 'closed' ? 'selected' : '' }}>Closed</option>
                                </select>
                            </form>
                        </td>

                        <td class="px-6 text-right space-x-2">
                            @if($lead->phone)
                            <a href="https://wa.me/{{ preg_replace('/[^0-9]/', '', $lead->phone) }}" target="_blank" class="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition">
                                <i class="fa-brands fa-whatsapp text-sm mr-1"></i> WhatsApp
                            </a>
                            @endif
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="6" class="text-center py-10 text-gray-400 text-sm">
                            No inquiries recorded.
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="p-4 border-t border-gray-100">
            {{ $leads->links() }}
        </div>
    </div>
</div>
@endsection

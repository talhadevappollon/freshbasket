@extends('admin.layout')

@section('content')
<div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <div class="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-1">
                <span>Operations & Sales</span>
                <i class="fa-solid fa-chevron-right text-[10px]"></i>
                <span class="text-fresh-700">Riders & Fleet</span>
            </div>
            <h2 class="text-2xl font-black text-slate-900 tracking-tight">Delivery Riders & Dispatch Logistics Fleet</h2>
            <p class="text-xs text-slate-500">Track delivery personnel, motorbike fleet, assigned Karachi zones, and daily Cash On Delivery cash-in-hand</p>
        </div>

        <div class="flex items-center space-x-3">
            <button
                onclick="openRiderModal()"
                class="bg-fresh-600 hover:bg-fresh-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-fresh-600/30 flex items-center gap-1.5 transition"
            >
                <i class="fa-solid fa-plus"></i>
                <span>Onboard Rider</span>
            </button>
        </div>
    </div>

    <!-- 4 Fleet KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Fleet Size</span>
                <h3 class="text-2xl font-black text-slate-900 mt-1">{{ $totalRiders }} Riders</h3>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center text-lg">
                <i class="fa-solid fa-motorcycle"></i>
            </div>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Available on Duty</span>
                <h3 class="text-2xl font-black text-emerald-700 mt-1">{{ $availableRiders }} Ready</h3>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                <i class="fa-solid fa-circle-check"></i>
            </div>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Out on Delivery</span>
                <h3 class="text-2xl font-black text-blue-600 mt-1">{{ $deliveringRiders }} In-Transit</h3>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                <i class="fa-solid fa-truck-fast"></i>
            </div>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Cash-in-Hand Today</span>
                <h3 class="text-xl font-black text-emerald-800 mt-1">PKR {{ number_format($totalCashCollected, 0) }}</h3>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                <i class="fa-solid fa-sack-dollar"></i>
            </div>
        </div>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div class="flex items-center space-x-2">
            <a href="{{ route('admin.riders') }}" class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition {{ !request('status') || request('status') == 'all' ? 'bg-fresh-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200' }}">
                All ({{ $totalRiders }})
            </a>
            <a href="{{ route('admin.riders', ['status' => 'available']) }}" class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition {{ request('status') == 'available' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200' }}">
                Available ({{ $availableRiders }})
            </a>
            <a href="{{ route('admin.riders', ['status' => 'delivering']) }}" class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition {{ request('status') == 'delivering' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200' }}">
                Delivering ({{ $deliveringRiders }})
            </a>
        </div>
    </div>

    <!-- Riders Table -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="bg-slate-50/75 border-b border-slate-100 text-xs text-slate-400 uppercase font-semibold">
                    <tr>
                        <th class="py-4 px-6">Rider Details</th>
                        <th class="px-4">Vehicle & CNIC</th>
                        <th class="px-4">Assigned Delivery Zone</th>
                        <th class="px-4">Fleet Status</th>
                        <th class="px-4">Cash-in-Hand (COD)</th>
                        <th class="px-4">Completed Deliveries</th>
                        <th class="px-6 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @forelse($riders as $rider)
                    <tr class="hover:bg-slate-50/50 transition">
                        <td class="py-4 px-6">
                            <div class="font-bold text-slate-900">{{ $rider->name }}</div>
                            <div class="text-xs text-slate-500 font-mono">{{ $rider->phone }}</div>
                            @php
                                $cleanPhone = preg_replace('/[^0-9]/', '', $rider->phone);
                                $waText = urlencode("Assalam-o-Alaikum {$rider->name}! Fresh Basket dispatch update from Karachi Warehouse.");
                            @endphp
                            <a href="https://wa.me/{{ $cleanPhone }}?text={{ $waText }}" target="_blank" class="inline-flex items-center text-[11px] text-emerald-600 hover:text-emerald-700 font-bold mt-1">
                                <i class="fa-brands fa-whatsapp mr-1 text-sm"></i> WhatsApp Rider
                            </a>
                        </td>

                        <td class="px-4 text-xs">
                            <span class="font-bold text-slate-800 block">{{ $rider->vehicle_type }}</span>
                            <span class="text-slate-500 font-mono">{{ $rider->vehicle_number ?: 'N/A' }}</span>
                            @if($rider->cnic)
                                <span class="block text-[10px] text-slate-400 font-mono mt-0.5">CNIC: {{ $rider->cnic }}</span>
                            @endif
                        </td>

                        <td class="px-4">
                            <span class="inline-block px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-800">
                                <i class="fa-solid fa-location-dot text-fresh-600 mr-1"></i>
                                {{ $rider->assigned_area }}
                            </span>
                        </td>

                        <td class="px-4">
                            <form action="{{ route('admin.riders.update_status', $rider->id) }}" method="POST">
                                @csrf
                                <select name="status" onchange="this.form.submit()" class="text-xs font-bold px-2.5 py-1 rounded-xl border cursor-pointer
                                    @if($rider->status === 'available') bg-emerald-50 text-emerald-800 border-emerald-200
                                    @elseif($rider->status === 'delivering') bg-blue-50 text-blue-800 border-blue-200
                                    @else bg-slate-100 text-slate-600 border-slate-200 @endif">
                                    <option value="available" {{ $rider->status === 'available' ? 'selected' : '' }}>Available (Ready)</option>
                                    <option value="delivering" {{ $rider->status === 'delivering' ? 'selected' : '' }}>Delivering (En Route)</option>
                                    <option value="off_duty" {{ $rider->status === 'off_duty' ? 'selected' : '' }}>Off Duty</option>
                                </select>
                            </form>
                        </td>

                        <td class="px-4">
                            <span class="font-black text-slate-900 block">PKR {{ number_format($rider->cash_collected_today, 0) }}</span>
                            @if($rider->cash_collected_today > 0)
                                <form action="{{ route('admin.riders.update_status', $rider->id) }}" method="POST" class="inline">
                                    @csrf
                                    <input type="hidden" name="status" value="{{ $rider->status }}">
                                    <input type="hidden" name="cash_reset" value="1">
                                    <button type="submit" class="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold underline" onclick="return confirm('Reconcile and deposit PKR {{ number_format($rider->cash_collected_today, 0) }} to store cash register?')">
                                        Reconcile / Deposit
                                    </button>
                                </form>
                            @endif
                        </td>

                        <td class="px-4 font-bold text-slate-700">
                            {{ $rider->total_deliveries }} orders
                        </td>

                        <td class="px-6 text-right">
                            <button onclick="editRider({{ $rider->toJson() }})" class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition" title="Edit Rider">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="7" class="text-center py-12 text-slate-400 text-xs">No delivery riders registered.</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="p-6 border-t border-slate-100">
            {{ $riders->links() }}
        </div>
    </div>
</div>

<!-- Rider Modal -->
<div id="riderModal" class="fixed inset-0 bg-black/60 backdrop-blur-xs hidden items-center justify-center p-4 z-50">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl">
        <h3 class="font-black text-slate-900 text-lg mb-1" id="riderModalTitle">Onboard Delivery Rider</h3>
        <p class="text-xs text-slate-500 mb-4">Assign delivery personnel to Karachi warehouse clusters</p>

        <form id="riderModalForm" method="POST" action="{{ route('admin.riders.save') }}" class="space-y-4">
            @csrf
            <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Rider Full Name</label>
                <input type="text" name="name" id="modalRiderName" required placeholder="e.g. Tariq Mehmood" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-fresh-500 focus:outline-none">
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Mobile Phone (WhatsApp)</label>
                    <input type="text" name="phone" id="modalRiderPhone" required placeholder="+92 300 1234567" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-fresh-500 focus:outline-none">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">CNIC Number</label>
                    <input type="text" name="cnic" id="modalRiderCnic" placeholder="42101-xxxxxxx-x" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-fresh-500 focus:outline-none">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Vehicle Type</label>
                    <input type="text" name="vehicle_type" id="modalRiderVehicle" value="Motorcycle (Honda 70)" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-fresh-500 focus:outline-none">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Vehicle Number Plate</label>
                    <input type="text" name="vehicle_number" id="modalRiderPlate" placeholder="KHI-1234" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono uppercase focus:border-fresh-500 focus:outline-none">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Assigned Delivery Zone</label>
                    <input type="text" name="assigned_area" id="modalRiderArea" required placeholder="e.g. DHA & Clifton" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-fresh-500 focus:outline-none">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Initial Duty Status</label>
                    <select name="status" id="modalRiderStatus" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-fresh-500 focus:outline-none bg-white">
                        <option value="available">Available (Ready)</option>
                        <option value="delivering">Delivering</option>
                        <option value="off_duty">Off Duty</option>
                    </select>
                </div>
            </div>

            <div class="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onclick="closeRiderModal()" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
                <button type="submit" class="px-5 py-2.5 rounded-xl text-xs font-bold bg-fresh-600 hover:bg-fresh-700 text-white shadow-md shadow-fresh-600/30">Save Rider Profile</button>
            </div>
        </form>
    </div>
</div>

<script>
    function openRiderModal() {
        document.getElementById('riderModalTitle').innerText = 'Onboard Delivery Rider';
        document.getElementById('riderModalForm').action = "{{ route('admin.riders.save') }}";
        document.getElementById('modalRiderName').value = '';
        document.getElementById('modalRiderPhone').value = '';
        document.getElementById('modalRiderCnic').value = '';
        document.getElementById('modalRiderVehicle').value = 'Motorcycle (Honda 70)';
        document.getElementById('modalRiderPlate').value = '';
        document.getElementById('modalRiderArea').value = 'Karachi Central';
        document.getElementById('modalRiderStatus').value = 'available';
        document.getElementById('riderModal').classList.remove('hidden');
        document.getElementById('riderModal').classList.add('flex');
    }

    function editRider(r) {
        document.getElementById('riderModalTitle').innerText = 'Edit Rider: ' + r.name;
        document.getElementById('riderModalForm').action = "/admin/riders/save/" + r.id;
        document.getElementById('modalRiderName').value = r.name;
        document.getElementById('modalRiderPhone').value = r.phone;
        document.getElementById('modalRiderCnic').value = r.cnic || '';
        document.getElementById('modalRiderVehicle').value = r.vehicle_type;
        document.getElementById('modalRiderPlate').value = r.vehicle_number || '';
        document.getElementById('modalRiderArea').value = r.assigned_area;
        document.getElementById('modalRiderStatus').value = r.status;
        document.getElementById('riderModal').classList.remove('hidden');
        document.getElementById('riderModal').classList.add('flex');
    }

    function closeRiderModal() {
        document.getElementById('riderModal').classList.add('hidden');
        document.getElementById('riderModal').classList.remove('flex');
    }
</script>
@endsection

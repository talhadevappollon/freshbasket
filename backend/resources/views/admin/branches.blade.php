@extends('admin.layout')

@section('content')
<div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <div class="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-1">
                <span>Administration</span>
                <i class="fa-solid fa-chevron-right text-[10px]"></i>
                <span class="text-fresh-700">Warehouses & Outlets</span>
            </div>
            <h2 class="text-2xl font-black text-slate-900 tracking-tight">Supermarket Branches & Warehouse Hubs</h2>
            <p class="text-xs text-slate-500">Multi-location retail distribution nodes, physical POS terminals allocation, and regional inventory centers</p>
        </div>

        <div class="flex items-center space-x-3">
            <button
                onclick="openBranchModal()"
                class="bg-fresh-600 hover:bg-fresh-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-fresh-600/30 flex items-center gap-1.5 transition"
            >
                <i class="fa-solid fa-plus"></i>
                <span>Add Warehouse Hub</span>
            </button>
        </div>
    </div>

    <!-- Quick Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Locations</span>
                <h3 class="text-2xl font-black text-slate-900 mt-1">{{ $totalBranches }} Outlets</h3>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center text-lg">
                <i class="fa-solid fa-store"></i>
            </div>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Allocated POS Counters</span>
                <h3 class="text-2xl font-black text-emerald-800 mt-1">{{ $totalPosTerminals }} Terminals</h3>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                <i class="fa-solid fa-cash-register"></i>
            </div>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Primary Hub</span>
                <h3 class="text-xl font-black text-indigo-700 mt-1">Karachi Central (Korangi)</h3>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
                <i class="fa-solid fa-warehouse"></i>
            </div>
        </div>
    </div>

    <!-- Branches Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        @forelse($branches as $branch)
        <div class="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div>
                <div class="flex items-center justify-between mb-3">
                    <span class="px-2.5 py-1 rounded-xl font-mono font-black text-xs bg-slate-100 text-slate-700">
                        {{ $branch->code }}
                    </span>
                    <span class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active Node
                    </span>
                </div>

                <h4 class="text-lg font-black text-slate-900">{{ $branch->name }}</h4>
                <p class="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <i class="fa-solid fa-location-dot text-fresh-600"></i>
                    <span>{{ $branch->address }}</span>
                </p>

                <div class="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
                    <div>
                        <span class="text-slate-400 block text-[10px] font-bold uppercase">City & Zone</span>
                        <span class="font-bold text-slate-800">{{ $branch->city }} &bull; {{ $branch->area }}</span>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[10px] font-bold uppercase">Branch Manager</span>
                        <span class="font-bold text-slate-800">{{ $branch->manager_name ?: 'HQ Operations' }}</span>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[10px] font-bold uppercase">Direct Phone</span>
                        <span class="font-mono font-bold text-slate-800">{{ $branch->phone }}</span>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[10px] font-bold uppercase">POS Cash Desks</span>
                        <span class="font-bold text-emerald-800">{{ $branch->pos_terminals_count }} Active Counters</span>
                    </div>
                </div>
            </div>

            <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <a href="{{ route('admin.pos') }}" class="text-xs font-bold text-fresh-700 hover:text-fresh-800 flex items-center gap-1">
                    <i class="fa-solid fa-cash-register"></i>
                    <span>Launch Branch POS</span>
                </a>

                <button onclick="editBranch({{ $branch->toJson() }})" class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition" title="Edit Hub">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
            </div>
        </div>
        @empty
        <div class="col-span-2 text-center py-12 text-slate-400 text-xs">
            No branch locations registered.
        </div>
        @endforelse
    </div>
</div>

<!-- Branch Modal -->
<div id="branchModal" class="fixed inset-0 bg-black/60 backdrop-blur-xs hidden items-center justify-center p-4 z-50">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl">
        <h3 class="font-black text-slate-900 text-lg mb-1" id="branchModalTitle">Register Warehouse Hub</h3>
        <p class="text-xs text-slate-500 mb-4">Set up physical supermarket location or fulfilment warehouse</p>

        <form id="branchModalForm" method="POST" action="{{ route('admin.branches.save') }}" class="space-y-4">
            @csrf
            <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Outlet / Hub Name</label>
                <input type="text" name="name" id="modalBranchName" required placeholder="e.g. DHA Phase 6 Express Superstore" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-fresh-500 focus:outline-none">
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Branch Code</label>
                    <input type="text" name="code" id="modalBranchCode" required placeholder="KHI-DHA-05" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold uppercase focus:border-fresh-500 focus:outline-none">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">City</label>
                    <input type="text" name="city" id="modalBranchCity" value="Karachi" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-fresh-500 focus:outline-none">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Area / Neighborhood</label>
                    <input type="text" name="area" id="modalBranchArea" required placeholder="e.g. DHA Phase 6" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-fresh-500 focus:outline-none">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">POS Counters Count</label>
                    <input type="number" name="pos_terminals_count" id="modalBranchPos" value="3" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-fresh-500 focus:outline-none">
                </div>
            </div>

            <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Physical Street Address</label>
                <textarea name="address" id="modalBranchAddress" rows="2" required placeholder="Complete building / street address..." class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-fresh-500 focus:outline-none"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                    <input type="text" name="phone" id="modalBranchPhone" required placeholder="+92 21 3584xxxx" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-fresh-500 focus:outline-none">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Branch Manager Name</label>
                    <input type="text" name="manager_name" id="modalBranchManager" placeholder="Manager full name" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-fresh-500 focus:outline-none">
                </div>
            </div>

            <div class="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onclick="closeBranchModal()" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
                <button type="submit" class="px-5 py-2.5 rounded-xl text-xs font-bold bg-fresh-600 hover:bg-fresh-700 text-white shadow-md shadow-fresh-600/30">Save Hub Details</button>
            </div>
        </form>
    </div>
</div>

<script>
    function openBranchModal() {
        document.getElementById('branchModalTitle').innerText = 'Register Warehouse Hub';
        document.getElementById('branchModalForm').action = "{{ route('admin.branches.save') }}";
        document.getElementById('modalBranchName').value = '';
        document.getElementById('modalBranchCode').value = '';
        document.getElementById('modalBranchCity').value = 'Karachi';
        document.getElementById('modalBranchArea').value = '';
        document.getElementById('modalBranchPos').value = '3';
        document.getElementById('modalBranchAddress').value = '';
        document.getElementById('modalBranchPhone').value = '';
        document.getElementById('modalBranchManager').value = '';
        document.getElementById('branchModal').classList.remove('hidden');
        document.getElementById('branchModal').classList.add('flex');
    }

    function editBranch(b) {
        document.getElementById('branchModalTitle').innerText = 'Edit Hub: ' + b.name;
        document.getElementById('branchModalForm').action = "/admin/branches/save/" + b.id;
        document.getElementById('modalBranchName').value = b.name;
        document.getElementById('modalBranchCode').value = b.code;
        document.getElementById('modalBranchCity').value = b.city;
        document.getElementById('modalBranchArea').value = b.area;
        document.getElementById('modalBranchPos').value = b.pos_terminals_count;
        document.getElementById('modalBranchAddress').value = b.address;
        document.getElementById('modalBranchPhone').value = b.phone;
        document.getElementById('modalBranchManager').value = b.manager_name || '';
        document.getElementById('branchModal').classList.remove('hidden');
        document.getElementById('branchModal').classList.add('flex');
    }

    function closeBranchModal() {
        document.getElementById('branchModal').classList.add('hidden');
        document.getElementById('branchModal').classList.remove('flex');
    }
</script>
@endsection
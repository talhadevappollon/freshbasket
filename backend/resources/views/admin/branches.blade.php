@extends('admin.layout')

@section('content')
<div class="space-y-6 max-w-6xl mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
            <div class="flex items-center gap-2">
                <h2 class="text-2xl font-black text-slate-900 tracking-tight">Branches &amp; Warehouses</h2>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-100 text-slate-700">{{ $totalBranches }} {{ $totalBranches === 1 ? 'location' : 'locations' }}</span>
            </div>
            <p class="text-xs text-slate-500 mt-1">Your shops and warehouses with their address, manager and phone.</p>
        </div>
        <button onclick="openBranchModal()" class="shrink-0 bg-fresh-600 hover:bg-fresh-700 text-white px-4 h-10 rounded-xl text-xs font-bold shadow-md shadow-fresh-600/30 flex items-center gap-1.5 transition">
            <i class="fa-solid fa-plus"></i> Add branch
        </button>
    </div>

@if(config('features.pos'))
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">POS counters</span>
                <h3 class="text-2xl font-black text-emerald-800 mt-1">{{ $totalPosTerminals }}</h3>
            </div>
            <i class="fa-solid fa-cash-register text-xl text-emerald-600"></i>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Primary hub</span>
                <h3 class="text-lg font-black text-slate-900 mt-1">Karachi Central (Korangi)</h3>
            </div>
            <i class="fa-solid fa-warehouse text-xl text-slate-500"></i>
        </div>
    </div>
@endif

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        @forelse($branches as $branch)
            @php $open = $branch->is_active === null || (bool) $branch->is_active; @endphp
            <article class="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col">
                <div class="p-5 flex-1">
                    <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                            <h3 class="text-base font-black text-slate-900 leading-snug">{{ $branch->name }}</h3>
                            <span class="mt-1 inline-block px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-slate-100 text-slate-600">{{ $branch->code }}</span>
                        </div>
                        <span class="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full {{ $open ? 'text-emerald-800 bg-emerald-50 border border-emerald-100' : 'text-slate-500 bg-slate-100 border border-slate-200' }}">
                            <span class="w-1.5 h-1.5 rounded-full {{ $open ? 'bg-emerald-500' : 'bg-slate-400' }}"></span>{{ $open ? 'Active' : 'Closed' }}
                        </span>
                    </div>

                    <p class="mt-3 text-xs text-slate-600 flex items-start gap-1.5">
                        <i class="fa-solid fa-location-dot text-fresh-600 mt-0.5"></i>
                        <span>{{ $branch->address }}</span>
                    </p>

                    <dl class="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                        <div class="flex justify-between gap-3">
                            <dt class="text-slate-400 font-semibold">Area</dt>
                            <dd class="font-bold text-slate-800 text-right">{{ $branch->area }}, {{ $branch->city }}</dd>
                        </div>
                        <div class="flex justify-between gap-3">
                            <dt class="text-slate-400 font-semibold">Manager</dt>
                            <dd class="font-bold text-slate-800 text-right">{{ $branch->manager_name ?: 'Not set' }}</dd>
                        </div>
                        <div class="flex justify-between gap-3">
                            <dt class="text-slate-400 font-semibold">Phone</dt>
                            <dd class="font-bold text-slate-800 text-right">
                                <a href="tel:{{ preg_replace('/[^0-9+]/', '', $branch->phone) }}" class="hover:text-fresh-700">{{ $branch->phone }}</a>
                            </dd>
                        </div>
@if(config('features.pos'))
                        <div class="flex justify-between gap-3">
                            <dt class="text-slate-400 font-semibold">POS counters</dt>
                            <dd class="font-bold text-emerald-800 text-right">{{ $branch->pos_terminals_count }}</dd>
                        </div>
@endif
                    </dl>
                </div>

                <div class="px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-3">
@if(config('features.pos'))
                    <a href="{{ route('admin.pos') }}" class="text-xs font-bold text-fresh-700 hover:text-fresh-800 flex items-center gap-1">
                        <i class="fa-solid fa-cash-register"></i> Open POS
                    </a>
@else
                    <span></span>
@endif
                    <button onclick="editBranch({{ $branch->toJson() }})" class="px-3 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition">
                        <i class="fa-solid fa-pen-to-square"></i> Edit
                    </button>
                </div>
            </article>
        @empty
            <div class="md:col-span-2 xl:col-span-3 text-center py-12 text-slate-400 text-xs bg-white rounded-2xl border border-dashed border-slate-200">
                No branches yet. Use "Add branch" to add your first location.
            </div>
        @endforelse
    </div>
</div>

<!-- Branch Modal -->
<div id="branchModal" class="fixed inset-0 bg-black/60 backdrop-blur-xs hidden items-center justify-center p-4 z-50">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl">
        <h3 class="font-black text-slate-900 text-lg mb-1" id="branchModalTitle">Add branch</h3>
        <p class="text-xs text-slate-500 mb-4">A shop or warehouse location</p>

        <form id="branchModalForm" method="POST" action="{{ route('admin.branches.save') }}" class="space-y-4">
            @csrf
            <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Branch name</label>
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

@if(config('features.pos'))
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">POS Counters Count</label>
                    <input type="number" name="pos_terminals_count" id="modalBranchPos" value="3" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-fresh-500 focus:outline-none">
                </div>
@else
<input type="hidden" name="pos_terminals_count" id="modalBranchPos" value="3">
@endif
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
                <button type="submit" class="px-5 py-2.5 rounded-xl text-xs font-bold bg-fresh-600 hover:bg-fresh-700 text-white shadow-md shadow-fresh-600/30">Save branch</button>
            </div>
        </form>
    </div>
</div>

<script>
    function openBranchModal() {
        document.getElementById('branchModalTitle').innerText = 'Add branch';
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
        document.getElementById('branchModalTitle').innerText = 'Edit branch: ' + b.name;
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

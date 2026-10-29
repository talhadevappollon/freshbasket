@extends('admin.layout')

@section('content')
<div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <div class="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-1">
                <span>Marketing & Growth</span>
                <i class="fa-solid fa-chevron-right text-[10px]"></i>
                <span class="text-fresh-700">Promo Vouchers</span>
            </div>
            <h2 class="text-2xl font-black text-slate-900 tracking-tight">Coupons & Promotional Vouchers Engine</h2>
            <p class="text-xs text-slate-500">Create discount campaigns, min-spend qualifiers, and seasonal percentage promotions</p>
        </div>

        <div class="flex items-center space-x-3">
            <button
                onclick="openCouponModal()"
                class="bg-fresh-600 hover:bg-fresh-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-fresh-600/30 flex items-center gap-1.5 transition"
            >
                <i class="fa-solid fa-plus"></i>
                <span>Create Voucher</span>
            </button>
        </div>
    </div>

    <!-- Quick Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Campaigns</span>
                <h3 class="text-2xl font-black text-slate-900 mt-1">{{ $activeCouponsCount }} Active</h3>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
                <i class="fa-solid fa-ticket"></i>
            </div>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Redemptions</span>
                <h3 class="text-2xl font-black text-emerald-800 mt-1">{{ $totalRedemptions }} Orders</h3>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                <i class="fa-solid fa-percent"></i>
            </div>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Checkout Conversion</span>
                <h3 class="text-2xl font-black text-indigo-700 mt-1">Live Validated</h3>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
                <i class="fa-solid fa-bolt"></i>
            </div>
        </div>
    </div>

    <!-- Coupons Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        @forelse($coupons as $coupon)
        <div class="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between relative overflow-hidden">
            <div class="flex items-start justify-between">
                <div>
                    <div class="flex items-center space-x-2">
                        <span class="px-3 py-1 rounded-xl font-mono font-black text-sm {{ $coupon->is_active ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'bg-slate-100 text-slate-500' }}">
                            {{ $coupon->code }}
                        </span>
                        @if($coupon->is_active)
                            <span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Active
                            </span>
                        @else
                            <span class="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                Inactive
                            </span>
                        @endif
                    </div>
                    <h4 class="text-base font-black text-slate-900 mt-3">{{ $coupon->title }}</h4>
                </div>

                <div class="text-right">
                    <span class="text-2xl font-black text-emerald-800">
                        @if($coupon->discount_type === 'percentage')
                            {{ round($coupon->discount_value) }}% OFF
                        @else
                            PKR {{ number_format($coupon->discount_value, 0) }} OFF
                        @endif
                    </span>
                    @if($coupon->max_discount)
                        <span class="block text-[11px] text-slate-400">Max Cap: PKR {{ number_format($coupon->max_discount, 0) }}</span>
                    @endif
                </div>
            </div>

            <!-- Details Ribbon -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4 p-3.5 bg-slate-50 rounded-2xl text-xs">
                <div>
                    <span class="text-slate-400 block text-[10px] font-bold uppercase">Min Order Spend</span>
                    <span class="font-bold text-slate-800">PKR {{ number_format($coupon->min_spend, 0) }}</span>
                </div>
                <div>
                    <span class="text-slate-400 block text-[10px] font-bold uppercase">Redemptions</span>
                    <span class="font-bold text-slate-800">{{ $coupon->used_count }} / {{ $coupon->usage_limit }}</span>
                </div>
                <div>
                    <span class="text-slate-400 block text-[10px] font-bold uppercase">Expires On</span>
                    <span class="font-bold text-slate-800">{{ $coupon->expires_at ? $coupon->expires_at->format('M d, Y') : 'Never' }}</span>
                </div>
            </div>

            <!-- Usage Progress Bar -->
            <div class="space-y-1.5 mb-4">
                <div class="flex justify-between text-[11px] font-semibold text-slate-500">
                    <span>Campaign Usage Quota</span>
                    @php
                        $pct = $coupon->usage_limit > 0 ? min(100, round(($coupon->used_count / $coupon->usage_limit) * 100)) : 0;
                    @endphp
                    <span>{{ $pct }}%</span>
                </div>
                <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full bg-fresh-500 rounded-full" style="width: {{ $pct }}%"></div>
                </div>
            </div>

            <!-- Card Actions -->
            <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
                <form action="{{ route('admin.coupons.toggle', $coupon->id) }}" method="POST">
                    @csrf
                    <button type="submit" class="px-3 py-1.5 rounded-xl text-xs font-bold transition {{ $coupon->is_active ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100' }}">
                        {{ $coupon->is_active ? 'Deactivate' : 'Activate Voucher' }}
                    </button>
                </form>

                <div class="flex items-center space-x-2">
                    <button onclick="editCoupon({{ $coupon->toJson() }})" class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition" title="Edit Voucher">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                </div>
            </div>
        </div>
        @empty
        <div class="col-span-2 text-center py-12 text-slate-400 text-xs">
            No promo vouchers created yet.
        </div>
        @endforelse
    </div>
</div>

<!-- Coupon Modal -->
<div id="couponModal" class="fixed inset-0 bg-black/60 backdrop-blur-xs hidden items-center justify-center p-4 z-50">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl">
        <h3 class="font-black text-slate-900 text-lg mb-1" id="couponModalTitle">Create Promo Voucher</h3>
        <p class="text-xs text-slate-500 mb-4">Configured vouchers apply instantly on Storefront Cart and Checkout</p>

        <form id="couponModalForm" method="POST" action="{{ route('admin.coupons.save') }}" class="space-y-4">
            @csrf
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Coupon Code</label>
                    <input type="text" name="code" id="modalCouponCode" required placeholder="e.g. FLASH25" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold uppercase focus:border-fresh-500 focus:outline-none">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Discount Type</label>
                    <select name="discount_type" id="modalCouponType" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-fresh-500 focus:outline-none bg-white">
                        <option value="percentage">Percentage (%) Discount</option>
                        <option value="fixed">Fixed Cash (PKR) Discount</option>
                    </select>
                </div>
            </div>

            <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Campaign Title</label>
                <input type="text" name="title" id="modalCouponTitle" required placeholder="e.g. Ramadan Super Saver Deal" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-fresh-500 focus:outline-none">
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Discount Value</label>
                    <input type="number" step="0.01" name="discount_value" id="modalCouponVal" required placeholder="e.g. 15 or 500" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-black text-emerald-800 focus:border-fresh-500 focus:outline-none">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Min Spend (PKR)</label>
                    <input type="number" step="0.01" name="min_spend" id="modalCouponMin" placeholder="e.g. 2000" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-fresh-500 focus:outline-none font-bold">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Max Discount Cap (PKR)</label>
                    <input type="number" step="0.01" name="max_discount" id="modalCouponMax" placeholder="Optional max limit" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-fresh-500 focus:outline-none">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Usage Limit (Orders)</label>
                    <input type="number" name="usage_limit" id="modalCouponLimit" value="500" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-fresh-500 focus:outline-none font-bold">
                </div>
            </div>

            <label class="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer pt-1">
                <input type="checkbox" name="is_active" id="modalCouponActive" value="1" checked class="rounded text-fresh-600 focus:ring-0">
                <span>Active & Ready for Checkout</span>
            </label>

            <div class="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onclick="closeCouponModal()" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
                <button type="submit" class="px-5 py-2.5 rounded-xl text-xs font-bold bg-fresh-600 hover:bg-fresh-700 text-white shadow-md shadow-fresh-600/30">Save Voucher</button>
            </div>
        </form>
    </div>
</div>

<script>
    function openCouponModal() {
        document.getElementById('couponModalTitle').innerText = 'Create Promo Voucher';
        document.getElementById('couponModalForm').action = "{{ route('admin.coupons.save') }}";
        document.getElementById('modalCouponCode').value = '';
        document.getElementById('modalCouponTitle').value = '';
        document.getElementById('modalCouponVal').value = '';
        document.getElementById('modalCouponMin').value = '1500';
        document.getElementById('modalCouponMax').value = '';
        document.getElementById('modalCouponLimit').value = '500';
        document.getElementById('modalCouponActive').checked = true;
        document.getElementById('couponModal').classList.remove('hidden');
        document.getElementById('couponModal').classList.add('flex');
    }

    function editCoupon(c) {
        document.getElementById('couponModalTitle').innerText = 'Edit Voucher: ' + c.code;
        document.getElementById('couponModalForm').action = "/admin/coupons/save/" + c.id;
        document.getElementById('modalCouponCode').value = c.code;
        document.getElementById('modalCouponTitle').value = c.title;
        document.getElementById('modalCouponType').value = c.discount_type;
        document.getElementById('modalCouponVal').value = c.discount_value;
        document.getElementById('modalCouponMin').value = c.min_spend;
        document.getElementById('modalCouponMax').value = c.max_discount || '';
        document.getElementById('modalCouponLimit').value = c.usage_limit;
        document.getElementById('modalCouponActive').checked = c.is_active;
        document.getElementById('couponModal').classList.remove('hidden');
        document.getElementById('couponModal').classList.add('flex');
    }

    function closeCouponModal() {
        document.getElementById('couponModal').classList.add('hidden');
        document.getElementById('couponModal').classList.remove('flex');
    }
</script>
@endsection

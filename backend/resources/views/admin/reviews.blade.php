@extends('admin.layout')

@section('content')
<div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header with Title -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 class="text-2xl font-black text-gray-900 tracking-tight">Customer Product Reviews</h2>
            <p class="text-xs text-gray-500">Manage, moderate, edit, and delete verified product reviews across all catalog aisles</p>
        </div>
    </div>

    <!-- Alert Messages -->
    @if(session('success'))
    <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
        <i class="fa-solid fa-circle-check text-fresh-600 text-base"></i>
        <span>{{ session('success') }}</span>
    </div>
    @endif

    <!-- Reviews Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Reviews</span>
                <h3 class="text-xl sm:text-2xl font-black text-gray-900 mt-1">{{ $totalReviews }}</h3>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-fresh-50 text-fresh-600 flex items-center justify-center text-lg">
                <i class="fa-solid fa-comments"></i>
            </div>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Average Rating</span>
                <h3 class="text-xl sm:text-2xl font-black text-amber-500 mt-1">{{ number_format($avgRating, 1) }} / 5.0</h3>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-lg">
                <i class="fa-solid fa-star"></i>
            </div>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">5-Star Reviews</span>
                <h3 class="text-xl sm:text-2xl font-black text-emerald-700 mt-1">{{ $fiveStarReviews }}</h3>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                <i class="fa-solid fa-award"></i>
            </div>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Moderation</span>
                <h3 class="text-xl sm:text-2xl font-black {{ $pendingReviews > 0 ? 'text-rose-600' : 'text-gray-900' }} mt-1">{{ $pendingReviews }}</h3>
            </div>
            <div class="w-10 h-10 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center text-lg">
                <i class="fa-solid fa-shield-halved"></i>
            </div>
        </div>
    </div>

    <!-- Search & Filter Bar -->
    <div class="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <form method="GET" action="{{ route('admin.reviews') }}" class="flex flex-col md:flex-row items-center gap-3">
            <div class="relative flex-1 w-full">
                <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-3.5 text-gray-400 text-sm"></i>
                <input
                    type="text"
                    name="search"
                    placeholder="Search by customer name, email, product, or keywords..."
                    value="{{ request('search') }}"
                    class="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:outline-none bg-gray-50/50"
                >
            </div>

            <div class="flex items-center gap-2 w-full md:w-auto">
                <select name="rating" class="h-10 px-3 rounded-xl border border-gray-200 text-xs bg-white font-semibold">
                    <option value="">All Ratings</option>
                    <option value="5" {{ request('rating') == '5' ? 'selected' : '' }}>5 Stars ★★★★★</option>
                    <option value="4" {{ request('rating') == '4' ? 'selected' : '' }}>4 Stars ★★★★☆</option>
                    <option value="3" {{ request('rating') == '3' ? 'selected' : '' }}>3 Stars ★★★☆☆</option>
                    <option value="2" {{ request('rating') == '2' ? 'selected' : '' }}>2 Stars ★★☆☆☆</option>
                    <option value="1" {{ request('rating') == '1' ? 'selected' : '' }}>1 Star ★☆☆☆☆</option>
                </select>

                <select name="status" class="h-10 px-3 rounded-xl border border-gray-200 text-xs bg-white font-semibold">
                    <option value="">All Statuses</option>
                    <option value="approved" {{ request('status') == 'approved' ? 'selected' : '' }}>Approved</option>
                    <option value="pending" {{ request('status') == 'pending' ? 'selected' : '' }}>Pending</option>
                    <option value="rejected" {{ request('status') == 'rejected' ? 'selected' : '' }}>Rejected</option>
                </select>

                <button type="submit" class="h-10 px-4 rounded-xl bg-fresh-600 hover:bg-fresh-700 text-white font-bold text-xs cursor-pointer transition">
                    Filter
                </button>

                @if(request()->hasAny(['search', 'rating', 'status']))
                <a href="{{ route('admin.reviews') }}" class="h-10 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs flex items-center justify-center transition">
                    Reset
                </a>
                @endif
            </div>
        </form>
    </div>

    <!-- Reviews Table -->
    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="bg-gray-50/75 border-b border-gray-100 text-xs text-gray-400 uppercase font-semibold">
                    <tr>
                        <th class="py-4 px-6">Product</th>
                        <th class="px-4">Customer</th>
                        <th class="px-4">Rating</th>
                        <th class="px-4">Review Content</th>
                        <th class="px-4">Date</th>
                        <th class="px-4">Status</th>
                        <th class="px-6 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    @forelse($reviews as $rev)
                    <tr class="hover:bg-gray-50/50 transition">
                        <td class="py-4 px-6 max-w-[200px]">
                            <span class="font-bold text-gray-900 block truncate">{{ $rev->product_name }}</span>
                            <span class="text-[11px] text-gray-400 font-mono block truncate">/products/{{ $rev->product_slug }}</span>
                        </td>

                        <td class="px-4">
                            <div class="flex items-center gap-1.5">
                                <span class="font-bold text-gray-900">{{ $rev->customer_name }}</span>
                                @if($rev->is_verified)
                                    <span class="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                        Verified
                                    </span>
                                @endif
                            </div>
                            @if($rev->customer_email)
                                <span class="text-xs text-gray-400 block">{{ $rev->customer_email }}</span>
                            @endif
                        </td>

                        <td class="px-4 whitespace-nowrap">
                            <div class="flex items-center gap-1 text-amber-400">
                                @for($i = 1; $i <= 5; $i++)
                                    <i class="fa-solid fa-star text-xs {{ $i <= $rev->rating ? 'text-amber-400' : 'text-gray-200' }}"></i>
                                @endfor
                                <span class="text-xs font-bold text-gray-700 ml-1">({{ $rev->rating }}.0)</span>
                            </div>
                        </td>

                        <td class="px-4 max-w-md">
                            <p class="font-bold text-xs text-gray-900">{{ $rev->review_title }}</p>
                            <p class="text-xs text-gray-600 leading-relaxed mt-0.5 line-clamp-2">{{ $rev->review_body }}</p>
                        </td>

                        <td class="px-4 text-xs text-gray-400 whitespace-nowrap">
                            {{ $rev->created_at->format('M d, Y') }}
                        </td>

                        <td class="px-4">
                            <span class="text-[11px] font-bold px-2.5 py-1 rounded-full uppercase
                                {{ $rev->status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : ($rev->status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200') }}">
                                {{ $rev->status }}
                            </span>
                        </td>

                        <td class="px-6 text-right whitespace-nowrap">
                            <div class="flex items-center justify-end gap-2">
                                <!-- Edit Button Modal Trigger -->
                                <button
                                    type="button"
                                    onclick="openEditReviewModal({{ json_encode($rev) }})"
                                    class="w-8 h-8 rounded-xl bg-gray-100 hover:bg-fresh-100 text-gray-600 hover:text-fresh-700 flex items-center justify-center transition cursor-pointer"
                                    title="Edit Review"
                                >
                                    <i class="fa-solid fa-pen-to-square text-xs"></i>
                                </button>

                                <!-- Toggle Status Button -->
                                <form action="{{ route('admin.reviews.toggle', $rev->id) }}" method="POST" class="inline">
                                    @csrf
                                    <button
                                        type="submit"
                                        class="w-8 h-8 rounded-xl {{ $rev->status === 'approved' ? 'bg-amber-50 hover:bg-amber-100 text-amber-700' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700' }} flex items-center justify-center transition cursor-pointer"
                                        title="{{ $rev->status === 'approved' ? 'Hide / Reject' : 'Approve' }}"
                                    >
                                        <i class="fa-solid {{ $rev->status === 'approved' ? 'fa-eye-slash' : 'fa-check' }} text-xs"></i>
                                    </button>
                                </form>

                                <!-- Delete Button -->
                                <form action="{{ route('admin.reviews.delete', $rev->id) }}" method="POST" class="inline" onsubmit="return confirm('Are you sure you want to permanently delete this customer review?');">
                                    @csrf
                                    <button
                                        type="submit"
                                        class="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition cursor-pointer"
                                        title="Delete Review"
                                    >
                                        <i class="fa-solid fa-trash text-xs"></i>
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="7" class="py-12 text-center text-gray-400">
                            <div class="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                                <i class="fa-regular fa-comment-dots text-xl"></i>
                            </div>
                            <p class="font-bold text-gray-700">No customer reviews found.</p>
                            <p class="text-xs text-gray-400 mt-1">Try adjusting your filters or search terms.</p>
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if($reviews->hasPages())
        <div class="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
            {{ $reviews->links() }}
        </div>
        @endif
    </div>
</div>

<!-- Edit Review Modal -->
<div id="editReviewModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs hidden">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative">
        <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
            <div>
                <h3 class="text-base font-black text-gray-900 tracking-tight">Edit Customer Review</h3>
                <p id="modalProductTitle" class="text-xs text-gray-500 font-medium truncate max-w-xs"></p>
            </div>
            <button onclick="closeEditReviewModal()" class="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer">
                <i class="fa-solid fa-xmark text-sm"></i>
            </button>
        </div>

        <form id="editReviewForm" method="POST" action="" class="space-y-4">
            @csrf
            <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">Customer Name</label>
                <input type="text" id="modalCustomerName" name="customer_name" required class="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:outline-none">
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1">Rating (1 to 5 Stars)</label>
                    <select id="modalRating" name="rating" required class="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs font-bold">
                        <option value="5">5 Stars ★★★★★</option>
                        <option value="4">4 Stars ★★★★☆</option>
                        <option value="3">3 Stars ★★★☆☆</option>
                        <option value="2">2 Stars ★★☆☆☆</option>
                        <option value="1">1 Star ★☆☆☆☆</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1">Status</label>
                    <select id="modalStatus" name="status" required class="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs font-bold">
                        <option value="approved">Approved (Live on Store)</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected / Hidden</option>
                    </select>
                </div>
            </div>

            <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">Review Title</label>
                <input type="text" id="modalReviewTitle" name="review_title" required class="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:outline-none">
            </div>

            <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">Review Body</label>
                <textarea id="modalReviewBody" name="review_body" rows="4" required class="w-full p-3 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:outline-none leading-relaxed"></textarea>
            </div>

            <div class="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
                <button type="button" onclick="closeEditReviewModal()" class="h-10 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition cursor-pointer">
                    Cancel
                </button>
                <button type="submit" class="h-10 px-5 rounded-xl bg-fresh-600 hover:bg-fresh-700 text-white text-xs font-bold transition shadow-md shadow-fresh-600/30 cursor-pointer">
                    Save Changes
                </button>
            </div>
        </form>
    </div>
</div>

<script>
function openEditReviewModal(rev) {
    document.getElementById('editReviewForm').action = '/admin/reviews/' + rev.id + '/update';
    document.getElementById('modalProductTitle').textContent = rev.product_name + ' (/products/' + rev.product_slug + ')';
    document.getElementById('modalCustomerName').value = rev.customer_name;
    document.getElementById('modalRating').value = rev.rating;
    document.getElementById('modalStatus').value = rev.status;
    document.getElementById('modalReviewTitle').value = rev.review_title;
    document.getElementById('modalReviewBody').value = rev.review_body;
    document.getElementById('editReviewModal').classList.remove('hidden');
}

function closeEditReviewModal() {
    document.getElementById('editReviewModal').classList.add('hidden');
}
</script>
@endsection


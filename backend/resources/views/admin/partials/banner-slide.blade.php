{{-- One slider row on Admin → Homepage Banners. $i is the row index (or __INDEX__ in the "new slide" template), $s the slide. --}}
@php
    $field = 'w-full px-3.5 h-10 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none';
    $file = 'block w-full text-xs text-gray-600 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-fresh-50 file:text-fresh-800 file:font-bold';
    $label = 'block text-[11px] font-bold text-gray-600 mb-1';
@endphp
<div class="slide-row rounded-2xl border border-gray-200 p-4 bg-gray-50/50">
    <div class="flex flex-col sm:flex-row gap-4">
        <div class="sm:w-56 shrink-0">
            <div class="aspect-[2496/917] rounded-xl overflow-hidden bg-white border border-gray-100">
                @if(!empty($s['image']))
                    <img src="{{ $s['image'] }}" alt="" class="w-full h-full object-cover">
                @else
                    <div class="w-full h-full flex items-center justify-center text-[11px] text-gray-400">New slide</div>
                @endif
            </div>
            <div class="mt-3 flex items-center gap-3">
                <label class="flex items-center gap-1.5 text-[11px] font-bold text-gray-600">
                    Order <input type="number" name="hero[{{ $i }}][order]" value="{{ $s['order'] ?? '' }}" min="0" max="999" class="w-16 px-2 h-8 rounded-lg border border-gray-200 text-xs">
                </label>
                @if(!empty($s['image']))
                    <label class="flex items-center gap-1.5 text-[11px] font-bold text-rose-700 cursor-pointer">
                        <input type="checkbox" name="hero[{{ $i }}][remove]" value="1" class="rounded text-rose-600 focus:ring-0"> Remove
                    </label>
                @endif
            </div>
        </div>
        <div class="flex-1 min-w-0 grid sm:grid-cols-2 gap-3">
            <div>
                <label class="{{ $label }}">Picture (web address)</label>
                <input type="text" name="hero[{{ $i }}][image]" value="{{ $s['image'] ?? '' }}" maxlength="2048" placeholder="https://... or /uploads/..." class="{{ $field }}">
                <input type="file" name="hero[{{ $i }}][image_file]" accept="image/jpeg,image/png,image/webp,image/gif" class="mt-1.5 {{ $file }}">
            </div>
            <div>
                <label class="{{ $label }}">Phone picture (optional, smaller file)</label>
                <input type="text" name="hero[{{ $i }}][image_mobile]" value="{{ $s['image_mobile'] ?? '' }}" maxlength="2048" placeholder="Leave empty to use the picture" class="{{ $field }}">
                <input type="file" name="hero[{{ $i }}][image_mobile_file]" accept="image/jpeg,image/png,image/webp,image/gif" class="mt-1.5 {{ $file }}">
            </div>
            <div>
                <label class="{{ $label }}">Description (read out to blind visitors)</label>
                <input type="text" name="hero[{{ $i }}][alt]" value="{{ $s['alt'] ?? '' }}" maxlength="300" placeholder="What the banner shows and says" class="{{ $field }}">
            </div>
            <div>
                <label class="{{ $label }}">Link when tapped (optional)</label>
                <input type="text" name="hero[{{ $i }}][link]" value="{{ $s['link'] ?? '' }}" maxlength="500" placeholder="/category/fruits or https://..." class="{{ $field }}">
            </div>
        </div>
    </div>
</div>

@extends('admin.layout')

@section('content')
@php
    $field = 'w-full px-3.5 h-10 rounded-xl border border-gray-200 text-xs focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none';
    $file = 'block w-full text-xs text-gray-600 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-fresh-50 file:text-fresh-800 file:font-bold';
    $label = 'block text-[11px] font-bold text-gray-600 mb-1';
    $card = 'bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm';
@endphp
<div class="space-y-6 max-w-5xl mx-auto">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 class="text-2xl font-black text-gray-900 tracking-tight">Homepage Banners</h2>
            <p class="text-xs text-gray-500">The slider, the green promo banner, the pictures beside the Fresh Fruits, Fresh Vegetables and Premium Nuts sections, and the first tile of the membership, bundle and gift rows. Saved changes show on the website straight away.</p>
        </div>
        <a href="/" target="_blank" rel="noopener" class="shrink-0 bg-white border border-gray-200 hover:border-fresh-400 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition">
            <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i> View homepage
        </a>
    </div>

    <form method="POST" action="{{ route('admin.banners.save') }}" enctype="multipart/form-data" class="space-y-6">
        @csrf

        {{-- 1. Slider --}}
        <section class="{{ $card }}" aria-labelledby="slider-title">
            <h3 id="slider-title" class="font-black text-gray-900 text-base">Slider at the top</h3>
            <p class="text-xs text-gray-500 mt-0.5 mb-4">
                Best picture size: <b>2496 × 917 px</b> (wide banner); pictures of another shape are cropped to it. An optional phone picture
                (<b>1248 × 458 px</b>) loads faster on phones. Slides play in the "Order" number order. Uploads: JPG, PNG, WebP or GIF up to 8 MB.
            </p>
            <div id="slides" class="space-y-3">
                @foreach($banners['hero'] as $i => $s)
                    @include('admin.partials.banner-slide', ['i' => $i, 's' => array_merge($s, ['order' => $i + 1])])
                @endforeach
            </div>
            <button type="button" onclick="addSlide()" class="mt-3 px-4 h-10 rounded-xl border border-dashed border-fresh-400 text-fresh-800 hover:bg-fresh-50 text-xs font-bold flex items-center gap-1.5 transition">
                <i class="fa-solid fa-plus"></i> Add a slide
            </button>

            {{-- The website's original slides that are not in the list above: one click puts them back as a row (saved with "Save banners") --}}
            @php
                $inList = collect($banners['hero'])->pluck('image')->all();
                $originals = collect(\App\Support\HomeBanners::defaults()['hero'])->reject(fn ($o) => in_array($o['image'], $inList, true))->values();
            @endphp
            @if($originals->isNotEmpty())
                <div id="originalSlides" class="mt-4 p-4 rounded-2xl bg-fresh-50/60 border border-fresh-100">
                    <p class="text-xs font-black text-gray-800">Original slides not in the list</p>
                    <p class="text-[11px] text-gray-500 mb-3">Click one to add it back as a slide, then press <b>Save banners</b>.</p>
                    <div class="flex flex-wrap gap-3">
                        @foreach($originals as $o)
                            <button type="button" data-slide="{{ json_encode($o, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) }}"
                                    onclick="addSlide(JSON.parse(this.dataset.slide)); this.remove(); if (!document.querySelector('#originalSlides button')) document.getElementById('originalSlides').remove();"
                                    class="group w-48 text-left rounded-xl overflow-hidden border border-gray-200 bg-white hover:border-fresh-500 hover:shadow-md transition">
                                <img src="{{ $o['image_mobile'] ?: $o['image'] }}" alt="" class="w-full aspect-[2496/917] object-cover">
                                <span class="flex items-center gap-1.5 px-2.5 py-2 text-[11px] font-bold text-fresh-800"><i class="fa-solid fa-rotate-left"></i> Add back</span>
                            </button>
                        @endforeach
                    </div>
                </div>
            @endif
        </section>

        {{-- 2. Promo banner --}}
        <section class="{{ $card }}" aria-labelledby="promo-title">
            <h3 id="promo-title" class="font-black text-gray-900 text-base">Green promo banner</h3>
            <p class="text-xs text-gray-500 mt-0.5 mb-4">The dark green banner under the slider on computers ("Order groceries &amp; more…").</p>
            <div class="grid sm:grid-cols-2 gap-3">
                <div class="sm:col-span-2">
                    <label class="{{ $label }}" for="promo_title">Headline</label>
                    <input id="promo_title" type="text" name="promo[title]" value="{{ $banners['promo']['title'] }}" maxlength="200" class="{{ $field }}">
                </div>
                <div class="sm:col-span-2">
                    <label class="{{ $label }}" for="promo_text">Text under the headline</label>
                    <input id="promo_text" type="text" name="promo[text]" value="{{ $banners['promo']['text'] }}" maxlength="400" class="{{ $field }}">
                </div>
                <div>
                    <label class="{{ $label }}" for="promo_button_label">Button text</label>
                    <input id="promo_button_label" type="text" name="promo[button_label]" value="{{ $banners['promo']['button_label'] }}" maxlength="60" class="{{ $field }}">
                </div>
                <div>
                    <label class="{{ $label }}" for="promo_button_link">Button link</label>
                    <input id="promo_button_link" type="text" name="promo[button_link]" value="{{ $banners['promo']['button_link'] }}" maxlength="500" placeholder="#bestsellers, /category/fruits or https://..." class="{{ $field }}">
                </div>
            </div>

            <p class="text-xs font-black text-gray-800 mt-6">Round pictures on the right</p>
            <p class="text-[11px] text-gray-500 mb-3">Four round pictures, left to right (shown on computers and tablets). Best: square pictures about <b>400 × 400 px</b>. An empty box keeps the original picture.</p>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                @foreach($banners['promo']['images'] as $n => $img)
                    <div class="rounded-2xl border border-gray-200 p-3 bg-gray-50/50 space-y-2">
                        <div class="flex justify-center">
                            <img src="{{ $img }}" alt="" class="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow">
                        </div>
                        <label class="{{ $label }}">Picture {{ $n + 1 }} (web address)</label>
                        <input type="text" name="promo[images][{{ $n }}]" value="{{ $img }}" maxlength="2048" class="{{ $field }}">
                        <input type="file" name="promo[image_files][{{ $n }}]" accept="image/jpeg,image/png,image/webp,image/gif" class="{{ $file }}" aria-label="Upload picture {{ $n + 1 }}">
                    </div>
                @endforeach
            </div>
        </section>

        {{-- 3. Section pictures --}}
        <section class="{{ $card }}" aria-labelledby="showcase-title">
            <h3 id="showcase-title" class="font-black text-gray-900 text-base">Section pictures</h3>
            <p class="text-xs text-gray-500 mt-0.5 mb-4">The tall picture beside each product section on large screens. Best size: a tall picture about <b>440 × 760 px</b>.</p>
            <div class="grid md:grid-cols-3 gap-4">
                @foreach($showcaseNames as $key => $name)
                    @php $b = $banners['showcase'][$key]; @endphp
                    <div class="rounded-2xl border border-gray-200 p-4 bg-gray-50/50 space-y-2.5">
                        <p class="text-xs font-black text-gray-800">{{ $name }}</p>
                        <div class="h-40 rounded-xl overflow-hidden bg-white border border-gray-100 flex items-center justify-center">
                            <img src="{{ $b['image'] }}" alt="" class="max-h-full max-w-full object-contain">
                        </div>
                        <div>
                            <label class="{{ $label }}">Picture (web address)</label>
                            <input type="text" name="showcase[{{ $key }}][image]" value="{{ $b['image'] }}" maxlength="2048" class="{{ $field }}">
                            <input type="file" name="showcase[{{ $key }}][image_file]" accept="image/jpeg,image/png,image/webp,image/gif" class="mt-1.5 {{ $file }}">
                        </div>
                        <div>
                            <label class="{{ $label }}">Description</label>
                            <input type="text" name="showcase[{{ $key }}][alt]" value="{{ $b['alt'] }}" maxlength="300" class="{{ $field }}">
                        </div>
                        <div>
                            <label class="{{ $label }}">Link when clicked</label>
                            <input type="text" name="showcase[{{ $key }}][link]" value="{{ $b['link'] }}" maxlength="500" class="{{ $field }}">
                        </div>
                    </div>
                @endforeach
            </div>
        </section>

        {{-- 4. Row tiles --}}
        <section class="{{ $card }}" aria-labelledby="tiles-title">
            <h3 id="tiles-title" class="font-black text-gray-900 text-base">Row tiles</h3>
            <p class="text-xs text-gray-500 mt-0.5 mb-4">The first tile of the Family Membership Plans, Bundle boxes and Gift Baskets rows. Without a picture it shows its icon on a soft background. Best picture size: a tall picture about <b>380 × 560 px</b>.</p>
            <div class="grid md:grid-cols-3 gap-4">
                @foreach($tileNames as $key => $name)
                    @php $tile = $banners['tiles'][$key]; @endphp
                    <div class="rounded-2xl border border-gray-200 p-4 bg-gray-50/50 space-y-2.5">
                        <p class="text-xs font-black text-gray-800">{{ $name }}</p>
                        <div class="h-40 rounded-xl overflow-hidden bg-gradient-to-br from-[#dff3d4] via-[#f4efe0] to-[#e9dcc0] border border-gray-100 flex items-center justify-center">
                            @if($tile['image'])
                                <img src="{{ $tile['image'] }}" alt="" class="w-full h-full object-cover">
                            @else
                                <span class="text-[11px] font-bold text-fresh-800/70">Icon (no picture set)</span>
                            @endif
                        </div>
                        <div>
                            <label class="{{ $label }}">Label on the tile</label>
                            <input type="text" name="tiles[{{ $key }}][label]" value="{{ $tile['label'] }}" maxlength="60" class="{{ $field }}">
                        </div>
                        <div>
                            <label class="{{ $label }}">Picture (web address, empty = icon)</label>
                            <input type="text" name="tiles[{{ $key }}][image]" value="{{ $tile['image'] }}" maxlength="2048" class="{{ $field }}">
                            <input type="file" name="tiles[{{ $key }}][image_file]" accept="image/jpeg,image/png,image/webp,image/gif" class="mt-1.5 {{ $file }}">
                        </div>
                        <div>
                            <label class="{{ $label }}">Link when clicked</label>
                            <input type="text" name="tiles[{{ $key }}][link]" value="{{ $tile['link'] }}" maxlength="500" class="{{ $field }}">
                        </div>
                    </div>
                @endforeach
            </div>
        </section>

        <div class="sticky bottom-4 flex justify-end">
            <button type="submit" class="px-7 h-12 rounded-2xl text-sm font-bold bg-fresh-600 hover:bg-fresh-700 active:bg-fresh-800 text-white shadow-xl shadow-fresh-600/30">
                Save banners
            </button>
        </div>
    </form>
</div>

<template id="slideTemplate">
    @include('admin.partials.banner-slide', ['i' => '__INDEX__', 's' => []])
</template>

<script>
    let nextSlide = {{ count($banners['hero']) + 1000 }};
    // A new slider row, empty or filled with a slide (picture, phone picture, description, link)
    function addSlide(slide) {
        const html = document.getElementById('slideTemplate').innerHTML.replaceAll('__INDEX__', String(nextSlide++));
        const holder = document.createElement('div');
        holder.innerHTML = html.trim();
        const row = holder.firstElementChild;
        row.querySelector('input[name$="[order]"]').value = document.querySelectorAll('#slides .slide-row').length + 1;
        if (slide) {
            ['image', 'image_mobile', 'alt', 'link'].forEach(k => {
                const input = row.querySelector(`input[name$="[${k}]"]`);
                if (input && slide[k]) input.value = slide[k];
            });
            const preview = row.querySelector('.aspect-\\[2496\\/917\\]');
            if (preview && slide.image) preview.innerHTML = `<img src="${slide.image_mobile || slide.image}" alt="" class="w-full h-full object-cover">`;
        }
        document.getElementById('slides').appendChild(row);
        if (!slide) row.querySelector('input[type="text"]').focus();
        else row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
</script>
@endsection

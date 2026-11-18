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
            <p class="text-xs text-gray-500">The slider, the green promo banner and the pictures beside the Fresh Fruits, Fresh Vegetables and Premium Nuts sections. Saved changes show on the website straight away.</p>
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
    function addSlide() {
        const html = document.getElementById('slideTemplate').innerHTML.replaceAll('__INDEX__', String(nextSlide++));
        const holder = document.createElement('div');
        holder.innerHTML = html.trim();
        const row = holder.firstElementChild;
        row.querySelector('input[name$="[order]"]').value = document.querySelectorAll('#slides .slide-row').length + 1;
        document.getElementById('slides').appendChild(row);
        row.querySelector('input[type="text"]').focus();
    }
</script>
@endsection

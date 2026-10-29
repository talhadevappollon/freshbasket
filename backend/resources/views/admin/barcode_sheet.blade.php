<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fresh House — Shelf Barcode Labels</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
    <style>
        @media print {
            .no-print { display: none !important; }
            body { background: white !important; padding: 0 !important; }
            .page-break { page-break-after: always; }
            @page { margin: 8mm; size: A4; }
        }
    </style>
</head>
<body class="bg-gray-100 text-gray-900 font-sans p-6">

    <!-- Controls (Hidden on Print) -->
    <div class="no-print max-w-6xl mx-auto mb-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-wrap items-center justify-between gap-4">
        <div>
            <h1 class="text-xl font-black text-gray-900 flex items-center gap-2">
                <i class="fa-solid fa-barcode text-emerald-600"></i>
                <span>Fresh House Shelf Barcode Generator</span>
            </h1>
            <p class="text-xs text-gray-500">Printable A4 adhesive stickers (30 per page) for physical supermarket shelving and POS counter scanning</p>
        </div>

        <div class="flex items-center space-x-3">
            <form action="{{ route('admin.products.barcode_sheet') }}" method="GET" class="flex items-center space-x-2">
                <select name="category" onchange="this.form.submit()" class="px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold">
                    <option value="">All Categories</option>
                    @foreach($categories as $cat)
                        <option value="{{ $cat->id }}" {{ request('category') == $cat->id ? 'selected' : '' }}>{{ $cat->name }}</option>
                    @endforeach
                </select>
            </form>

            <button onclick="window.print()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow flex items-center gap-2">
                <i class="fa-solid fa-print"></i>
                <span>Print Shelf Labels</span>
            </button>

            <a href="{{ route('admin.products') }}" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold">
                Back to Catalog
            </a>
        </div>
    </div>

    <!-- Printable Grid (A4 Standard 3x10 or 3x8) -->
    <div class="max-w-6xl mx-auto bg-white p-4 sm:p-6 rounded-2xl shadow print:shadow-none print:p-0">
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3 print:grid-cols-3 print:gap-2">
            @forelse($products as $p)
                <div class="border-2 border-dashed border-gray-300 print:border-gray-400 rounded-xl p-3 flex flex-col justify-between bg-white relative overflow-hidden h-44">
                    <!-- Top Brand & Category -->
                    <div class="flex items-center justify-between border-b border-gray-100 pb-1 mb-1">
                        <span class="text-[9px] font-black tracking-widest text-emerald-700 uppercase">FRESH HOUSE</span>
                        <span class="text-[9px] text-gray-500 font-mono">{{ $p->sku }}</span>
                    </div>

                    <!-- Product Name -->
                    <div class="my-auto">
                        <h4 class="text-xs font-bold text-gray-900 line-clamp-2 leading-tight">{{ $p->name }}</h4>
                        <span class="text-[10px] text-gray-500">{{ $p->unit ?? 'Per Pack' }}</span>
                    </div>

                    <!-- Price in PKR -->
                    <div class="flex items-baseline justify-between mt-1">
                        <span class="text-[10px] font-bold text-gray-400">RETAIL</span>
                        <span class="text-base font-black text-emerald-800">PKR {{ number_format($p->price, 0) }}</span>
                    </div>

                    <!-- SVG Barcode -->
                    <div class="flex justify-center items-center mt-1">
                        <svg class="barcode-svg" data-barcode="{{ $p->barcode ?: $p->sku }}"></svg>
                    </div>
                </div>
            @empty
                <div class="col-span-3 text-center py-12 text-gray-400">
                    No products found for barcode printing.
                </div>
            @endforelse
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('.barcode-svg').forEach(function(el) {
                const code = el.getAttribute('data-barcode');
                try {
                    JsBarcode(el, code, {
                        format: "CODE128",
                        width: 1.2,
                        height: 28,
                        fontSize: 9,
                        margin: 0,
                        displayValue: true
                    });
                } catch(e) {
                    console.error("Barcode render error:", e);
                }
            });
        });
    </script>
</body>
</html>
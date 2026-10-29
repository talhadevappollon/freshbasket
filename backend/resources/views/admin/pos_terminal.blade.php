@extends('admin.layout')

@section('content')
<div class="max-w-7xl mx-auto space-y-6">
    <!-- POS Terminal Top Bar -->
    <div class="bg-gradient-to-r from-fresh-950 via-fresh-900 to-fresh-800 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <div class="flex items-center space-x-2">
                <span class="w-3 h-3 rounded-full bg-fresh-400 animate-pulse"></span>
                <span class="text-xs font-bold uppercase tracking-wider text-emerald-300">Physical Counter Terminal Ready</span>
            </div>
            <h1 class="text-2xl font-black tracking-tight mt-1">Point Of Sale (POS) Cashier Register</h1>
            <p class="text-xs text-emerald-200/80">Scan barcodes or select items to ring up in-store walk-in sales</p>
        </div>

        <div class="flex items-center space-x-3 text-xs">
            <div class="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15">
                <span class="text-emerald-300 font-semibold block text-[10px]">REGISTER ID</span>
                <span class="font-mono font-bold">TERMINAL-01 (Karachi Main)</span>
            </div>
            <div class="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15">
                <span class="text-emerald-300 font-semibold block text-[10px]">INVENTORY SOURCE</span>
                <span class="font-mono font-bold text-fresh-300">MySQL 3307 Sync</span>
            </div>
        </div>
    </div>

    <!-- Main POS Grid: Catalog on Left (60%), Register Ticket on Right (40%) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Left: Scanner & Item Catalog (7 Cols) -->
        <div class="lg:col-span-7 space-y-4">
            <!-- Barcode Scanner Input -->
            <div class="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div class="relative">
                    <input
                        type="text"
                        id="barcodeInput"
                        placeholder="Scan or type barcode (e.g. 896400... or SKU) and press Enter..."
                        aria-label="Scan or type a barcode" class="w-full pl-11 pr-24 h-14 bg-gray-50 border border-gray-200 hover:border-fresh-300 focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 rounded-2xl text-sm font-mono font-bold focus:outline-none focus:bg-white transition"
                        autofocus
                    />
                    <i class="fa-solid fa-barcode text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 text-base" aria-hidden="true"></i>
                    <button
                        onclick="scanCurrentBarcode()"
                        class="absolute right-2 top-2 h-10 bg-fresh-600 hover:bg-fresh-700 active:bg-fresh-800 text-white px-5 rounded-xl text-xs font-bold shadow-sm transition"
                    >
                        Enter
                    </button>
                </div>
                <div class="flex items-center justify-between text-[11px] text-gray-400 mt-2 px-1">
                    <span class="flex items-center flex-wrap gap-x-3 gap-y-1"><span><i class="fa-solid fa-bolt mr-1 text-fresh-600"></i> USB &amp; Bluetooth scanners supported</span><span class="hidden sm:inline"><kbd class="font-mono bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 text-gray-600">F2</kbd> scan &nbsp;<kbd class="font-mono bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 text-gray-600">F4</kbd> cash &nbsp;<kbd class="font-mono bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 text-gray-600">F8</kbd> finish</span></span>
                    <span id="scanNotice" role="status" aria-live="polite" class="text-fresh-700 font-bold"></span>
                </div>
            </div>

            <!-- Quick-Pick Product Tiles -->
            <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div class="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                    <h3 class="font-black text-gray-900 text-base">Quick-Pick Counter Items</h3>
                    <input
                        type="text"
                        id="catalogSearch"
                        onkeyup="filterPosCatalog()"
                        placeholder="Search items..."
                        aria-label="Search counter items" class="h-11 px-4 rounded-xl border border-gray-200 hover:border-fresh-300 text-xs w-full sm:w-56 focus:outline-none focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 transition"
                    />
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[560px] overflow-y-auto pr-1" id="posItemsGrid">
                    @foreach($products as $p)
                    <button
                        onclick="addToPosCart({{ $p->id }}, '{{ addslashes($p->name) }}', {{ $p->price }}, '{{ $p->unit }}', '{{ $p->barcode }}', {{ $p->stock_quantity }})"
                        {{ $p->stock_quantity <= 0 ? 'disabled' : '' }}
                        class="pos-item-card min-h-[96px] p-3 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-fresh-50/70 hover:border-fresh-300 active:bg-fresh-100 disabled:opacity-50 disabled:hover:bg-gray-50/50 disabled:hover:border-gray-100 transition text-left flex flex-col justify-between group"
                        data-name="{{ strtolower($p->name) }}"
                        data-barcode="{{ $p->barcode }}"
                        data-sku="{{ strtolower($p->sku) }}"
                    >
                        <div class="flex items-center space-x-2.5 mb-2">
                            <img src="{{ $p->primary_image ?: 'https://via.placeholder.com/50' }}" class="w-10 h-10 object-contain rounded-xl bg-white border border-gray-100 p-0.5 shrink-0 group-hover:scale-105 transition">
                            <div class="overflow-hidden">
                                <h4 class="text-xs font-bold text-gray-900 line-clamp-1 group-hover:text-fresh-700 transition">{{ $p->name }}</h4>
                                <span class="text-[10px] text-gray-400 font-mono">{{ $p->unit }}</span>
                            </div>
                        </div>

                        <div class="flex items-center justify-between pt-2 border-t border-gray-200/50 text-xs">
                            <span class="font-black text-gray-900">PKR {{ number_format($p->price, 0) }}</span>
                            @if($p->stock_quantity <= 0)
                                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-100 text-brand-700">Out of stock</span>
                            @elseif($p->stock_quantity < 10)
                                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">Only {{ $p->stock_quantity }} left</span>
                            @else
                                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">{{ $p->stock_quantity }} in stock</span>
                            @endif
                        </div>
                    </button>
                    @endforeach
                </div>
            </div>
        </div>

        <!-- Right: Register Ticket & Cash Settlement (5 Cols) -->
        <div class="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5 lg:sticky lg:top-24">
            <div class="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                    <h3 class="font-black text-gray-900 text-lg">Active Register Ticket</h3>
                    <span class="text-xs text-gray-400">Cash Sale Receipt</span>
                </div>
                <button onclick="clearPosCart()" class="h-10 px-4 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl">
                    Clear
                </button>
            </div>

            <!-- Cart Items List -->
            <div id="posCartList" aria-live="polite" class="divide-y divide-gray-100 max-h-72 overflow-y-auto pr-1">
                <div class="py-12 text-center text-gray-400 text-xs" id="posEmptyNotice">
                    <i class="fa-solid fa-basket-shopping text-3xl mb-2 text-gray-300 block"></i>
                    No items on ticket. Scan barcode or click an item on the left.
                </div>
            </div>

            <!-- Receipt Summary -->
            <div class="space-y-2 pt-3 border-t border-gray-100 text-xs text-gray-600">
                <div class="flex justify-between">
                    <span>Items Count:</span>
                    <span id="posItemsCount" class="font-bold text-gray-900">0</span>
                </div>
                <div class="flex justify-between">
                    <span>Subtotal:</span>
                    <span id="posSubtotal" class="font-bold text-gray-900">PKR 0</span>
                </div>
                <div class="flex justify-between pt-2 border-t border-gray-200 text-base font-black text-gray-900">
                    <span>Payable Total:</span>
                    <span id="posTotal" aria-live="polite" class="text-fresh-800 text-xl font-black">PKR 0</span>
                </div>
            </div>

            <!-- Cash Payment Calculator -->
            <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                <label class="block text-xs font-bold text-gray-700">Cash Received from Shopper (PKR)</label>
                <div class="flex flex-wrap gap-2">
                    <input
                        type="number"
                        id="posCashReceived"
                        oninput="calculateChangeDue()"
                        placeholder="e.g. 1000"
                        aria-label="Cash received" class="basis-full h-11 px-3 bg-white border border-gray-200 hover:border-fresh-300 rounded-xl text-sm font-bold font-mono focus:outline-none focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 transition"
                    />
                    <!-- Quick Currency Presets -->
                    <button type="button" onclick="setCashAmount(0)" title="Exact amount" class="flex-1 h-11 px-3 bg-white border border-gray-200 hover:border-fresh-400 hover:bg-fresh-50 hover:text-fresh-800 rounded-xl text-xs font-bold font-mono">Exact</button>
                    <button type="button" onclick="setCashAmount(500)" class="flex-1 h-11 px-3 bg-white border border-gray-200 hover:border-fresh-400 hover:bg-fresh-50 hover:text-fresh-800 rounded-xl text-xs font-bold font-mono">500</button>
                    <button type="button" onclick="setCashAmount(1000)" class="flex-1 h-11 px-3 bg-white border border-gray-200 hover:border-fresh-400 hover:bg-fresh-50 hover:text-fresh-800 rounded-xl text-xs font-bold font-mono">1000</button>
                    <button type="button" onclick="setCashAmount(5000)" class="flex-1 h-11 px-3 bg-white border border-gray-200 hover:border-fresh-400 hover:bg-fresh-50 hover:text-fresh-800 rounded-xl text-xs font-bold font-mono">5000</button>
                </div>

                <div class="flex justify-between items-center pt-2 border-t border-gray-200 text-xs">
                    <span class="font-bold text-gray-600">Change Due to Customer:</span>
                    <span id="posChangeDue" aria-live="polite" class="font-black text-fresh-700 text-base font-mono">PKR 0</span>
                </div>
            </div>

            <!-- Complete Cash Sale Button -->
            <button
                id="posCheckoutBtn"
                onclick="processPosTransaction()"
                disabled
                class="w-full h-14 bg-fresh-600 hover:bg-fresh-700 active:bg-fresh-800 disabled:bg-gray-300 disabled:shadow-none text-white rounded-2xl font-bold text-sm shadow-xl shadow-fresh-600/30 flex items-center justify-center space-x-2 transition"
            >
                <i class="fa-solid fa-receipt"></i>
                <span>Complete Cash Sale & Deduct Stock</span>
            </button>
        </div>
    </div>
</div>

<!-- Toasts (replace blocking alert() dialogs so the cashier never loses the scan field) -->
<div id="posToasts" class="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-[60] flex flex-col gap-2 pointer-events-none" aria-live="assertive"></div>

<!-- POS Interactive Script -->
<script>
    let posCart = [];

    function escapeHtml(v) {
        return String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    function posToast(message, kind) {
        const tone = kind === 'error' ? 'bg-brand-600' : kind === 'warn' ? 'bg-amber-600' : 'bg-fresh-700';
        const icon = kind === 'error' ? 'fa-circle-exclamation' : kind === 'warn' ? 'fa-triangle-exclamation' : 'fa-circle-check';
        const el = document.createElement('div');
        el.className = tone + ' text-white rounded-2xl px-4 py-3 text-sm font-semibold shadow-2xl flex items-start gap-3 animate-menu-in pointer-events-auto';
        el.innerHTML = '<i class="fa-solid ' + icon + ' mt-0.5" aria-hidden="true"></i><span class="whitespace-pre-line">' + escapeHtml(message) + '</span>';
        document.getElementById('posToasts').appendChild(el);
        setTimeout(() => { el.style.transition = 'opacity .3s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, kind === 'error' ? 6000 : 3500);
    }

    // Synthesized Audio Feedback (Web Audio API)
    function playBeep() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1760, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.1);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.1);
        } catch(e) {}
    }

    function playSuccessChime() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime + (idx * 0.07));
                gain.gain.setValueAtTime(0.12, audioCtx.currentTime + (idx * 0.07));
                gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + (idx * 0.07) + 0.2);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(audioCtx.currentTime + (idx * 0.07));
                osc.stop(audioCtx.currentTime + (idx * 0.07) + 0.2);
            });
        } catch(e) {}
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', function(e) {
        if (e.key === 'F2') {
            e.preventDefault();
            document.getElementById('barcodeInput').focus();
        } else if (e.key === 'F4') {
            e.preventDefault();
            document.getElementById('posCashReceived').focus();
        } else if (e.key === 'F8') {
            e.preventDefault();
            processPosTransaction();
        }
    });

    function addToPosCart(id, name, price, unit, barcode, stock) {
        playBeep();
        const existing = posCart.find(it => it.id === id);
        if (existing) {
            if (stock > 0 && existing.quantity >= stock) {
                posToast('Only ' + stock + ' of ' + name + ' in stock.', 'warn');
                return;
            }
            existing.quantity += 1;
        } else {
            posCart.push({ id, name, price, unit, barcode, stock, quantity: 1 });
        }
        renderPosCart();
    }

    function updatePosQty(id, qty) {
        const current = posCart.find(it => it.id === id);
        if (current && qty > current.quantity && current.stock > 0 && qty > current.stock) {
            posToast('Only ' + current.stock + ' of ' + current.name + ' in stock.', 'warn');
            return;
        }
        if (qty <= 0) {
            posCart = posCart.filter(it => it.id !== id);
        } else {
            const item = posCart.find(it => it.id === id);
            if (item) item.quantity = qty;
        }
        renderPosCart();
    }

    function clearPosCart() {
        posCart = [];
        renderPosCart();
    }

    function renderPosCart() {
        const listEl = document.getElementById('posCartList');
        const emptyNotice = document.getElementById('posEmptyNotice');
        const subtotalEl = document.getElementById('posSubtotal');
        const totalEl = document.getElementById('posTotal');
        const countEl = document.getElementById('posItemsCount');
        const checkoutBtn = document.getElementById('posCheckoutBtn');

        if (posCart.length === 0) {
            listEl.innerHTML = `
                <div class="py-12 text-center text-gray-400 text-xs">
                    <i class="fa-solid fa-basket-shopping text-3xl mb-2 text-gray-300 block"></i>
                    No items on ticket. Scan barcode or click an item on the left.
                </div>
            `;
            subtotalEl.innerText = 'PKR 0';
            totalEl.innerText = 'PKR 0';
            countEl.innerText = '0';
            checkoutBtn.disabled = true;
            calculateChangeDue();
            return;
        }

        let html = '';
        let total = 0;
        let count = 0;

        posCart.forEach(item => {
            const lineTotal = item.price * item.quantity;
            total += lineTotal;
            count += item.quantity;

            html += `
                <div class="py-3 flex items-center justify-between text-xs gap-2">
                    <div class="flex-1 min-w-0">
                        <span class="font-bold text-gray-900 block truncate">${escapeHtml(item.name)}</span>
                        <span class="text-[10px] text-gray-400 font-mono">PKR ${item.price.toLocaleString()} x ${item.quantity}</span>
                    </div>

                    <div class="flex items-center shrink-0 rounded-xl border border-gray-200 overflow-hidden">
                        <button onclick="updatePosQty(${item.id}, ${item.quantity - 1})" aria-label="Decrease ${escapeHtml(item.name)}" class="w-10 h-10 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-base">&minus;</button>
                        <span class="font-bold font-mono w-8 text-center">${item.quantity}</span>
                        <button onclick="updatePosQty(${item.id}, ${item.quantity + 1})" aria-label="Increase ${escapeHtml(item.name)}" class="w-10 h-10 bg-fresh-600 hover:bg-fresh-700 text-white font-bold text-base">+</button>
                    </div>

                    <div class="text-right min-w-[76px]">
                        <span class="font-black text-gray-900">PKR ${lineTotal.toLocaleString()}</span>
                    </div>
                </div>
            `;
        });

        listEl.innerHTML = html;
        subtotalEl.innerText = 'PKR ' + total.toLocaleString();
        totalEl.innerText = 'PKR ' + total.toLocaleString();
        countEl.innerText = count.toString();
        checkoutBtn.disabled = false;
        calculateChangeDue();
    }

    function setCashAmount(amt) {
        if (amt === 0) amt = posCart.reduce((sum, it) => sum + it.price * it.quantity, 0);
        document.getElementById('posCashReceived').value = amt || '';
        calculateChangeDue();
    }

    function calculateChangeDue() {
        const total = posCart.reduce((s, it) => s + it.price * it.quantity, 0);
        const cash = parseFloat(document.getElementById('posCashReceived').value) || 0;
        const change = Math.max(0, cash - total);
        document.getElementById('posChangeDue').innerText = 'PKR ' + change.toLocaleString();
    }

    function filterPosCatalog() {
        const query = document.getElementById('catalogSearch').value.toLowerCase().trim();
        const cards = document.querySelectorAll('.pos-item-card');
        cards.forEach(card => {
            const name = card.getAttribute('data-name');
            const barcode = card.getAttribute('data-barcode');
            const sku = card.getAttribute('data-sku');
            if (name.includes(query) || barcode.includes(query) || sku.includes(query)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    function scanCurrentBarcode() {
        const code = document.getElementById('barcodeInput').value.trim();
        if (!code) return;

        const notice = document.getElementById('scanNotice');
        notice.innerText = 'Scanning barcode: ' + code + '...';

        fetch('/api/v1/pos/barcode/' + encodeURIComponent(code))
            .then(res => res.json())
            .then(data => {
                if (data.success && data.product) {
                    const p = data.product;
                    addToPosCart(p.id, p.name, p.price, p.unit, p.barcode, p.stock_quantity);
                    notice.innerText = 'Added: ' + p.name; notice.className = 'text-fresh-700 font-bold';
                    document.getElementById('barcodeInput').value = '';
                } else {
                    notice.innerText = 'Barcode not found!'; notice.className = 'text-brand-600 font-bold'; playBeep();
                }
                setTimeout(() => { notice.innerText = ''; }, 3000);
            })
            .catch(() => {
                notice.innerText = 'Scanner lookup error'; notice.className = 'text-brand-600 font-bold';
            });
    }

    // Enter key listener on barcode input
    document.getElementById('barcodeInput').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            scanCurrentBarcode();
        }
    });

    function processPosTransaction() {
        if (posCart.length === 0) return;

        const total = posCart.reduce((s, it) => s + it.price * it.quantity, 0);
        const cash = parseFloat(document.getElementById('posCashReceived').value) || total;
        if (cash < total) {
            posToast('Cash received (PKR ' + cash.toLocaleString() + ') is less than the total (PKR ' + total.toLocaleString() + ').', 'warn');
            document.getElementById('posCashReceived').focus();
            return;
        }

        const payload = {
            cashier_name: 'Counter 1',
            payment_received: cash,
            items: posCart.map(it => ({
                product_id: it.id,
                quantity: it.quantity
            }))
        };

        const btn = document.getElementById('posCheckoutBtn');
        btn.disabled = true;
        btn.innerText = 'Recording Transaction...';

        fetch('/api/v1/pos/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success && data.order) {
                playSuccessChime();
                posToast(`Sale complete: ${data.order.order_number}\nTotal PKR ${Number(data.order.total).toLocaleString()}. Stock deducted.`, 'ok');
                clearPosCart();
                document.getElementById('posCashReceived').value = '';
                document.getElementById('barcodeInput').focus();
                window.open('/admin/orders/' + data.order.id + '/print', '_blank');
            } else {
                posToast('Could not record the sale: ' + (data.message || 'Unknown error'), 'error');
            }
        })
        .catch(err => {
            posToast('Network error. The sale was not recorded, please try again.', 'error');
        })
        .finally(() => {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-receipt mr-1"></i> Complete Cash Sale & Deduct Stock';
        });
    }
</script>
@endsection


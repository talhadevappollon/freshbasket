<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PosController extends Controller
{
    /**
     * Barcode lookup for physical store barcode scanner
     */
    public function scanBarcode(Request $request, $code)
    {
        $product = Product::where('barcode', $code)
            ->orWhere('sku', $code)
            ->first();

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => "Item with barcode {$code} not found in inventory.",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'product' => $product,
        ]);
    }

    /**
     * POS physical counter checkout
     */
    public function posCheckout(Request $request)
    {
        $validated = $request->validate([
            'register_id' => 'nullable|string',
            'cashier_name' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_received' => 'nullable|numeric',
        ]);

        return DB::transaction(function () use ($validated) {
            $subtotal = 0;
            $itemsData = [];

            foreach ($validated['items'] as $item) {
                $product = Product::lockForUpdate()->findOrFail($item['product_id']);
                $qty = $item['quantity'];
                $lineTotal = $product->price * $qty;
                $subtotal += $lineTotal;

                if ($product->track_stock) {
                    $newBalance = max(0, $product->stock_quantity - $qty);
                    $product->stock_quantity = $newBalance;
                    $product->save();

                    InventoryLog::create([
                        'product_id' => $product->id,
                        'change_qty' => -$qty,
                        'reason' => 'pos_sale',
                        'balance_after' => $newBalance,
                        'operator_name' => $validated['cashier_name'] ?? 'POS Cashier',
                        'notes' => 'Sold at Store POS Counter',
                    ]);
                }

                $itemsData[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'unit' => $product->unit,
                    'price' => $product->price,
                    'quantity' => $qty,
                    'subtotal' => $lineTotal,
                ];
            }

            $orderNumber = 'POS-' . strtoupper(Str::random(6));

            $order = Order::create([
                'order_number' => $orderNumber,
                'customer_name' => 'Walk-in Store Customer',
                'customer_phone' => '0000-0000000',
                'delivery_city' => 'Store Counter',
                'delivery_address' => 'Physical POS Sale',
                'subtotal' => $subtotal,
                'delivery_fee' => 0.00,
                'discount' => 0.00,
                'total' => $subtotal,
                'payment_method' => 'pos_cash',
                'payment_status' => 'paid',
                'order_status' => 'delivered',
                'order_source' => 'pos',
                'order_notes' => 'Cashier: ' . ($validated['cashier_name'] ?? 'Counter 1'),
            ]);

            foreach ($itemsData as $it) {
                $it['order_id'] = $order->id;
                OrderItem::create($it);
            }

            InventoryLog::where('notes', 'Sold at Store POS Counter')
                ->whereNull('reference_id')
                ->update(['reference_id' => $orderNumber]);

            return response()->json([
                'success' => true,
                'message' => 'POS Transaction completed successfully',
                'order' => $order->load('items'),
            ]);
        });
    }

    /**
     * Inventory sync endpoint for physical POS terminals
     */
    public function syncInventory()
    {
        $products = Product::select('id', 'name', 'sku', 'barcode', 'price', 'cost_price', 'stock_quantity')
            ->where('is_active', true)
            ->get();

        return response()->json([
            'success' => true,
            'timestamp' => now()->toIso8601String(),
            'total_items' => $products->count(),
            'inventory' => $products,
        ]);
    }
}


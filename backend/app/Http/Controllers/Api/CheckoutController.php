<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Customer;
use App\Models\Product;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use App\Support\DeliverySlots;

class CheckoutController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:191',
            'customer_phone' => 'required|string|max:50',
            'customer_email' => 'nullable|email|max:191',
            'delivery_city' => 'required|string|max:100',
            'delivery_area' => 'nullable|string|max:100',
            'delivery_address' => 'required|string',
            'order_notes' => 'nullable|string',
            'delivery_date' => 'nullable|date_format:Y-m-d',
            'delivery_window' => 'nullable|string|in:' . implode(',', DeliverySlots::keys()),
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $slotError = DeliverySlots::validate($validated['delivery_date'] ?? null, $validated['delivery_window'] ?? null);
        if ($slotError) {
            return response()->json(['success' => false, 'message' => $slotError], 422);
        }

        // Orders still save if this release is live before its migration has run
        $hasSlotColumns = Schema::hasColumn('orders', 'delivery_window');
        $account = Schema::hasColumn('orders', 'customer_account_id') ? $request->user('sanctum') : null; // signed-in shopper, if any

        return DB::transaction(function () use ($validated, $request, $hasSlotColumns, $account) {
            // 1. Sync / Find Customer (CRM 360)
            $customer = Customer::firstOrCreate(
                ['phone' => $validated['customer_phone']],
                [
                    'name' => $validated['customer_name'],
                    'email' => $validated['customer_email'] ?? null,
                    'city' => $validated['delivery_city'],
                    'area' => $validated['delivery_area'] ?? null,
                    'address' => $validated['delivery_address'],
                    'status' => 'active',
                ]
            );

            // Update details if customer already existed
            $customer->update([
                'name' => $validated['customer_name'],
                'email' => $validated['customer_email'] ?? $customer->email,
                'city' => $validated['delivery_city'],
                'area' => $validated['delivery_area'] ?? $customer->area,
                'address' => $validated['delivery_address'],
            ]);

            // 2. Validate Items, calculate subtotal, and prepare order items
            $subtotal = 0;
            $orderItemsData = [];

            foreach ($validated['items'] as $item) {
                $product = Product::lockForUpdate()->findOrFail($item['product_id']);
                $qty = intval($item['quantity']);

                $lineTotal = $product->price * $qty;
                $subtotal += $lineTotal;

                // Deduct stock if tracking enabled
                if ($product->track_stock) {
                    $newBalance = max(0, $product->stock_quantity - $qty);
                    $product->stock_quantity = $newBalance;
                    $product->save();

                    // Log inventory reduction (POS Audit Trail)
                    InventoryLog::create([
                        'product_id' => $product->id,
                        'change_qty' => -$qty,
                        'reason' => 'online_order',
                        'balance_after' => $newBalance,
                        'operator_name' => 'Online Storefront',
                        'notes' => "Deducted via Online Checkout",
                    ]);
                }

                $orderItemsData[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'unit' => $product->unit,
                    'price' => $product->price,
                    'quantity' => $qty,
                    'subtotal' => $lineTotal,
                ];
            }

            // Free delivery threshold: Orders over PKR 2,500 get Free Delivery; otherwise PKR 150
            $deliveryFee = $subtotal >= 2500 ? 0.00 : 150.00;
            $discount = 0.00;
            $total = $subtotal + $deliveryFee - $discount;

            // Generate order number e.g. FB-83742
            $orderNumber = 'FB-' . strtoupper(Str::random(6));

            // 3. Create Order
            $order = Order::create([
                'order_number' => $orderNumber,
                'customer_id' => $customer->id,
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'] ?? null,
                'customer_phone' => $validated['customer_phone'],
                'delivery_city' => $validated['delivery_city'],
                'delivery_area' => $validated['delivery_area'] ?? null,
                'delivery_address' => $validated['delivery_address'],
                'subtotal' => $subtotal,
                'delivery_fee' => $deliveryFee,
                'discount' => $discount,
                'total' => $total,
                'payment_method' => 'cod', // Cash on Delivery
                'payment_status' => 'unpaid',
                'order_status' => 'pending',
                'order_source' => 'online',
                'order_notes' => $validated['order_notes'] ?? null,
            ] + ($account ? ['customer_account_id' => $account->id] : []) + ($hasSlotColumns ? [
                'delivery_date' => $validated['delivery_date'] ?? null,
                'delivery_window' => $validated['delivery_window'] ?? null,
            ] : []));

            // Save items
            foreach ($orderItemsData as $itemData) {
                $itemData['order_id'] = $order->id;
                OrderItem::create($itemData);
            }

            // Remember the delivery details on the account so the next checkout is pre-filled
            $account?->update([
                'delivery_city' => $validated['delivery_city'],
                'delivery_area' => $validated['delivery_area'] ?? null,
                'delivery_address' => $validated['delivery_address'],
            ]);

            // Update customer totals
            $customer->orders_count = $customer->orders()->count();
            $customer->total_spent = $customer->orders()->sum('total');
            $customer->save();

            // Link inventory logs to this order reference
            InventoryLog::where('notes', 'Deducted via Online Checkout')
                ->whereNull('reference_id')
                ->update(['reference_id' => $orderNumber]);

            return response()->json([
                'success' => true,
                'message' => 'Your order has been placed successfully with Cash on Delivery!',
                'order' => $order->load('items'),
            ], 201);
        });
    }
}


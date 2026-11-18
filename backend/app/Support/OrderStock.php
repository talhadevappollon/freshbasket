<?php

namespace App\Support;

use App\Models\InventoryLog;
use App\Models\Order;
use App\Models\Product;

/**
 * Keeps stock right when staff cancel an order or take a cancellation back.
 *
 * The Stock Audit Trail (inventory_logs) is the record of what an order took off the shelf, so a cancelled order
 * returns exactly that, never more: an old order that was placed while a product was not tracked returns nothing.
 * Un-cancelling takes the order's quantities off again. Every change is written to the Stock Audit Trail.
 */
class OrderStock
{
    public static function statusChanged(Order $order, ?string $previous, string $operator = 'Store Admin'): void
    {
        $cancelledNow = $order->order_status === 'cancelled';
        $wasCancelled = $previous === 'cancelled';
        if ($cancelledNow === $wasCancelled) {
            return;
        }

        $order->loadMissing('items');
        foreach ($order->items->groupBy('product_id') as $productId => $lines) {
            $product = $productId ? Product::find($productId) : null;
            if (! $product || ! $product->track_stock) {
                continue;
            }

            // What this order has taken off the shelf so far (negative), from the audit trail
            $net = (int) InventoryLog::where('product_id', $product->id)->where('reference_id', $order->order_number)->sum('change_qty');
            $change = $cancelledNow
                ? -$net                                          // give back what it took
                : -((int) $lines->sum('quantity')) - $net;       // take its quantity off again
            if ($change === 0) {
                continue;
            }

            $balance = max(0, (int) $product->stock_quantity + $change);
            $product->stock_quantity = $balance;
            $product->save();

            InventoryLog::create([
                'product_id' => $product->id,
                'change_qty' => $change,
                'reason' => $cancelledNow ? 'order_cancelled' : 'order_reinstated',
                'reference_id' => $order->order_number,
                'balance_after' => $balance,
                'operator_name' => $operator,
                'notes' => $cancelledNow ? "Returned to stock: order {$order->order_number} cancelled" : "Taken from stock again: order {$order->order_number} no longer cancelled",
            ]);
        }
    }
}

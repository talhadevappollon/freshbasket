<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Public order tracking. An order number alone is not enough: the phone number used at checkout must
     * match too, and only what a shopper needs to follow the delivery is returned (no address or phone).
     */
    public function show(Request $request, $orderNumber)
    {
        $notFound = response()->json([
            'success' => false,
            'message' => 'We could not find an order matching those details.',
        ], 404);

        $order = Order::with('items')
            ->where('order_number', strtoupper(trim($orderNumber)))
            ->first();

        if (!$order || !$this->samePhone($order->customer_phone, (string) $request->query('phone', ''))) {
            return $notFound;
        }

        return response()->json([
            'success' => true,
            'order' => [
                'order_number' => $order->order_number,
                'order_status' => $order->order_status,
                'payment_method' => $order->payment_method,
                'payment_status' => $order->payment_status,
                'delivery_city' => $order->delivery_city,
                'delivery_area' => $order->delivery_area,
                'delivery_date' => $order->delivery_date?->format('Y-m-d'),
                'delivery_window' => $order->delivery_window,
                'delivery_window_label' => $order->delivery_window_label,
                'subtotal' => $order->subtotal,
                'delivery_fee' => $order->delivery_fee,
                'discount' => $order->discount,
                'total' => $order->total,
                'created_at' => $order->created_at,
                'updated_at' => $order->updated_at,
                'items' => $order->items->map(fn ($i) => [
                    'product_name' => $i->product_name,
                    'unit' => $i->unit,
                    'quantity' => $i->quantity,
                    'price' => $i->price,
                    'subtotal' => $i->subtotal,
                ]),
            ],
        ]);
    }

    /** Compares the last 10 digits, so +92 300 1234567, 0300-1234567 and 3001234567 all match. */
    private function samePhone(string $a, string $b): bool
    {
        $a = substr(preg_replace('/\D+/', '', $a), -10);
        $b = substr(preg_replace('/\D+/', '', $b), -10);

        return strlen($b) >= 7 && $a === $b;
    }
}

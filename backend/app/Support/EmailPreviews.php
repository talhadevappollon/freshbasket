<?php

namespace App\Support;

use App\Mail\OrderPlacedCustomer;
use App\Mail\OrderPlacedStaff;
use App\Mail\OrderStatusChanged;
use App\Mail\TestEmail;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Mail\Mailable;

/**
 * Sample emails for the "Preview" links in Admin → Email Setup, filled with the latest real
 * records when there are any, otherwise with made-up sample data. Nothing is sent or saved.
 */
class EmailPreviews
{
    /** Preview key => email name (the keys match MailSettings::NOTICES where there is one). */
    public const TYPES = [
        'test' => 'Test email',
        'order_customer' => 'Order confirmation',
        'order_staff' => 'New order alert',
        'status_customer' => 'Order status update',
    ];

    public static function make(string $type): Mailable
    {
        return match ($type) {
            'order_customer' => new OrderPlacedCustomer(self::order()),
            'order_staff' => new OrderPlacedStaff(self::order()),
            'status_customer' => new OrderStatusChanged(tap(self::order(), fn ($o) => $o->order_status = request('status', 'dispatched'))),
            default => new TestEmail('Store Manager'),
        };
    }

    /** The latest order, or a sample one (never saved). */
    private static function order(): Order
    {
        $latest = Order::with('items')->latest('id')->first();
        if ($latest && $latest->items->isNotEmpty()) {
            return $latest;
        }

        $order = new Order([
            'order_number' => 'FB-SAMPLE',
            'customer_name' => 'Ayesha Khan',
            'customer_email' => 'ayesha@example.com',
            'customer_phone' => '0321 9876543',
            'delivery_city' => 'Karachi',
            'delivery_area' => 'Clifton Block 4',
            'delivery_address' => 'Apartment 502, Sea View Heights',
            'subtotal' => 2140,
            'delivery_fee' => 150,
            'discount' => 0,
            'total' => 2290,
            'payment_method' => 'cod',
            'order_status' => 'pending',
            'order_notes' => 'Please call at the gate.',
            'delivery_date' => now()->addDay()->toDateString(),
        ]);
        $order->created_at = now();
        $order->setRelation('items', collect([
            new OrderItem(['product_name' => 'Fresh Mango Sindhri', 'unit' => '1 kg', 'price' => 690, 'quantity' => 2, 'subtotal' => 1380]),
            new OrderItem(['product_name' => 'Organic Tomatoes', 'unit' => '500 g', 'price' => 380, 'quantity' => 2, 'subtotal' => 760]),
        ]));

        return $order;
    }
}

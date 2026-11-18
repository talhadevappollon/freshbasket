<?php

namespace App\Mail;

use App\Models\Order;

/** To the customer when staff move an order to processing, dispatched, delivered or cancelled. */
class OrderStatusChanged extends ShopEmail
{
    /** Status => [subject start, heading, message]. Only these statuses send an email. */
    public const MESSAGES = [
        'processing' => ['We are preparing your order', 'We are packing your order', 'Our team is hand-picking and packing your groceries now. We will let you know when it leaves the store.'],
        'dispatched' => ['Your order is on its way', 'Your order is on its way', 'Your rider has left the store with your order. Please keep your phone close: the rider may call when nearby. Payment is cash on delivery.'],
        'delivered' => ['Your order has been delivered', 'Delivered. Enjoy!', 'Your order has been delivered. Thank you for shopping with us. We hope everything is fresh and just right.'],
        'cancelled' => ['Your order has been cancelled', 'Your order was cancelled', 'Your order has been cancelled. If you did not ask for this or have a question, reply to this email or call us and we will sort it out.'],
    ];

    public function __construct(public Order $order)
    {
    }

    protected function subjectLine(): string
    {
        return (self::MESSAGES[$this->order->order_status][0] ?? 'Your order was updated') . " ({$this->order->order_number})";
    }

    protected function viewName(): string
    {
        return 'order-status';
    }

    protected function data(): array
    {
        [, $heading, $message] = self::MESSAGES[$this->order->order_status] ?? [null, 'Your order was updated', 'Your order status changed to ' . $this->order->order_status . '.'];

        return [
            'order' => $this->order,
            'heading' => $heading,
            'statusMessage' => $message,
            'trackUrl' => url('/track') . '?order=' . rawurlencode($this->order->order_number),
        ];
    }
}

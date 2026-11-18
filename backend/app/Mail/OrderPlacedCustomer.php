<?php

namespace App\Mail;

use App\Models\Order;

/** To the customer, right after checkout. */
class OrderPlacedCustomer extends ShopEmail
{
    public function __construct(public Order $order)
    {
    }

    protected function subjectLine(): string
    {
        return "Order {$this->order->order_number} confirmed: thank you, " . (strtok(trim($this->order->customer_name), ' ') ?: 'there') . '!';
    }

    protected function viewName(): string
    {
        return 'order-customer';
    }

    protected function data(): array
    {
        return ['order' => $this->order, 'trackUrl' => url('/track') . '?order=' . rawurlencode($this->order->order_number)];
    }
}

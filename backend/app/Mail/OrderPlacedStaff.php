<?php

namespace App\Mail;

use App\Models\Order;

/** To the staff inboxes for every new website order. Replying writes to the customer. */
class OrderPlacedStaff extends ShopEmail
{
    public function __construct(public Order $order)
    {
        if (filter_var($order->customer_email, FILTER_VALIDATE_EMAIL)) {
            $this->replyTo($order->customer_email, $order->customer_name);
        }
    }

    protected function subjectLine(): string
    {
        return "New order {$this->order->order_number} · PKR " . number_format($this->order->total, 0) . " · {$this->order->customer_name}";
    }

    protected function viewName(): string
    {
        return 'order-staff';
    }

    protected function data(): array
    {
        return ['order' => $this->order, 'adminUrl' => url('/admin/orders') . '?search=' . rawurlencode($this->order->order_number)];
    }
}

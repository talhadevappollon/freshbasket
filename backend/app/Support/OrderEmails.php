<?php

namespace App\Support;

use App\Mail\OrderPlacedCustomer;
use App\Mail\OrderPlacedStaff;
use App\Mail\OrderStatusChanged;
use App\Models\Order;

/** The emails around an order. Each one respects its switch in Admin → Email Setup. */
class OrderEmails
{
    public static function placed(Order $order): void
    {
        $order->loadMissing('items');
        if (filter_var($order->customer_email, FILTER_VALIDATE_EMAIL)) {
            ShopMailer::later($order->customer_email, new OrderPlacedCustomer($order), 'order_customer', $order->order_number);
        }
        ShopMailer::staffLater(new OrderPlacedStaff($order), 'order_staff', $order->order_number);
    }

    /** After staff change the status; only real changes to a status that has a message send an email. */
    public static function statusChanged(Order $order, ?string $previous): void
    {
        if ($previous === $order->order_status || ! isset(OrderStatusChanged::MESSAGES[$order->order_status])) {
            return;
        }
        if (filter_var($order->customer_email, FILTER_VALIDATE_EMAIL)) {
            $order->loadMissing('items');
            ShopMailer::later($order->customer_email, new OrderStatusChanged($order), 'status_customer', $order->order_number);
        }
    }
}

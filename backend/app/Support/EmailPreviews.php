<?php

namespace App\Support;

use App\Mail\OrderPlacedCustomer;
use App\Mail\OrderPlacedStaff;
use App\Mail\OrderStatusChanged;
use App\Mail\TestEmail;
use App\Mail\ContactReceivedCustomer;
use App\Mail\ContactReceivedStaff;
use App\Mail\LowStockStaff;
use App\Mail\ReviewSubmittedStaff;
use App\Mail\WelcomeCustomer;
use App\Mail\PasswordChanged;
use App\Mail\PasswordResetLink;
use App\Models\CrmLead;
use App\Models\CustomerAccount;
use App\Models\Product;
use App\Models\ProductReview;
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
        'contact_staff' => 'Contact form message',
        'contact_customer' => '"We got your message" reply',
        'welcome_customer' => 'Welcome email',
        'password_customer' => 'Password reset link',
        'review_staff' => 'New review alert',
        'low_stock_staff' => 'Low stock alert',
    ];

    public static function make(string $type): Mailable
    {
        return match ($type) {
            'order_customer' => new OrderPlacedCustomer(self::order()),
            'order_staff' => new OrderPlacedStaff(self::order()),
            'status_customer' => new OrderStatusChanged(tap(self::order(), fn ($o) => $o->order_status = request('status', 'dispatched'))),
            'contact_staff' => new ContactReceivedStaff(self::lead()),
            'contact_customer' => new ContactReceivedCustomer(self::lead()),
            'welcome_customer' => new WelcomeCustomer(self::account()),
            'review_staff' => new ReviewSubmittedStaff(ProductReview::latest('id')->first() ?? new ProductReview(['product_name' => 'Fresh Mango Sindhri', 'product_slug' => 'fresh-mango-sindhri', 'customer_name' => 'Bilal Ahmed', 'customer_email' => 'bilal@example.com', 'rating' => 4, 'review_title' => 'Sweet and fresh', 'review_body' => 'Arrived the same day and every mango was ripe. Will order again.'])),
            'low_stock_staff' => new LowStockStaff(self::lowStock(), 'FB-SAMPLE'),
            'password_customer' => request('changed') ? new PasswordChanged(self::account()) : new PasswordResetLink(self::account(), url('/reset-password') . '?token=SAMPLE&email=ayesha%40example.com'),
            default => new TestEmail('Store Manager'),
        };
    }

    private static function account(): CustomerAccount
    {
        return CustomerAccount::latest('id')->first() ?? new CustomerAccount(['name' => 'Ayesha Khan', 'phone' => '0321 9876543', 'email' => 'ayesha@example.com']);
    }

    private static function lead(): CrmLead
    {
        $lead = CrmLead::latest('id')->first();
        if ($lead) {
            return $lead;
        }
        $lead = new CrmLead(['name' => 'Hamza Tariq', 'phone' => '0300 1234567', 'email' => 'hamza@example.com', 'subject' => 'Delivery question · Order FB-SAMPLE', 'message' => "Assalam-o-Alaikum, can my order come after 6 pm today?\nThank you."]);
        $lead->created_at = now();

        return $lead;
    }

    private static function lowStock(): array
    {
        $products = Product::where('track_stock', true)->orderBy('stock_quantity')->limit(2)->get();
        if ($products->isEmpty()) {
            return [['name' => 'Organic Tomatoes', 'sku' => 'FH-0001', 'stock' => 3, 'threshold' => 5]];
        }

        return $products->map(fn ($p) => ['name' => $p->name, 'sku' => $p->sku, 'stock' => (int) $p->stock_quantity, 'threshold' => (int) $p->low_stock_threshold])->all();
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

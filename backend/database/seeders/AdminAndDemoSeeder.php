<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\CrmLead;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminAndDemoSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Admin User
        User::updateOrCreate(
            ['email' => 'admin@freshbasket.com.pk'],
            [
                'name' => 'FreshBasket Admin',
                'password' => Hash::make('admin12345'),
            ]
        );

        // 2. Demo Customers for Karachi CRM
        $customersData = [
            [
                'name' => 'Hamza Tariq',
                'email' => 'hamza.tariq@gmail.com',
                'phone' => '+92 300 1234567',
                'city' => 'Karachi',
                'area' => 'DHA Phase 6',
                'address' => 'House 42-B, Khayaban-e-Seher, Phase 6, DHA',
                'customer_notes' => 'Prefers morning delivery before 11 AM.',
                'status' => 'vip',
            ],
            [
                'name' => 'Ayesha Khan',
                'email' => 'ayesha.k@outlook.com',
                'phone' => '+92 321 9876543',
                'city' => 'Karachi',
                'area' => 'Clifton Block 4',
                'address' => 'Apartment 502, Sea View Heights, Clifton',
                'customer_notes' => 'Call security at the gate on arrival.',
                'status' => 'active',
            ],
            [
                'name' => 'Bilal Ahmed',
                'email' => 'bilal.ahmed@yahoo.com',
                'phone' => '+92 333 4567890',
                'city' => 'Karachi',
                'area' => 'Gulshan-e-Iqbal Block 7',
                'address' => 'House A-114, Block 7, Near Disco Bakery',
                'customer_notes' => 'Always pays COD in exact cash.',
                'status' => 'active',
            ],
            [
                'name' => 'Zainab Fatima',
                'email' => 'zainab.f@gmail.com',
                'phone' => '+92 345 2233445',
                'city' => 'Karachi',
                'area' => 'PECHS Block 2',
                'address' => 'Villa 19, Tariq Road, PECHS',
                'customer_notes' => 'Regular weekend grocery buyer.',
                'status' => 'vip',
            ]
        ];

        $products = Product::where('is_active', true)->take(20)->get();

        foreach ($customersData as $cData) {
            $customer = Customer::updateOrCreate(
                ['phone' => $cData['phone']],
                $cData
            );

            // Create 1-2 realistic sample orders for CRM history
            if ($customer->orders()->count() == 0 && $products->count() > 0) {
                $orderNumber = 'FB-' . strtoupper(Str::random(6));
                $itemsCount = rand(2, 4);
                $selectedProds = $products->random($itemsCount);

                $subtotal = 0;
                $order = Order::create([
                    'order_number' => $orderNumber,
                    'customer_id' => $customer->id,
                    'customer_name' => $customer->name,
                    'customer_email' => $customer->email,
                    'customer_phone' => $customer->phone,
                    'delivery_city' => $customer->city,
                    'delivery_area' => $customer->area,
                    'delivery_address' => $customer->address,
                    'subtotal' => 0,
                    'delivery_fee' => 150.00,
                    'discount' => 0.00,
                    'total' => 0,
                    'payment_method' => 'cod',
                    'payment_status' => 'unpaid',
                    'order_status' => ['pending', 'processing', 'dispatched', 'delivered'][rand(0, 3)],
                    'order_source' => 'online',
                    'order_notes' => 'Please bring fresh produce only.',
                ]);

                foreach ($selectedProds as $prod) {
                    $qty = rand(1, 3);
                    $lineTotal = $prod->price * $qty;
                    $subtotal += $lineTotal;

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $prod->id,
                        'product_name' => $prod->name,
                        'unit' => $prod->unit,
                        'price' => $prod->price,
                        'quantity' => $qty,
                        'subtotal' => $lineTotal,
                    ]);
                }

                $order->subtotal = $subtotal;
                $order->total = $subtotal + 150.00;
                $order->save();

                $customer->orders_count = $customer->orders()->count();
                $customer->total_spent = $customer->orders()->sum('total');
                $customer->save();
            }
        }

        // Demo CRM Leads / Support Inquiries
        CrmLead::updateOrCreate(
            ['phone' => '+92 312 8889900'],
            [
                'name' => 'Usman Sheikh',
                'email' => 'usman.s@company.com',
                'subject' => 'Corporate Bulk Fruit Basket Order Inquiry',
                'message' => 'We want to order 45 fresh fruit and dry fruit gift baskets for our corporate clients in Karachi this Friday.',
                'status' => 'new',
                'agent_notes' => 'Quote sent via WhatsApp.',
            ]
        );

        CrmLead::updateOrCreate(
            ['phone' => '+92 301 5554433'],
            [
                'name' => 'Sadia Rizvi',
                'email' => 'sadia.r@gmail.com',
                'subject' => 'Delivery Timing in DHA Phase 8',
                'message' => 'Do you provide same day express delivery in DHA Phase 8 after 6 PM?',
                'status' => 'contacted',
                'agent_notes' => 'Confirmed 2-hour express slot is available.',
            ]
        );
    }
}

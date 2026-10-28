<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Category;
use App\Models\InventoryLog;
use App\Models\CrmLead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    /**
     * Dashboard Overview
     */
    public function dashboard()
    {
        $totalSales = Order::where('order_status', '!=', 'cancelled')->sum('total');
        $codCollected = Order::where('payment_status', 'paid')->sum('total');
        $codPending = Order::where('payment_status', 'unpaid')->where('order_status', '!=', 'cancelled')->sum('total');
        $totalOrders = Order::count();
        $pendingOrders = Order::where('order_status', 'pending')->count();
        $totalCustomers = Customer::count();
        $lowStockCount = Product::where('track_stock', true)->whereColumn('stock_quantity', '<=', 'low_stock_threshold')->count();

        $recentOrders = Order::with('items')->latest()->take(8)->get();
        $lowStockProducts = Product::where('track_stock', true)
            ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
            ->take(6)
            ->get();

        $recentLeads = CrmLead::latest()->take(5)->get();

        return view('admin.dashboard', compact(
            'totalSales',
            'codCollected',
            'codPending',
            'totalOrders',
            'pendingOrders',
            'totalCustomers',
            'lowStockCount',
            'recentOrders',
            'lowStockProducts',
            'recentLeads'
        ));
    }

    /**
     * Orders CRM
     */
    public function orders(Request $request)
    {
        $query = Order::with(['items', 'customer'])->latest();

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('order_status', $request->status);
        }

        if ($request->filled('payment') && $request->payment !== 'all') {
            $query->where('payment_status', $request->payment);
        }

        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(function ($q) use ($term) {
                $q->where('order_number', 'like', "%{$term}%")
                  ->orWhere('customer_name', 'like', "%{$term}%")
                  ->orWhere('customer_phone', 'like', "%{$term}%");
            });
        }

        $orders = $query->paginate(15)->withQueryString();
        return view('admin.orders', compact('orders'));
    }

    /**
     * Update Order Status & COD Payment
     */
    public function updateOrderStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        
        if ($request->has('order_status')) {
            $order->order_status = $request->order_status;
            // Auto mark payment as paid if delivered
            if ($request->order_status === 'delivered' && $order->payment_status === 'unpaid') {
                $order->payment_status = 'paid';
            }
        }

        if ($request->has('payment_status')) {
            $order->payment_status = $request->payment_status;
        }

        $order->save();

        return redirect()->back()->with('success', "Order {$order->order_number} status updated successfully!");
    }

    /**
     * Printable Order Packing Slip / Thermal Invoice
     */
    public function printOrder($id)
    {
        $order = Order::with('items')->findOrFail($id);
        return view('admin.print_order', compact('order'));
    }

    /**
     * Products & Inventory Control
     */
    public function products(Request $request)
    {
        $query = Product::with('category')->latest();

        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('sku', 'like', "%{$term}%")
                  ->orWhere('barcode', 'like', "%{$term}%");
            });
        }

        if ($request->filled('low_stock')) {
            $query->whereColumn('stock_quantity', '<=', 'low_stock_threshold');
        }

        $products = $query->paginate(20)->withQueryString();
        $categories = Category::orderBy('name')->get();

        return view('admin.products', compact('products', 'categories'));
    }

    /**
     * Adjust Product Stock (POS Ready)
     */
    public function adjustStock(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $request->validate([
            'change_qty' => 'required|integer',
            'reason' => 'required|string',
        ]);

        $change = intval($request->change_qty);
        $newBalance = max(0, $product->stock_quantity + $change);
        $product->stock_quantity = $newBalance;
        $product->save();

        InventoryLog::create([
            'product_id' => $product->id,
            'change_qty' => $change,
            'reason' => $request->reason,
            'reference_id' => 'ADMIN-ADJ-' . strtoupper(Str::random(4)),
            'balance_after' => $newBalance,
            'operator_name' => 'Store Admin',
            'notes' => $request->notes ?? 'Manual inventory adjustment via CRM',
        ]);

        return redirect()->back()->with('success', "Stock updated for {$product->name}. New balance: {$newBalance}");
    }

    /**
     * Store or Update Product
     */
    public function saveProduct(Request $request, $id = null)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:191',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'barcode' => 'nullable|string|max:100',
            'unit' => 'nullable|string|max:50',
            'primary_image' => 'nullable|url',
        ]);

        if ($id) {
            $product = Product::findOrFail($id);
            $product->update($validated);
            $msg = "Product {$product->name} updated successfully!";
        } else {
            $validated['slug'] = Str::slug($validated['name']) . '-' . rand(1000, 9999);
            $validated['sku'] = 'FB-' . strtoupper(Str::random(6));
            $product = Product::create($validated);
            $msg = "Product {$product->name} created successfully!";
        }

        return redirect()->route('admin.products')->with('success', $msg);
    }

    /**
     * Customers CRM
     */
    public function customers(Request $request)
    {
        $query = Customer::withCount('orders')->latest('total_spent');

        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('phone', 'like', "%{$term}%")
                  ->orWhere('email', 'like', "%{$term}%")
                  ->orWhere('area', 'like', "%{$term}%");
            });
        }

        $customers = $query->paginate(15)->withQueryString();
        return view('admin.customers', compact('customers'));
    }

    /**
     * Update Customer Notes / Status
     */
    public function updateCustomer(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);
        $customer->update([
            'customer_notes' => $request->customer_notes,
            'status' => $request->status ?? $customer->status,
        ]);

        return redirect()->back()->with('success', "Customer details updated.");
    }

    /**
     * Inventory Logs (POS & Online synchronization audit)
     */
    public function inventoryLogs(Request $request)
    {
        $logs = InventoryLog::with('product')->latest()->paginate(25);
        return view('admin.inventory_logs', compact('logs'));
    }

    /**
     * CRM Leads / Inquiries
     */
    public function leads(Request $request)
    {
        $leads = CrmLead::latest()->paginate(15);
        return view('admin.leads', compact('leads'));
    }

    public function updateLead(Request $request, $id)
    {
        $lead = CrmLead::findOrFail($id);
        $lead->update([
            'status' => $request->status,
            'agent_notes' => $request->agent_notes,
        ]);

        return redirect()->back()->with('success', "Inquiry #{$lead->id} updated.");
    }
}

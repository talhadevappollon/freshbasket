<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AdminController;

Route::get('/', function () {
    return redirect()->route('admin.dashboard');
});

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/dashboard', [AdminController::class, 'dashboard']);

    // Orders CRM & COD
    Route::get('/orders', [AdminController::class, 'orders'])->name('orders');
    Route::post('/orders/{id}/status', [AdminController::class, 'updateOrderStatus'])->name('orders.update_status');
    Route::get('/orders/{id}/print', [AdminController::class, 'printOrder'])->name('print_order');

    // Products & Inventory Control
    Route::get('/products', [AdminController::class, 'products'])->name('products');
    Route::post('/products/{id}/stock', [AdminController::class, 'adjustStock'])->name('products.adjust_stock');
    Route::post('/products/save/{id?}', [AdminController::class, 'saveProduct'])->name('products.save');

    // Customers CRM 360
    Route::get('/customers', [AdminController::class, 'customers'])->name('customers');
    Route::post('/customers/{id}', [AdminController::class, 'updateCustomer'])->name('customers.update');

    // POS & Inventory Audit Trail
    Route::get('/inventory-logs', [AdminController::class, 'inventoryLogs'])->name('inventory_logs');

    // Leads / Customer Inquiries
    Route::get('/leads', [AdminController::class, 'leads'])->name('leads');
    Route::post('/leads/{id}', [AdminController::class, 'updateLead'])->name('leads.update');
});

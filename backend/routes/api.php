<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PosController;
use App\Http\Controllers\Api\CrmController;

Route::prefix('v1')->group(function () {
    // Products
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);

    // Categories
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{slug}', [CategoryController::class, 'show']);

    // Checkout (COD)
    Route::post('/checkout', [CheckoutController::class, 'store']);

    // Order Tracking
    Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);

    // CRM / Support Leads
    Route::post('/crm/inquiries', [CrmController::class, 'storeInquiry']);

    // POS Integration Endpoints (For future physical store counter)
    Route::prefix('pos')->group(function () {
        Route::get('/barcode/{code}', [PosController::class, 'scanBarcode']);
        Route::post('/checkout', [PosController::class, 'posCheckout']);
        Route::get('/sync', [PosController::class, 'syncInventory']);
    });
});

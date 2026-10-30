<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PosController;
use App\Http\Controllers\Api\CrmController;
use App\Http\Controllers\Api\AccountController;

Route::prefix('v1')->group(function () {
    // Products
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);

    // Categories
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{slug}', [CategoryController::class, 'show']);

    // Checkout (COD)
    Route::post('/checkout', [CheckoutController::class, 'store']);
    Route::post('/coupons/validate', function (Request $request) {
        $request->validate(['code' => 'required|string', 'subtotal' => 'required|numeric']);
        $code = strtoupper(trim($request->code));
        $subtotal = floatval($request->subtotal);

        $coupon = \App\Models\Coupon::where('code', $code)->where('is_active', true)->first();
        if (!$coupon) {
            return response()->json(['success' => false, 'message' => 'Invalid or expired voucher code.'], 404);
        }

        if ($coupon->min_spend > 0 && $subtotal < $coupon->min_spend) {
            return response()->json([
                'success' => false,
                'message' => "This voucher requires a minimum cart total of PKR " . number_format($coupon->min_spend, 0) . "."
            ], 422);
        }

        if ($coupon->expires_at && now()->isAfter($coupon->expires_at)) {
            return response()->json(['success' => false, 'message' => 'This promo code has expired.'], 422);
        }

        if ($coupon->usage_limit > 0 && $coupon->used_count >= $coupon->usage_limit) {
            return response()->json(['success' => false, 'message' => 'Voucher usage limit reached.'], 422);
        }

        $discount = 0;
        if ($coupon->discount_type === 'percentage') {
            $discount = round(($subtotal * $coupon->discount_value) / 100, 2);
            if ($coupon->max_discount && $discount > $coupon->max_discount) {
                $discount = $coupon->max_discount;
            }
        } else {
            $discount = min($coupon->discount_value, $subtotal);
        }

        return response()->json([
            'success' => true,
            'coupon' => [
                'code' => $coupon->code,
                'title' => $coupon->title,
                'discount' => $discount,
                'discount_type' => $coupon->discount_type,
                'discount_value' => $coupon->discount_value,
            ],
            'message' => "Promo '{$coupon->code}' applied successfully! Saved PKR {$discount}."
        ]);
    });

    // Order Tracking
    Route::get('/orders/{orderNumber}', [OrderController::class, 'show'])->middleware('throttle:20,1');

    // Shopper accounts (token based). Sign-in and sign-up are throttled.
    Route::prefix('account')->group(function () {
        Route::post('/register', [AccountController::class, 'register'])->middleware('throttle:10,1');
        Route::post('/login', [AccountController::class, 'login'])->middleware('throttle:10,1');
        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/me', [AccountController::class, 'me']);
            Route::post('/logout', [AccountController::class, 'logout']);
            Route::get('/orders', [AccountController::class, 'orders']);
        });
    });

    // CRM / Support Leads
    Route::post('/crm/inquiries', [CrmController::class, 'storeInquiry']);

    // POS Integration Endpoints (For future physical store counter)
    Route::prefix('pos')->middleware('pos.enabled')->group(function () {
        Route::get('/barcode/{code}', [PosController::class, 'scanBarcode']);
        Route::post('/checkout', [PosController::class, 'posCheckout']);
        Route::get('/sync', [PosController::class, 'syncInventory']);
    });
});

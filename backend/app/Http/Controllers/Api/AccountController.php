<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomerAccount;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AccountController extends Controller
{
    private const TOKEN_DAYS = 60;

    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:191',
            'phone' => ['required', 'string', 'max:50', function ($attr, $value, $fail) {
                if (strlen(CustomerAccount::phoneKey($value)) < 10) {
                    $fail('Enter a valid mobile number, for example 0300 1234567.');
                }
            }],
            'email' => 'nullable|email|max:191|unique:customer_accounts,email',
            'password' => 'required|string|min:6|max:100',
        ], [
            'email.unique' => 'An account with this email already exists. Please sign in.',
            'password.min' => 'Your password needs at least 6 characters.',
        ]);

        $key = CustomerAccount::phoneKey($data['phone']);
        if (CustomerAccount::where('phone_key', $key)->exists()) {
            throw ValidationException::withMessages(['phone' => 'An account with this phone number already exists. Please sign in.']);
        }

        $account = CustomerAccount::create([
            'name' => trim($data['name']),
            'phone' => trim($data['phone']),
            'phone_key' => $key,
            'email' => !empty($data['email']) ? strtolower(trim($data['email'])) : null,
            'password' => $data['password'],
        ]);

        return response()->json($this->session($account), 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'login' => 'required|string|max:191',
            'password' => 'required|string|max:100',
        ]);

        $login = trim($data['login']);
        $account = str_contains($login, '@')
            ? CustomerAccount::where('email', strtolower($login))->first()
            : CustomerAccount::where('phone_key', CustomerAccount::phoneKey($login))->first();

        // One message for "no such account" and "wrong password" so the form cannot be used to find out who has an account
        if (!$account || !Hash::check($data['password'], $account->password)) {
            throw ValidationException::withMessages(['login' => 'That phone, email or password is not right.']);
        }

        return response()->json($this->session($account));
    }

    public function me(Request $request)
    {
        return response()->json(['account' => $request->user()]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['success' => true]);
    }

    /** The orders this account placed while signed in, newest first. */
    public function orders(Request $request)
    {
        $orders = Order::withCount('items')
            ->where('customer_account_id', $request->user()->id)
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn (Order $o) => [
                'order_number' => $o->order_number,
                'order_status' => $o->order_status,
                'total' => $o->total,
                'items_count' => $o->items_count,
                'delivery_date' => $o->delivery_date?->format('Y-m-d'),
                'delivery_window_label' => $o->delivery_window_label,
                'created_at' => $o->created_at,
            ]);

        return response()->json(['orders' => $orders]);
    }

    private function session(CustomerAccount $account): array
    {
        return [
            'token' => $account->createToken('storefront', ['*'], now()->addDays(self::TOKEN_DAYS))->plainTextToken,
            'account' => $account,
        ];
    }
}

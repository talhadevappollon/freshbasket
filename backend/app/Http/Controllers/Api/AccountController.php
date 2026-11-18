<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\PasswordChanged;
use App\Mail\PasswordResetLink;
use App\Mail\WelcomeCustomer;
use App\Models\CustomerAccount;
use App\Support\MailSettings;
use App\Support\ShopMailer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AccountController extends Controller
{
    private const TOKEN_DAYS = 60;

    /** How long a "forgot password" link works. */
    private const RESET_MINUTES = 60;

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

        if ($account->email) {
            ShopMailer::later($account->email, new WelcomeCustomer($account), 'welcome_customer', 'Account #' . $account->id);
        }

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

    /**
     * "Forgot password": emails a reset link when an account uses this address. The answer is the same either way,
     * so the form cannot be used to find out who has an account.
     */
    public function forgotPassword(Request $request)
    {
        $data = $request->validate(['email' => 'required|email|max:191']);

        if (! MailSettings::isReady() || ! MailSettings::noticeOn('password_customer') || ! Schema::hasTable('customer_password_resets')) {
            return response()->json([
                'success' => false,
                'message' => 'Resetting a password by email is not available right now. Please call or WhatsApp us and we will help you sign in.',
            ], 503);
        }

        $account = CustomerAccount::where('email', strtolower(trim($data['email'])))->first();
        // At most one link a minute per account
        $recent = $account && DB::table('customer_password_resets')
            ->where('customer_account_id', $account->id)
            ->where('created_at', '>', now()->subMinute())
            ->exists();

        if ($account && ! $recent) {
            $token = Str::random(64);
            DB::table('customer_password_resets')->where('customer_account_id', $account->id)->delete();
            DB::table('customer_password_resets')->insert([
                'customer_account_id' => $account->id,
                'token_hash' => hash('sha256', $token),
                'expires_at' => now()->addMinutes(self::RESET_MINUTES),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $url = url('/reset-password') . '?' . http_build_query(['token' => $token, 'email' => $account->email]);
            ShopMailer::later($account->email, new PasswordResetLink($account, $url, self::RESET_MINUTES), 'password_customer', 'Account #' . $account->id);
        }

        return response()->json([
            'success' => true,
            'message' => 'If an account uses this email, we have sent it a link to choose a new password. Check your inbox (and the spam folder). The link works for ' . self::RESET_MINUTES . ' minutes.',
        ]);
    }

    /** Sets a new password from a reset link, signs every other device out and signs this one in. */
    public function resetPassword(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email|max:191',
            'token' => 'required|string|size:64',
            'password' => 'required|string|min:6|max:100|confirmed',
        ], [
            'password.min' => 'Your password needs at least 6 characters.',
            'password.confirmed' => 'The two passwords do not match.',
        ]);

        $invalid = ValidationException::withMessages(['token' => 'This reset link is not valid any more. Ask for a new one below.']);
        $account = CustomerAccount::where('email', strtolower(trim($data['email'])))->first();
        if (! $account || ! Schema::hasTable('customer_password_resets')) {
            throw $invalid;
        }
        $row = DB::table('customer_password_resets')
            ->where('customer_account_id', $account->id)
            ->where('expires_at', '>', now())
            ->latest('id')
            ->first();
        if (! $row || ! hash_equals($row->token_hash, hash('sha256', $data['token']))) {
            throw $invalid;
        }

        $account->password = $data['password']; // hashed by the model cast
        $account->save();
        DB::table('customer_password_resets')->where('customer_account_id', $account->id)->delete();
        $account->tokens()->delete(); // sign out every other device

        ShopMailer::later($account->email, new PasswordChanged($account), 'password_customer', 'Account #' . $account->id);

        return response()->json($this->session($account) + ['message' => 'Your password is changed and you are signed in.']);
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

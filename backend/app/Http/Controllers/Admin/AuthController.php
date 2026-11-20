<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Staff sign-in for the admin panel (/admin). Staff are the rows of the `users` table;
 * accounts are created with `php artisan admin:user` or from ADMIN_EMAIL / ADMIN_PASSWORD in .env.
 */
class AuthController extends Controller
{
    /** Session flag: the account still uses a password published in the repository. */
    public const MUST_CHANGE = 'admin_must_change_password';

    private const MAX_TRIES = 5;

    public function showLogin()
    {
        return view('admin.login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email|max:255',
            'password' => 'required|string|max:255',
        ]);

        $key = Str::lower($credentials['email']) . '|' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, self::MAX_TRIES)) {
            throw ValidationException::withMessages([
                'email' => 'Too many sign-in attempts. Try again in ' . RateLimiter::availableIn($key) . ' seconds.',
            ]);
        }

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            RateLimiter::hit($key, 60);
            throw ValidationException::withMessages(['email' => 'That email and password do not match a staff account.']);
        }

        RateLimiter::clear($key);
        $request->session()->regenerate();

        if ($this->isStarterPassword($credentials['password'])) {
            $request->session()->put(self::MUST_CHANGE, true);

            return redirect()->route('admin.password')
                ->with('success', 'This account still uses the starter password. Choose a new one to continue.');
        }

        return redirect()->intended(route('admin.dashboard'));
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login')->with('status', 'You are signed out.')
            ->withoutCookie(\App\Support\ShopPreview::COOKIE); // the hidden shop is no longer shown in this browser
    }

    public function showPassword()
    {
        return view('admin.password', ['mustChange' => session(self::MUST_CHANGE, false)]);
    }

    public function updatePassword(Request $request)
    {
        $min = (int) config('admin.min_password_length', 10);
        $request->validate([
            'current_password' => 'required|current_password',
            'password' => ['required', 'string', "min:$min", 'max:255', 'confirmed', Rule::notIn(config('admin.starter_passwords', []))],
        ], [
            'current_password.current_password' => 'Your current password is not right.',
            'password.not_in' => 'Choose a password that is not the starter password.',
            'password.confirmed' => 'The two new passwords do not match.',
        ]);

        $user = $request->user();
        $user->password = $request->input('password'); // hashed by the model cast
        $user->save();

        $request->session()->forget(self::MUST_CHANGE);
        $request->session()->regenerate();

        return redirect()->route('admin.dashboard')->with('success', 'Your password is changed.');
    }

    private function isStarterPassword(string $password): bool
    {
        return in_array($password, config('admin.starter_passwords', []), true);
    }
}

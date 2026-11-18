<?php

namespace App\Http\Middleware;

use App\Http\Controllers\Admin\AuthController;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * A staff account that signed in with a password published in the repository may open only the
 * "change password" page (and sign out) until it picks a new one.
 */
class RequireNewAdminPassword
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->session()->get(AuthController::MUST_CHANGE) && ! $request->routeIs('admin.password', 'admin.password.update', 'admin.logout')) {
            return redirect()->route('admin.password');
        }

        return $next($request);
    }
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Keeps the point-of-sale screen and its API switched off (config/features.php).
 * A disabled POS answers with a completely empty 404, so nothing is revealed about it.
 */
class EnsurePosEnabled
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!config('features.pos')) {
            return response('', 404);
        }

        return $next($request);
    }
}

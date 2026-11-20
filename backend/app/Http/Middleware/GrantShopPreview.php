<?php

namespace App\Http\Middleware;

use App\Support\ShopPreview;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Symfony\Component\HttpFoundation\Response;

/**
 * Signed-in staff always carry the preview cookie, so they see the real shop while it is hidden from visitors.
 */
class GrantShopPreview
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($request->user()) {
            $key = ShopPreview::key();
            if ($request->cookies->get(ShopPreview::COOKIE) !== $key) {
                $response->headers->setCookie(Cookie::make(ShopPreview::COOKIE, $key, 60 * 24 * 30, '/', null, $request->isSecure(), true, false, 'lax'));
            }
        }

        return $response;
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\HomeBanners;

class HomeController extends Controller
{
    /** Home page banners as edited in Admin → Homepage Banners. */
    public function banners()
    {
        return response()->json(HomeBanners::get())->header('Cache-Control', 'no-cache');
    }
}

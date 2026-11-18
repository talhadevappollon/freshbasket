<?php

return [

    /*
    | The first staff account. When ADMIN_EMAIL and ADMIN_PASSWORD are set in .env, every deploy runs
    | `php artisan admin:user --from-env`, which creates that account if it does not exist yet. It never
    | changes an existing account, so a password changed in the admin panel stays changed. Remove
    | ADMIN_PASSWORD from .env after the first sign-in.
    */
    'bootstrap' => [
        'email' => env('ADMIN_EMAIL'),
        'name' => env('ADMIN_NAME', 'Store Manager'),
        'password' => env('ADMIN_PASSWORD'),
    ],

    /*
    | Passwords that are published in this repository (seeders, factories). An account that still uses
    | one of them can sign in only to choose a new password.
    */
    'starter_passwords' => ['admin12345', 'password'],

    'min_password_length' => 10,

];

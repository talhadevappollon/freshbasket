<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Point of sale (in-store counter)
    |--------------------------------------------------------------------------
    |
    | Off for now. While it is off the POS screen (/admin/pos) and every POS API
    | endpoint (/api/v1/pos/*) answer with an empty 404, and every POS button,
    | link and label is hidden in the admin panel.
    |
    | To switch it on: set POS_ENABLED=true in the server's .env (then clear the
    | config cache), or change the default below and deploy.
    |
    */
    'pos' => (bool) env('POS_ENABLED', false),

    /*
    |--------------------------------------------------------------------------
    | Delivery riders (Riders & Fleet Dispatch)
    |--------------------------------------------------------------------------
    |
    | Off: the store does not use it. Its pages answer with an empty 404 and its
    | sidebar link is hidden. The riders' records stay in the database, so
    | RIDERS_ENABLED=true in .env brings the module back exactly as it was.
    |
    */
    'riders' => (bool) env('RIDERS_ENABLED', false),

];

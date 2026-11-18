<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailLog extends Model
{
    protected $fillable = ['type', 'recipient', 'subject', 'status', 'error', 'reference'];

    /** How long the log keeps entries. */
    public const KEEP_DAYS = 90;
}

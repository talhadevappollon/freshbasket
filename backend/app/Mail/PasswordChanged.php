<?php

namespace App\Mail;

use App\Models\CustomerAccount;

/** Sent after a shopper sets a new password with a reset link, so a change they did not make is noticed. */
class PasswordChanged extends ShopEmail
{
    public function __construct(public CustomerAccount $account)
    {
    }

    protected function subjectLine(): string
    {
        return 'Your ' . self::shop()['name'] . ' password was changed';
    }

    protected function viewName(): string
    {
        return 'password-changed';
    }

    protected function data(): array
    {
        return ['account' => $this->account, 'forgotUrl' => url('/forgot-password'), 'when' => now()->timezone('Asia/Karachi')->format('D d M Y, g:i a')];
    }
}

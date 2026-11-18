<?php

namespace App\Mail;

use App\Models\CustomerAccount;

/** The "forgot password" link for a shopper account. */
class PasswordResetLink extends ShopEmail
{
    public function __construct(public CustomerAccount $account, public string $resetUrl, public int $minutes = 60)
    {
    }

    protected function subjectLine(): string
    {
        return 'Reset your ' . self::shop()['name'] . ' password';
    }

    protected function viewName(): string
    {
        return 'password-reset';
    }

    protected function data(): array
    {
        return ['account' => $this->account, 'resetUrl' => $this->resetUrl, 'minutes' => $this->minutes];
    }
}

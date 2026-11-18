<?php

namespace App\Mail;

use App\Models\CustomerAccount;

/** To a shopper who just created an account with an email address. */
class WelcomeCustomer extends ShopEmail
{
    public function __construct(public CustomerAccount $account)
    {
    }

    protected function subjectLine(): string
    {
        return 'Welcome to ' . self::shop()['name'] . ', ' . (strtok(trim($this->account->name), ' ') ?: 'there') . '!';
    }

    protected function viewName(): string
    {
        return 'welcome';
    }

    protected function data(): array
    {
        return ['account' => $this->account, 'accountUrl' => url('/account')];
    }
}

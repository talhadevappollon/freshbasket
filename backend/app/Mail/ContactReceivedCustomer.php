<?php

namespace App\Mail;

use App\Models\CrmLead;
use App\Models\StoreSetting;

/** Automatic reply to the customer after a Contact Us message. */
class ContactReceivedCustomer extends ShopEmail
{
    public function __construct(public CrmLead $lead)
    {
    }

    protected function subjectLine(): string
    {
        return 'We got your message: ' . self::shop()['name'];
    }

    protected function viewName(): string
    {
        return 'contact-customer';
    }

    protected function data(): array
    {
        return ['lead' => $this->lead, 'hours' => (string) StoreSetting::get('operating_hours', '')];
    }
}

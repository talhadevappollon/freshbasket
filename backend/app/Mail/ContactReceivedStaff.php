<?php

namespace App\Mail;

use App\Models\CrmLead;

/** To the staff inboxes for every Contact Us message. Replying writes to the customer. */
class ContactReceivedStaff extends ShopEmail
{
    public function __construct(public CrmLead $lead)
    {
        if (filter_var($lead->email, FILTER_VALIDATE_EMAIL)) {
            $this->replyTo($lead->email, $lead->name);
        }
    }

    protected function subjectLine(): string
    {
        return "Contact message: {$this->lead->subject} · {$this->lead->name}";
    }

    protected function viewName(): string
    {
        return 'contact-staff';
    }

    protected function data(): array
    {
        return ['lead' => $this->lead, 'adminUrl' => url('/admin/leads')];
    }
}

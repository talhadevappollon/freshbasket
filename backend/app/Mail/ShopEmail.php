<?php

namespace App\Mail;

use App\Models\StoreSetting;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * Base for the shop's emails: a subject, a Blade view under resources/views/emails, and the store's
 * name and contact details (Admin → Store Settings) for the shared header and footer.
 */
abstract class ShopEmail extends Mailable
{
    abstract protected function subjectLine(): string;

    abstract protected function viewName(): string;

    /** Data for the view. */
    protected function data(): array
    {
        return [];
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->subjectLine());
    }

    public function content(): Content
    {
        return new Content(view: 'emails.' . $this->viewName(), with: $this->data() + ['shop' => self::shop(), 'subjectLine' => $this->subjectLine()]);
    }

    public static function shop(): array
    {
        $settings = StoreSetting::whereIn('key', ['store_name', 'helpline_phone', 'whatsapp_number', 'support_email'])->pluck('value', 'key');

        return [
            'name' => $settings['store_name'] ?? 'Fresh House',
            'phone' => $settings['helpline_phone'] ?? '',
            'whatsapp' => $settings['whatsapp_number'] ?? '',
            'email' => $settings['support_email'] ?? '',
            'url' => rtrim(url('/'), '/'),
        ];
    }
}

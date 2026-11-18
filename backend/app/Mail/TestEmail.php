<?php

namespace App\Mail;

class TestEmail extends ShopEmail
{
    public function __construct(public string $sentBy = '')
    {
    }

    protected function subjectLine(): string
    {
        return 'Test email from your shop: it works';
    }

    protected function viewName(): string
    {
        return 'test';
    }

    protected function data(): array
    {
        return ['sentBy' => $this->sentBy, 'sentAt' => now()->timezone('Asia/Karachi')->format('d M Y, g:i a')];
    }
}

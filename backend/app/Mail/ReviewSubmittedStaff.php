<?php

namespace App\Mail;

use App\Models\ProductReview;

/** To the staff inboxes when a customer posts a product review. */
class ReviewSubmittedStaff extends ShopEmail
{
    public function __construct(public ProductReview $review)
    {
    }

    protected function subjectLine(): string
    {
        return "New {$this->review->rating}-star review: {$this->review->product_name}";
    }

    protected function viewName(): string
    {
        return 'review-staff';
    }

    protected function data(): array
    {
        return [
            'review' => $this->review,
            'productUrl' => $this->review->product_slug ? url('/products/' . rawurlencode($this->review->product_slug)) : null,
            'adminUrl' => url('/admin/reviews'),
        ];
    }
}

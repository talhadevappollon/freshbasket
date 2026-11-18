<?php

namespace App\Mail;

/** To the staff inboxes when an order takes tracked products down to their low-stock level. */
class LowStockStaff extends ShopEmail
{
    /** @param  array<int, array{name: string, sku: ?string, stock: int, threshold: int}>  $products */
    public function __construct(public array $products, public ?string $orderNumber = null)
    {
    }

    protected function subjectLine(): string
    {
        return count($this->products) === 1
            ? "Low stock: {$this->products[0]['name']} ({$this->products[0]['stock']} left)"
            : 'Low stock: ' . count($this->products) . ' products';
    }

    protected function viewName(): string
    {
        return 'low-stock';
    }

    protected function data(): array
    {
        return ['products' => $this->products, 'orderNumber' => $this->orderNumber, 'adminUrl' => url('/admin/products')];
    }
}

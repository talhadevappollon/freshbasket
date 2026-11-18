@extends('emails.layout')

@section('preheader'){{ $review->rating }}/5 from {{ $review->customer_name }}: {{ $review->review_title }}@endsection

@section('body')
    <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#3a7538;">New product review</p>
    <h1 style="margin:0 0 6px;font-size:21px;line-height:1.3;color:#10240f;">{{ $review->product_name }}</h1>
    <p style="margin:0 0 14px;font-size:20px;letter-spacing:2px;color:#e0a100;" aria-label="{{ $review->rating }} out of 5 stars">{{ str_repeat('★', (int) $review->rating) }}<span style="color:#cfd8ce;">{{ str_repeat('★', 5 - (int) $review->rating) }}</span></p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f8f3;border-radius:14px;">
        <tr>
            <td style="padding:16px 18px;font-size:14px;line-height:1.6;">
                <strong>{{ $review->review_title }}</strong><br>
                <span style="white-space:pre-line;">{{ $review->review_body }}</span>
                <span style="display:block;margin-top:10px;font-size:13px;color:#5b6b5a;">{{ $review->customer_name }} · {{ $review->customer_email }}</span>
            </td>
        </tr>
    </table>

    <p style="margin:16px 0 0;font-size:13px;color:#5b6b5a;">The review is already showing on the website. You can edit, hide or delete it in Customer Reviews.</p>
    @include('emails.partials.button', ['href' => $adminUrl, 'label' => 'Open Customer Reviews'])
    @if($productUrl)
        <p style="margin:6px 0 0;font-size:13px;"><a href="{{ $productUrl }}" style="color:#3a7538;">View the product page</a></p>
    @endif
@endsection

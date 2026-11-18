@extends('emails.layout')

@section('preheader'){{ $lead->name }}: {{ \Illuminate\Support\Str::limit($lead->message, 90) }}@endsection

@section('body')
    <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#3a7538;">Contact Us message</p>
    <h1 style="margin:0 0 12px;font-size:21px;line-height:1.3;color:#10240f;">{{ $lead->subject }}</h1>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f8f3;border-radius:14px;">
        <tr>
            <td style="padding:16px 18px;font-size:14px;line-height:1.7;">
                <strong>{{ $lead->name }}</strong><br>
                @if($lead->phone)Phone: <a href="tel:{{ preg_replace('/[^0-9+]/', '', $lead->phone) }}" style="color:#3a7538;">{{ $lead->phone }}</a><br>@endif
                @if($lead->email)Email: <a href="mailto:{{ $lead->email }}" style="color:#3a7538;">{{ $lead->email }}</a><br>@endif
                Sent {{ $lead->created_at?->timezone('Asia/Karachi')->format('D d M Y, g:i a') }}
            </td>
        </tr>
    </table>

    <p style="margin:18px 0 0;white-space:pre-line;">{{ $lead->message }}</p>

    @include('emails.partials.button', ['href' => $adminUrl, 'label' => 'Open Support Tickets & Leads'])
    <p style="margin:10px 0 0;font-size:13px;color:#5b6b5a;">{{ $lead->email ? 'Replying to this email writes to the customer.' : 'No email given: reply by phone or WhatsApp.' }}</p>
@endsection

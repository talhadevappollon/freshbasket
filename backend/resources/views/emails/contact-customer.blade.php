@extends('emails.layout')

@section('preheader')Thanks for writing to {{ $shop['name'] }}. Our team will get back to you shortly.@endsection

@section('body')
    <h1 style="margin:0 0 10px;font-size:22px;line-height:1.3;color:#10240f;">Thanks, {{ strtok(trim($lead->name), ' ') ?: 'there' }}. We got your message.</h1>
    <p style="margin:0 0 14px;">Our support team will get back to you shortly{{ $hours ? ' (we are open ' . $hours . ')' : '' }}. You do not need to send it again.</p>
    @if($shop['phone'] || $shop['whatsapp'])
        <p style="margin:0 0 14px;">In a hurry? {{ $shop['phone'] ? 'Call ' . $shop['phone'] : '' }}{{ $shop['phone'] && $shop['whatsapp'] ? ' or ' : '' }}{{ $shop['whatsapp'] ? 'WhatsApp ' . $shop['whatsapp'] : '' }}.</p>
    @endif

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f8f3;border-radius:14px;">
        <tr>
            <td style="padding:16px 18px;font-size:14px;line-height:1.6;">
                <span style="display:block;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#6b7d6a;margin-bottom:4px;">Your message: {{ $lead->subject }}</span>
                <span style="white-space:pre-line;">{{ $lead->message }}</span>
            </td>
        </tr>
    </table>
@endsection

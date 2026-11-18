<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>{{ $subjectLine }}</title>
</head>
<body style="margin:0;padding:0;background:#eef3ed;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#1d2b1c;-webkit-text-size-adjust:100%;">
    {{-- Preview text shown next to the subject in the inbox --}}
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">@yield('preheader')&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef3ed;">
        <tr>
            <td align="center" style="padding:28px 12px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
                    <tr>
                        <td align="center" style="padding:0 0 18px;">
                            <a href="{{ $shop['url'] }}" style="text-decoration:none;">
                                <img src="{{ $shop['url'] }}/logo-sm.png" alt="{{ $shop['name'] }}" width="150" style="display:block;width:150px;max-width:150px;height:auto;border:0;">
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #dfe8de;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr><td style="height:6px;background:#3a7538;font-size:0;line-height:0;">&nbsp;</td></tr>
                                <tr>
                                    <td style="padding:30px 28px 28px;font-size:15px;line-height:1.6;color:#1d2b1c;">
                                        @yield('body')
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding:20px 16px 0;font-size:12px;line-height:1.7;color:#5b6b5a;">
                            <strong style="color:#254724;">{{ $shop['name'] }}</strong><br>
                            @if($shop['phone'])Helpline {{ $shop['phone'] }}@endif
                            @if($shop['phone'] && $shop['whatsapp']) &middot; @endif
                            @if($shop['whatsapp'])WhatsApp {{ $shop['whatsapp'] }}@endif
                            @if($shop['email'])<br><a href="mailto:{{ $shop['email'] }}" style="color:#3a7538;">{{ $shop['email'] }}</a>@endif
                            <br><a href="{{ $shop['url'] }}" style="color:#3a7538;">{{ preg_replace('#^https?://#', '', $shop['url']) }}</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>

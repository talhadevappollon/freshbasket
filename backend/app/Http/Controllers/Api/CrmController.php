<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CrmLead;
use Illuminate\Http\Request;

class CrmController extends Controller
{
    public function storeInquiry(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:191',
            // The team replies by phone/WhatsApp or email, so one of the two is needed
            'phone' => 'nullable|required_without:email|string|max:50',
            'email' => 'nullable|required_without:phone|email|max:191',
            'subject' => 'nullable|string|max:191',
            'order_number' => 'nullable|string|max:50',
            'message' => 'required|string|max:5000',
            // Honeypot: a hidden field real visitors never see; bots that fill it are turned away
            'website' => 'prohibited',
        ]);

        $subject = $validated['subject'] ?? 'Customer Inquiry';
        if (! empty($validated['order_number'])) {
            $subject .= ' · Order ' . strtoupper(trim($validated['order_number']));
        }

        $lead = CrmLead::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'subject' => \Illuminate\Support\Str::limit($subject, 188),
            'message' => $validated['message'],
            'status' => 'new',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thank you for reaching out to Fresh House. Our support team will get in touch with you shortly!',
            'lead_id' => $lead->id,
        ], 201);
    }
}


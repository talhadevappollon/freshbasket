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
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:191',
            'subject' => 'nullable|string|max:191',
            'message' => 'required|string',
        ]);

        $lead = CrmLead::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'subject' => $validated['subject'] ?? 'Customer Inquiry',
            'message' => $validated['message'],
            'status' => 'new',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thank you for reaching out to Fresh Basket. Our support team will get in touch with you shortly!',
            'lead_id' => $lead->id,
        ], 201);
    }
}


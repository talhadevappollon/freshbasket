@extends('admin.layout')

@section('content')
@php
    $field = 'w-full px-3.5 h-11 rounded-xl border border-gray-200 text-sm focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none';
    $label = 'block text-[11px] font-bold text-gray-600 mb-1';
@endphp
<div class="max-w-md mx-auto space-y-6">
    <div>
        <h2 class="text-2xl font-black text-gray-900 tracking-tight">Change password</h2>
        <p class="text-xs text-gray-500">
            Signed in as <b>{{ auth()->user()->email }}</b>.
            @if($mustChange)
                This account still uses the starter password, which is public. Choose a new one before using the admin panel.
            @endif
        </p>
    </div>

    <form method="POST" action="{{ route('admin.password.update') }}" class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        @csrf
        <div>
            <label class="{{ $label }}" for="current_password">Current password</label>
            <input id="current_password" name="current_password" type="password" required autocomplete="current-password" maxlength="255" class="{{ $field }}">
        </div>
        <div>
            <label class="{{ $label }}" for="password">New password <span class="font-medium text-gray-400">(at least {{ config('admin.min_password_length', 10) }} characters)</span></label>
            <input id="password" name="password" type="password" required minlength="{{ config('admin.min_password_length', 10) }}" autocomplete="new-password" maxlength="255" class="{{ $field }}">
        </div>
        <div>
            <label class="{{ $label }}" for="password_confirmation">New password again</label>
            <input id="password_confirmation" name="password_confirmation" type="password" required autocomplete="new-password" maxlength="255" class="{{ $field }}">
        </div>
        <button type="submit" class="w-full h-12 rounded-2xl text-sm font-bold bg-fresh-600 hover:bg-fresh-700 active:bg-fresh-800 text-white shadow-lg shadow-fresh-600/30">
            Save new password
        </button>
    </form>
</div>
@endsection

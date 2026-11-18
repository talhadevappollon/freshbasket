<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>Staff sign in — Fresh House Admin</title>
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" href="/icon-512.png">
    <meta name="theme-color" content="#101e10">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'] },
                    colors: {
                        fresh: { 50: '#f3f7f3', 100: '#e7efe6', 200: '#cde0cc', 300: '#a5cca4', 400: '#6db26c', 500: '#478f45', 600: '#3a7538', 700: '#2e5d2d', 800: '#254724', 900: '#1d361c', 950: '#101e10' },
                    },
                },
            },
        };
    </script>
    <style>
        :focus-visible { outline: 2px solid #478f45; outline-offset: 2px; }
        input:focus-visible { outline-offset: 0; }
    </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-fresh-950 via-[#17301a] to-[#0b160b] font-sans text-slate-900 flex items-center justify-center px-4 py-10">
    <main class="w-full max-w-sm">
        <div class="flex justify-center mb-6">
            <span class="bg-white rounded-2xl px-4 py-2.5 shadow-lg shadow-black/30">
                <img src="/logo.png" alt="Fresh House" width="150" height="34" class="h-9 w-auto">
            </span>
        </div>

        <div class="bg-white rounded-3xl shadow-2xl shadow-black/40 p-6 sm:p-8">
            <h1 class="text-xl font-black tracking-tight">Staff sign in</h1>
            <p class="text-xs text-slate-500 mt-1">Fresh House admin panel</p>

            @if(session('status'))
                <p role="status" class="mt-4 p-3 rounded-xl bg-fresh-50 border border-fresh-200 text-fresh-800 text-xs font-bold">{{ session('status') }}</p>
            @endif

            @if($errors->any())
                <div role="alert" class="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold space-y-1">
                    @foreach($errors->all() as $error)
                        <p>{{ $error }}</p>
                    @endforeach
                </div>
            @endif

            <form method="POST" action="{{ route('admin.login.attempt') }}" class="mt-5 space-y-4">
                @csrf
                <div>
                    <label for="email" class="block text-[11px] font-bold text-slate-600 mb-1">Email</label>
                    <input id="email" name="email" type="email" value="{{ old('email') }}" required autofocus autocomplete="username" maxlength="255"
                           class="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none">
                </div>
                <div>
                    <label for="password" class="block text-[11px] font-bold text-slate-600 mb-1">Password</label>
                    <input id="password" name="password" type="password" required autocomplete="current-password" maxlength="255"
                           class="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:border-fresh-500 focus:ring-4 focus:ring-fresh-500/15 focus:outline-none">
                </div>
                <label class="flex items-center gap-2 text-xs font-semibold text-slate-600 select-none">
                    <input type="checkbox" name="remember" value="1" class="w-4 h-4 rounded border-slate-300 text-fresh-600 focus:ring-fresh-500">
                    Keep me signed in on this device
                </label>
                <button type="submit" class="w-full h-12 rounded-2xl bg-fresh-600 hover:bg-fresh-700 active:bg-fresh-800 text-white text-sm font-bold shadow-lg shadow-fresh-600/30 transition">
                    Sign in
                </button>
            </form>
        </div>

        <p class="text-center text-[11px] text-fresh-200/70 mt-5">
            <a href="/" class="hover:text-white underline-offset-2 hover:underline">Back to the shop</a>
        </p>
    </main>
</body>
</html>

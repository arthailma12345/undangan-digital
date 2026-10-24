<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Admin') · {{ config('app.name') }}</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap">
    <script src="https://cdn.tailwindcss.com/3.4.16"></script>
    <style>
        body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .inp { width: 100%; border: 1px solid #d6d3d1; border-radius: .7rem; padding: .55rem .8rem; background: #fff; font-size: .9rem; }
        .inp:focus { outline: 2px solid #f43f5e; outline-offset: 0; border-color: transparent; }
        .lbl { display: block; font-size: .78rem; font-weight: 600; color: #57534e; margin-bottom: .25rem; }
        .btn-p { background: #1c1917; color: #fff; padding: .55rem 1.1rem; border-radius: .7rem; font-size: .875rem; font-weight: 600; display: inline-flex; gap: .4rem; align-items: center; }
        .btn-p:hover { background: #44403c; }
        .btn-o { border: 1px solid #d6d3d1; padding: .5rem 1rem; border-radius: .7rem; font-size: .875rem; display: inline-flex; gap: .4rem; align-items: center; background: #fff; }
        .btn-o:hover { background: #f5f5f4; }
        .panel { background: #fff; border: 1px solid #e7e5e4; border-radius: 1.2rem; padding: 1.4rem; }
    </style>
</head>
<body class="bg-stone-100 text-stone-800">
<div class="min-h-screen lg:flex">
    <aside class="lg:w-64 bg-stone-900 text-stone-300 lg:min-h-screen">
        <div class="p-5 flex items-center justify-between">
            <a href="{{ route('admin.dashboard') }}" class="text-white font-extrabold">💌 {{ config('app.name') }}</a>
        </div>
        <nav class="px-3 pb-4 flex lg:flex-col gap-1 overflow-x-auto text-sm">
            @foreach ([
                ['admin.dashboard', 'admin.dashboard', '🏠 Dashboard'],
                ['admin.invitations.index', 'admin.invitations.*', '💌 Undangan'],
                ['admin.templates.index', 'admin.templates.*', '🎨 Template'],
            ] as [$route, $pattern, $label])
                <a href="{{ route($route) }}" class="px-3 py-2 rounded-lg whitespace-nowrap {{ request()->routeIs($pattern) ? 'bg-white/10 text-white' : 'hover:bg-white/5' }}">{{ $label }}</a>
            @endforeach
            <a href="{{ route('home') }}" target="_blank" class="px-3 py-2 rounded-lg hover:bg-white/5 whitespace-nowrap">🌐 Lihat Situs</a>
            <form method="POST" action="{{ route('logout') }}">@csrf<button class="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 whitespace-nowrap">🚪 Keluar</button></form>
        </nav>
    </aside>

    <main class="flex-1 p-4 md:p-8 min-w-0">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h1 class="text-2xl font-extrabold">@yield('title')</h1>
            <div class="flex gap-2">@yield('actions')</div>
        </div>

        @if (session('success'))
            <div class="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 text-sm">{{ session('success') }}</div>
        @endif
        @if ($errors->any())
            <div class="mb-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 text-sm">
                <b>Periksa kembali isian:</b>
                <ul class="list-disc ml-5 mt-1">@foreach ($errors->all() as $e)<li>{{ $e }}</li>@endforeach</ul>
            </div>
        @endif

        @yield('content')
    </main>
</div>
<script>
    document.addEventListener('click', async (e) => {
        const b = e.target.closest('[data-copy]');
        if (!b) return;
        await navigator.clipboard.writeText(b.dataset.copy);
        const old = b.textContent; b.textContent = '✓ Disalin'; setTimeout(() => b.textContent = old, 1500);
    });
</script>
@stack('scripts')
</body>
</html>

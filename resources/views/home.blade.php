@php
    $fonts = $templates->pluck('settings.fonts.script')->unique()->map(fn ($f) => 'family='.str_replace(' ', '+', $f))->implode('&');
@endphp
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name') }} — 30 Template Undangan Pernikahan Online</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?{{ $fonts }}&family=Plus+Jakarta+Sans:wght@400;600;800&display=swap">
    <script src="https://cdn.tailwindcss.com/3.4.16"></script>
    <style>
        body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .card-preview { transition: transform .5s cubic-bezier(.2,.8,.2,1), box-shadow .5s; }
        .tpl:hover .card-preview { transform: translateY(-6px) rotate(-1deg); box-shadow: 0 30px 50px -25px rgba(0,0,0,.45); }
        .tpl .orn { position: absolute; width: 70px; color: var(--p); opacity: .8; }
        .tpl .orn.tl { top: 0; left: 0; } .tpl .orn.br { bottom: 0; right: 0; transform: scale(-1,-1); }
        @keyframes floaty { 50% { transform: translateY(-8px); } }
        .floaty { animation: floaty 4s ease-in-out infinite; }
    </style>
</head>
<body class="bg-stone-50 text-stone-800">
<header class="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-stone-200">
    <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <a href="{{ route('home') }}" class="font-extrabold text-lg">💌 {{ config('app.name') }}</a>
        <nav class="flex gap-2 text-sm">
            @auth
                <a href="{{ route('admin.dashboard') }}" class="px-4 py-2 rounded-full bg-stone-900 text-white">Dashboard</a>
            @else
                <a href="{{ route('login') }}" class="px-4 py-2 rounded-full bg-stone-900 text-white">Masuk</a>
            @endauth
        </nav>
    </div>
</header>

<section class="relative overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 py-20 text-center">
        <p class="uppercase tracking-[.35em] text-xs text-rose-500 font-semibold">Undangan Pernikahan Digital</p>
        <h1 class="mt-4 text-4xl md:text-6xl font-extrabold leading-tight">{{ $templates->count() }} Template Dinamis<br><span class="text-rose-500">dengan Animasi Unik</span></h1>
        <p class="mt-5 max-w-2xl mx-auto text-stone-600">Setiap template punya animasi pembuka, efek partikel latar, dan gaya transisi yang berbeda. Isi data mempelai sekali, tampilan langsung menyesuaikan — lengkap dengan RSVP, buku tamu, galeri, peta, countdown, musik, dan amplop digital.</p>
        <div class="mt-8 flex flex-wrap justify-center gap-2" id="filters">
            <button data-cat="all" class="filter px-4 py-2 rounded-full text-sm border border-stone-300 bg-stone-900 text-white">Semua</button>
            @foreach ($categories as $cat)
                <button data-cat="{{ $cat }}" class="filter px-4 py-2 rounded-full text-sm border border-stone-300 bg-white">{{ $cat }}</button>
            @endforeach
        </div>
    </div>
</section>

<main class="max-w-7xl mx-auto px-4 pb-24 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    @foreach ($templates as $i => $t)
        @php($c = $t->settings['colors'])
        <article class="tpl" data-cat="{{ $t->category }}" style="--p: {{ $c['primary'] }}">
            <a href="{{ route('template.preview', $t) }}" class="card-preview block relative aspect-[3/4] rounded-3xl overflow-hidden border"
               style="background: radial-gradient(circle at 50% 0%, {{ $c['primary'] }}33, transparent 60%), radial-gradient(circle at 50% 100%, {{ $c['accent'] }}55, transparent 60%), {{ $c['bg'] }}; border-color: {{ $c['primary'] }}44">
                @include('invitation.ornament', ['type' => $t->settings['ornament'], 'class' => 'tl'])
                @include('invitation.ornament', ['type' => $t->settings['ornament'], 'class' => 'br'])
                <div class="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    <span class="text-[10px] tracking-[.35em] uppercase" style="color: {{ $c['muted'] }}">The Wedding of</span>
                    <span class="floaty block text-5xl my-3" style="font-family: '{{ $t->settings['fonts']['script'] }}', cursive; color: {{ $c['primary'] }}; animation-delay: -{{ $i % 4 }}s">Arya &amp; Nadia</span>
                    <span class="text-xs tracking-widest" style="color: {{ $c['text'] }}">{{ now()->addDays(45)->translatedFormat('d . m . Y') }}</span>
                </div>
                <span class="absolute top-3 right-3 text-[10px] px-2 py-1 rounded-full bg-black/60 text-white">#{{ str_pad($i + 1, 2, '0', STR_PAD_LEFT) }}</span>
            </a>
            <div class="mt-4 flex items-start justify-between gap-2">
                <div>
                    <h3 class="font-bold">{{ $t->name }}</h3>
                    <p class="text-xs text-stone-500">{{ $t->category }}</p>
                </div>
                <div class="flex gap-1">
                    @foreach (['bg', 'primary', 'accent'] as $k)<span class="w-4 h-4 rounded-full border" style="background: {{ $c[$k] }}"></span>@endforeach
                </div>
            </div>
            <div class="mt-2 flex flex-wrap gap-1 text-[11px]">
                <span class="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">✨ {{ $t->settings['opening'] }}</span>
                <span class="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700">🌌 {{ $t->settings['ambient'] }}</span>
            </div>
            <div class="mt-3 grid grid-cols-2 gap-2 text-sm">
                <a href="{{ route('template.preview', $t) }}" target="_blank" class="text-center px-3 py-2 rounded-xl border border-stone-300 hover:bg-white">Preview</a>
                <a href="{{ auth()->check() ? route('admin.invitations.create', ['template' => $t->id]) : route('login') }}" class="text-center px-3 py-2 rounded-xl bg-stone-900 text-white hover:bg-stone-700">Gunakan</a>
            </div>
        </article>
    @endforeach
</main>

<footer class="border-t border-stone-200 py-8 text-center text-sm text-stone-500">© {{ date('Y') }} {{ config('app.name') }} · Laravel {{ app()->version() }} · PostgreSQL</footer>

<script>
    document.querySelectorAll('.filter').forEach(btn => btn.addEventListener('click', () => {
        document.querySelectorAll('.filter').forEach(b => b.classList.remove('bg-stone-900', 'text-white'));
        btn.classList.add('bg-stone-900', 'text-white');
        document.querySelectorAll('.tpl').forEach(card => {
            card.hidden = btn.dataset.cat !== 'all' && card.dataset.cat !== btn.dataset.cat;
        });
    }));
</script>
</body>
</html>

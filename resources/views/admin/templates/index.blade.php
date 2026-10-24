@extends('layouts.admin')
@section('title', 'Template ('.$templates->count().')')

@section('content')
    <p class="text-sm text-stone-500 mb-5 max-w-3xl">Semua template dirender oleh satu mesin dinamis. Warna, font, ornamen, layout sampul, animasi pembuka, efek latar, dan gaya reveal dapat diubah per template tanpa menyentuh kode.</p>
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        @foreach ($templates as $t)
            @php($c = $t->settings['colors'])
            <div class="panel !p-0 overflow-hidden {{ $t->is_active ? '' : 'opacity-60' }}">
                <a href="{{ route('template.preview', $t) }}" target="_blank" class="block h-36 relative" style="background: radial-gradient(circle at 50% 0, {{ $c['primary'] }}55, transparent 70%), radial-gradient(circle at 50% 100%, {{ $c['accent'] }}66, transparent 70%), {{ $c['bg'] }}">
                    <div class="absolute inset-0 grid place-items-center" style="color: {{ $c['primary'] }}">
                        @include('invitation.ornament', ['type' => $t->settings['ornament'], 'class' => 'w-20 h-20'])
                    </div>
                    <span class="absolute top-2 left-2 text-[11px] px-2 py-0.5 rounded-full bg-black/60 text-white">#{{ $t->sort_order }}</span>
                </a>
                <div class="p-4">
                    <div class="flex justify-between items-start">
                        <div><b>{{ $t->name }}</b><p class="text-xs text-stone-500">{{ $t->category }} · {{ $t->invitations_count }} undangan</p></div>
                        <div class="flex gap-1">@foreach (['primary', 'accent', 'text'] as $k)<span class="w-3.5 h-3.5 rounded-full border" style="background: {{ $c[$k] }}"></span>@endforeach</div>
                    </div>
                    <dl class="grid grid-cols-2 gap-x-2 text-[11px] mt-3 text-stone-600">
                        <dt class="text-stone-400">Pembuka</dt><dd>{{ $t->settings['opening'] }}</dd>
                        <dt class="text-stone-400">Efek latar</dt><dd>{{ $t->settings['ambient'] }}</dd>
                        <dt class="text-stone-400">Reveal</dt><dd>{{ $t->settings['reveal'] }}</dd>
                        <dt class="text-stone-400">Sampul</dt><dd>{{ $t->settings['cover'] }}</dd>
                        <dt class="text-stone-400">Galeri</dt><dd>{{ $t->settings['gallery'] ?? 'masonry' }}</dd>
                    </dl>
                    <div class="flex gap-2 mt-4">
                        <a href="{{ route('admin.templates.edit', $t) }}" class="btn-o !py-1 text-xs">Atur</a>
                        <a href="{{ route('template.preview', $t) }}" target="_blank" class="btn-o !py-1 text-xs">Preview</a>
                        <form method="POST" action="{{ route('admin.templates.toggle', $t) }}">
                            @csrf @method('PATCH')
                            <button class="btn-o !py-1 text-xs {{ $t->is_active ? 'text-rose-600' : 'text-emerald-700' }}">{{ $t->is_active ? 'Nonaktifkan' : 'Aktifkan' }}</button>
                        </form>
                    </div>
                </div>
            </div>
        @endforeach
    </div>
@endsection

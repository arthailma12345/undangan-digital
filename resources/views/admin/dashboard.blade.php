@extends('layouts.admin')
@section('title', 'Dashboard')
@section('actions')
    <a href="{{ route('admin.invitations.create') }}" class="btn-p">+ Buat Undangan</a>
@endsection

@section('content')
    <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        @foreach ($stats as $label => $value)
            <div class="panel">
                <p class="text-xs text-stone-500">{{ $label }}</p>
                <p class="text-3xl font-extrabold mt-1">{{ number_format($value) }}</p>
            </div>
        @endforeach
    </div>

    <div class="grid lg:grid-cols-2 gap-6">
        <div class="panel">
            <div class="flex justify-between items-center mb-4">
                <h2 class="font-bold">Undangan Terbaru</h2>
                <a href="{{ route('admin.invitations.index') }}" class="text-sm text-rose-600">Semua →</a>
            </div>
            @forelse ($invitations as $inv)
                <a href="{{ route('admin.invitations.show', $inv) }}" class="flex items-center gap-3 py-3 border-b last:border-0 hover:bg-stone-50 -mx-2 px-2 rounded-lg">
                    <span class="w-10 h-10 rounded-full grid place-items-center text-white font-bold" style="background: {{ $inv->template->settings['colors']['primary'] }}">{{ mb_substr($inv->groom_nickname, 0, 1) }}{{ mb_substr($inv->bride_nickname, 0, 1) }}</span>
                    <span class="flex-1 min-w-0">
                        <b class="block truncate">{{ $inv->coupleName() }}</b>
                        <small class="text-stone-500">{{ $inv->template->name }} · {{ $inv->event_date->translatedFormat('d M Y') }}</small>
                    </span>
                    <span class="text-xs text-stone-500">{{ $inv->view_count }}× dilihat</span>
                </a>
            @empty
                <p class="text-sm text-stone-500">Belum ada undangan. <a class="text-rose-600" href="{{ route('admin.invitations.create') }}">Buat sekarang</a>.</p>
            @endforelse
        </div>

        <div class="panel">
            <h2 class="font-bold mb-4">Ucapan &amp; RSVP Terbaru</h2>
            @forelse ($latestWishes as $w)
                <div class="py-3 border-b last:border-0">
                    <div class="flex justify-between gap-2">
                        <b class="text-sm">{{ $w->name }}</b>
                        <span class="text-xs px-2 py-0.5 rounded-full {{ ['hadir' => 'bg-emerald-50 text-emerald-700', 'tidak' => 'bg-rose-50 text-rose-700', 'ragu' => 'bg-amber-50 text-amber-700'][$w->attendance] ?? '' }}">{{ $w->attendanceLabel() }} · {{ $w->pax }} org</span>
                    </div>
                    <p class="text-sm text-stone-600">{{ \Illuminate\Support\Str::limit($w->message, 120) }}</p>
                    <small class="text-stone-400">{{ $w->invitation->coupleName() }} · {{ $w->created_at->diffForHumans() }}</small>
                </div>
            @empty
                <p class="text-sm text-stone-500">Belum ada ucapan.</p>
            @endforelse
        </div>
    </div>
@endsection

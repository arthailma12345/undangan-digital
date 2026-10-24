@extends('layouts.admin')
@section('title', $invitation->coupleName())
@section('actions')
    <a href="{{ route('admin.invitations.edit', $invitation) }}" class="btn-o">✏️ Edit</a>
    <a href="{{ route('invitation.show', $invitation) }}" target="_blank" class="btn-p">Lihat Undangan ↗</a>
@endsection

@section('content')
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        @foreach ([
            'Dilihat' => $invitation->view_count,
            'Tamu' => $invitation->guests->count(),
            'Sudah Buka' => $summary['dibuka'],
            'Akan Hadir (org)' => $summary['hadir'],
            'Tidak / Ragu' => $summary['tidak'].' / '.$summary['ragu'],
        ] as $label => $val)
            <div class="panel"><p class="text-xs text-stone-500">{{ $label }}</p><p class="text-2xl font-extrabold">{{ $val }}</p></div>
        @endforeach
    </div>

    <div class="panel mb-6 flex flex-wrap items-center gap-3">
        <div class="flex-1 min-w-0">
            <p class="text-xs text-stone-500">Link umum · Template <b>{{ $invitation->template->name }}</b> ({{ $invitation->template->settings['opening'] }} + {{ $invitation->template->settings['ambient'] }})</p>
            <p class="font-mono text-sm truncate">{{ route('invitation.show', $invitation) }}</p>
        </div>
        <button class="btn-o" data-copy="{{ route('invitation.show', $invitation) }}">Salin Link</button>
    </div>

    <div class="grid xl:grid-cols-5 gap-6">
        {{-- TAMU --}}
        <div class="panel xl:col-span-3">
            <h2 class="font-bold mb-4">Daftar Tamu</h2>
            <div class="grid md:grid-cols-2 gap-4 mb-5">
                <form method="POST" action="{{ route('admin.guests.store', $invitation) }}" class="space-y-2 p-4 rounded-xl bg-stone-50 border">
                    @csrf
                    <b class="text-sm">Tambah satu tamu</b>
                    <input name="name" required placeholder="Nama tamu" class="inp">
                    <div class="grid grid-cols-2 gap-2">
                        <input name="phone" placeholder="No. WhatsApp" class="inp">
                        <input name="group" placeholder="Grup (opsional)" class="inp">
                    </div>
                    <button class="btn-p">+ Tambah</button>
                </form>
                <form method="POST" action="{{ route('admin.guests.bulk', $invitation) }}" class="space-y-2 p-4 rounded-xl bg-stone-50 border">
                    @csrf
                    <b class="text-sm">Tambah banyak sekaligus</b>
                    <textarea name="names" rows="4" required class="inp" placeholder="Satu baris satu tamu:&#10;Budi Santoso, 08123456789&#10;Keluarga Ibu Ani"></textarea>
                    <button class="btn-p">+ Import</button>
                </form>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="text-left text-stone-500 border-b">
                        <tr><th class="py-2">Nama</th><th>Status</th><th class="text-right">Aksi</th></tr>
                    </thead>
                    <tbody>
                        @forelse ($invitation->guests as $g)
                            @php($link = $invitation->publicUrl($g))
                            <tr class="border-b last:border-0">
                                <td class="py-2.5">
                                    <b>{{ $g->name }}</b>
                                    <small class="block text-stone-400">{{ $g->phone }} {{ $g->group ? '· '.$g->group : '' }}</small>
                                </td>
                                <td>
                                    @if ($g->opened_at)
                                        <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Dibuka {{ $g->opened_at->diffForHumans() }}</span>
                                    @else
                                        <span class="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">Belum dibuka</span>
                                    @endif
                                </td>
                                <td class="text-right whitespace-nowrap">
                                    <button class="btn-o !px-2 !py-1 text-xs" data-copy="{{ $link }}">Salin Link</button>
                                    @if ($g->phone)
                                        <a href="{{ $g->whatsappUrl() }}" target="_blank" class="btn-o !px-2 !py-1 text-xs text-emerald-700">WhatsApp</a>
                                    @endif
                                    <a href="{{ $link }}" target="_blank" class="btn-o !px-2 !py-1 text-xs">Buka</a>
                                    <form method="POST" action="{{ route('admin.guests.destroy', $g) }}" class="inline" onsubmit="return confirm('Hapus tamu ini?')">
                                        @csrf @method('DELETE')
                                        <button class="btn-o !px-2 !py-1 text-xs text-rose-600">✕</button>
                                    </form>
                                </td>
                            </tr>
                        @empty
                            <tr><td colspan="3" class="py-6 text-center text-stone-500">Belum ada tamu. Tamu tanpa daftar tetap bisa memakai link umum + <code>?to=Nama</code>.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        {{-- UCAPAN --}}
        <div class="panel xl:col-span-2">
            <h2 class="font-bold mb-4">Ucapan &amp; RSVP ({{ $invitation->wishes->count() }})</h2>
            <div class="max-h-[640px] overflow-y-auto pr-1">
                @forelse ($invitation->wishes as $w)
                    <div class="py-3 border-b last:border-0">
                        <div class="flex justify-between items-start gap-2">
                            <div>
                                <b class="text-sm">{{ $w->name }}</b>
                                <span class="text-xs px-2 py-0.5 rounded-full ml-1 {{ ['hadir' => 'bg-emerald-50 text-emerald-700', 'tidak' => 'bg-rose-50 text-rose-700', 'ragu' => 'bg-amber-50 text-amber-700'][$w->attendance] ?? '' }}">{{ $w->attendanceLabel() }} · {{ $w->pax }}</span>
                            </div>
                            <form method="POST" action="{{ route('admin.wishes.destroy', $w) }}" onsubmit="return confirm('Hapus ucapan ini?')">
                                @csrf @method('DELETE')
                                <button class="text-xs text-rose-600">hapus</button>
                            </form>
                        </div>
                        <p class="text-sm text-stone-600 mt-1">{{ $w->message }}</p>
                        <small class="text-stone-400">{{ $w->created_at->translatedFormat('d M Y H:i') }}</small>
                    </div>
                @empty
                    <p class="text-sm text-stone-500">Belum ada ucapan.</p>
                @endforelse
            </div>
        </div>
    </div>
@endsection

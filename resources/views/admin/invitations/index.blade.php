@extends('layouts.admin')
@section('title', 'Undangan')
@section('actions')
    <a href="{{ route('admin.invitations.create') }}" class="btn-p">+ Buat Undangan</a>
@endsection

@section('content')
    <form class="mb-5 flex gap-2 max-w-md">
        <input name="q" value="{{ request('q') }}" placeholder="Cari nama mempelai / slug..." class="inp">
        <button class="btn-o">Cari</button>
    </form>

    <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        @forelse ($invitations as $inv)
            @php($c = $inv->template->settings['colors'])
            <div class="panel !p-0 overflow-hidden">
                <div class="h-28 relative grid place-items-center" style="background: radial-gradient(circle at 50% 0, {{ $c['primary'] }}44, transparent 70%), {{ $c['bg'] }}">
                    <span class="text-3xl" style="font-family: serif; color: {{ $c['primary'] }}">{{ $inv->coupleName() }}</span>
                    <span class="absolute top-2 right-2 text-[11px] px-2 py-0.5 rounded-full {{ $inv->is_published ? 'bg-emerald-500 text-white' : 'bg-stone-500 text-white' }}">{{ $inv->is_published ? 'Publik' : 'Draft' }}</span>
                </div>
                <div class="p-4">
                    <p class="text-sm text-stone-500">{{ $inv->template->name }} · {{ $inv->event_date->translatedFormat('l, d M Y') }}</p>
                    <p class="text-xs text-stone-400 mt-1 truncate">{{ route('invitation.show', $inv) }}</p>
                    <div class="flex gap-4 text-xs text-stone-600 mt-3">
                        <span>👥 {{ $inv->guests_count }} tamu</span><span>💬 {{ $inv->wishes_count }} ucapan</span><span>👁 {{ $inv->view_count }}</span>
                    </div>
                    <div class="flex flex-wrap gap-2 mt-4">
                        <a href="{{ route('admin.invitations.show', $inv) }}" class="btn-p !py-1.5">Kelola</a>
                        <a href="{{ route('admin.invitations.edit', $inv) }}" class="btn-o !py-1.5">Edit</a>
                        <a href="{{ route('invitation.show', $inv) }}" target="_blank" class="btn-o !py-1.5">Lihat</a>
                        <form method="POST" action="{{ route('admin.invitations.destroy', $inv) }}" onsubmit="return confirm('Hapus undangan ini beserta tamu & ucapannya?')">
                            @csrf @method('DELETE')
                            <button class="btn-o !py-1.5 text-rose-600">Hapus</button>
                        </form>
                    </div>
                </div>
            </div>
        @empty
            <div class="panel md:col-span-2 xl:col-span-3 text-center py-12">
                <p class="text-stone-500">Belum ada undangan.</p>
                <a href="{{ route('admin.invitations.create') }}" class="btn-p mt-4">+ Buat Undangan Pertama</a>
            </div>
        @endforelse
    </div>
    <div class="mt-6">{{ $invitations->links() }}</div>
@endsection

@extends('layouts.admin')
@section('title', $invitation->exists ? 'Edit Undangan' : 'Buat Undangan')

@php
    use App\Models\Invitation;
    $v = fn ($key, $default = null) => old($key, data_get($invitation, $key, $default));
    $events = old('events', $invitation->events ?? []);
    $stories = old('love_stories', $invitation->love_stories ?? []);
    $gifts = old('gifts', $invitation->gifts ?? []);
@endphp

@section('actions')
    @if ($invitation->exists)
        <a href="{{ route('invitation.show', $invitation) }}" target="_blank" class="btn-o">Lihat Undangan</a>
    @endif
@endsection

@section('content')
<form method="POST" enctype="multipart/form-data"
      action="{{ $invitation->exists ? route('admin.invitations.update', $invitation) : route('admin.invitations.store') }}"
      class="space-y-6 max-w-5xl">
    @csrf
    @if ($invitation->exists) @method('PUT') @endif

    {{-- TEMPLATE --}}
    <div class="panel">
        <h2 class="font-bold mb-1">1. Pilih Template</h2>
        <p class="text-sm text-stone-500 mb-4">Klik kartu untuk memilih. Setiap template memiliki animasi pembuka &amp; efek latar unik.</p>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-h-[420px] overflow-y-auto p-1">
            @foreach ($templates as $t)
                @php($c = $t->settings['colors'])
                <label class="cursor-pointer group">
                    <input type="radio" name="template_id" value="{{ $t->id }}" class="peer sr-only" @checked($v('template_id') == $t->id) required>
                    <div class="rounded-xl border-2 border-transparent peer-checked:border-rose-500 peer-checked:ring-4 peer-checked:ring-rose-100 overflow-hidden transition">
                        <div class="h-20 grid place-items-center text-lg" style="background: radial-gradient(circle at 50% 0, {{ $c['primary'] }}55, transparent 70%), {{ $c['bg'] }}; color: {{ $c['primary'] }}; font-family: serif">A &amp; N</div>
                        <div class="px-2 py-1.5 bg-white">
                            <b class="text-xs block truncate">{{ $t->name }}</b>
                            <small class="text-[10px] text-stone-500 block truncate">{{ $t->settings['opening'] }}</small>
                        </div>
                    </div>
                    <a href="{{ route('template.preview', $t) }}" target="_blank" class="text-[11px] text-rose-600 opacity-0 group-hover:opacity-100">preview ↗</a>
                </label>
            @endforeach
        </div>
    </div>

    {{-- UMUM --}}
    <div class="panel grid md:grid-cols-3 gap-4">
        <h2 class="font-bold md:col-span-3">2. Informasi Umum</h2>
        <div>
            <label class="lbl">Slug URL (kosongkan = otomatis)</label>
            <input name="slug" value="{{ $v('slug') }}" class="inp" placeholder="arya-nadia">
            <small class="text-xs text-stone-500">{{ url('/u') }}/<b>slug</b></small>
        </div>
        <div>
            <label class="lbl">Judul (opsional)</label>
            <input name="title" value="{{ $v('title') }}" class="inp" placeholder="Pernikahan Arya & Nadia">
        </div>
        <div>
            <label class="lbl">Tanggal &amp; Jam Utama (countdown) *</label>
            <input type="datetime-local" name="event_date" required class="inp"
                   value="{{ old('event_date', optional($invitation->event_date)->format('Y-m-d\TH:i')) }}">
        </div>
        <div class="md:col-span-3">
            <label class="lbl">Foto Sampul</label>
            <div class="flex items-center gap-3">
                @if ($invitation->cover_photo)<img src="{{ Invitation::media($invitation->cover_photo) }}" class="w-16 h-16 rounded-lg object-cover">@endif
                <input type="file" name="cover_photo_file" accept="image/*" class="inp">
            </div>
        </div>
        <label class="flex items-center gap-2 text-sm md:col-span-3">
            <input type="hidden" name="is_published" value="0">
            <input type="checkbox" name="is_published" value="1" @checked($v('is_published', true))> Publikasikan (bisa diakses tamu)
        </label>
    </div>

    {{-- MEMPELAI --}}
    <div class="grid md:grid-cols-2 gap-6">
        @foreach (['groom' => 'Mempelai Pria', 'bride' => 'Mempelai Wanita'] as $who => $label)
            <div class="panel space-y-3">
                <h2 class="font-bold">3. {{ $label }}</h2>
                <div class="grid grid-cols-3 gap-3">
                    <div><label class="lbl">Panggilan *</label><input name="{{ $who }}_nickname" value="{{ $v($who.'_nickname') }}" required class="inp"></div>
                    <div class="col-span-2"><label class="lbl">Nama Lengkap + Gelar *</label><input name="{{ $who }}_name" value="{{ $v($who.'_name') }}" required class="inp"></div>
                </div>
                <div><label class="lbl">Keterangan anak ke-</label><input name="{{ $who }}_child_order" value="{{ $v($who.'_child_order') }}" class="inp" placeholder="{{ $who === 'groom' ? 'Putra pertama dari' : 'Putri kedua dari' }}"></div>
                <div class="grid grid-cols-2 gap-3">
                    <div><label class="lbl">Nama Ayah</label><input name="{{ $who }}_father" value="{{ $v($who.'_father') }}" class="inp"></div>
                    <div><label class="lbl">Nama Ibu</label><input name="{{ $who }}_mother" value="{{ $v($who.'_mother') }}" class="inp"></div>
                </div>
                <div><label class="lbl">Instagram</label><input name="{{ $who }}_instagram" value="{{ $v($who.'_instagram') }}" class="inp" placeholder="username"></div>
                <div>
                    <label class="lbl">Foto</label>
                    <div class="flex items-center gap-3">
                        @if ($invitation->{$who.'_photo'})<img src="{{ Invitation::media($invitation->{$who.'_photo'}) }}" class="w-14 h-14 rounded-full object-cover">@endif
                        <input type="file" name="{{ $who }}_photo_file" accept="image/*" class="inp">
                    </div>
                </div>
            </div>
        @endforeach
    </div>

    {{-- ACARA --}}
    <div class="panel">
        <div class="flex justify-between items-center mb-3">
            <h2 class="font-bold">4. Rangkaian Acara</h2>
            <button type="button" class="btn-o" data-add="events">+ Tambah Acara</button>
        </div>
        <div id="events" class="space-y-4" data-next="{{ count($events) }}">
            @foreach ($events as $i => $ev)
                @include('admin.invitations.partials.event-row', ['i' => $i, 'ev' => $ev])
            @endforeach
        </div>
        <template id="tpl-events">@include('admin.invitations.partials.event-row', ['i' => '__i__', 'ev' => []])</template>
    </div>

    {{-- KUTIPAN --}}
    <div class="panel grid md:grid-cols-4 gap-4">
        <h2 class="font-bold md:col-span-4">5. Kutipan / Ayat</h2>
        <div class="md:col-span-3"><label class="lbl">Kutipan</label><textarea name="quote" rows="3" class="inp">{{ $v('quote') }}</textarea></div>
        <div><label class="lbl">Sumber</label><input name="quote_source" value="{{ $v('quote_source') }}" class="inp" placeholder="QS. Ar-Rum: 21"></div>
    </div>

    {{-- LOVE STORY --}}
    <div class="panel">
        <div class="flex justify-between items-center mb-3">
            <h2 class="font-bold">6. Kisah Cinta</h2>
            <button type="button" class="btn-o" data-add="love_stories">+ Tambah Cerita</button>
        </div>
        <div id="love_stories" class="space-y-3" data-next="{{ count($stories) }}">
            @foreach ($stories as $i => $st)
                @include('admin.invitations.partials.story-row', ['i' => $i, 'st' => $st])
            @endforeach
        </div>
        <template id="tpl-love_stories">@include('admin.invitations.partials.story-row', ['i' => '__i__', 'st' => []])</template>
    </div>

    {{-- GALERI --}}
    <div class="panel">
        <h2 class="font-bold mb-3">7. Galeri Foto</h2>
        @if ($invitation->gallery)
            <div class="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
                @foreach ($invitation->gallery as $img)
                    <label class="relative block">
                        <img src="{{ Invitation::media($img) }}" class="aspect-square object-cover rounded-lg">
                        <span class="absolute bottom-1 left-1 bg-white/90 rounded px-1.5 text-xs"><input type="checkbox" name="remove_gallery[]" value="{{ $img }}"> hapus</span>
                    </label>
                @endforeach
            </div>
        @endif
        <input type="file" name="gallery_files[]" accept="image/*" multiple class="inp" id="galleryInput">
        <small class="text-xs text-stone-500">Foto pre-wedding / momen pengantin. Bisa pilih banyak sekaligus (maks 20 foto per unggahan, 4MB per foto). Gaya tampilan galeri mengikuti template (masonry, carousel, polaroid, filmstrip, atau mosaic).</small>
        <div id="galleryPreview" class="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-3"></div>
    </div>

    {{-- HADIAH --}}
    <div class="panel">
        <div class="flex justify-between items-center mb-3">
            <h2 class="font-bold">8. Amplop Digital</h2>
            <button type="button" class="btn-o" data-add="gifts">+ Tambah Rekening</button>
        </div>
        <div id="gifts" class="space-y-3" data-next="{{ count($gifts) }}">
            @foreach ($gifts as $i => $g)
                @include('admin.invitations.partials.gift-row', ['i' => $i, 'g' => $g])
            @endforeach
        </div>
        <template id="tpl-gifts">@include('admin.invitations.partials.gift-row', ['i' => '__i__', 'g' => []])</template>
        <div class="mt-4"><label class="lbl">Alamat Kirim Kado</label><textarea name="gift_address" rows="2" class="inp">{{ $v('gift_address') }}</textarea></div>
    </div>

    {{-- LAINNYA --}}
    <div class="panel grid md:grid-cols-2 gap-4">
        <h2 class="font-bold md:col-span-2">9. Musik &amp; Lainnya</h2>
        <div><label class="lbl">URL Musik (mp3)</label><input type="url" name="music_url" value="{{ $v('music_url') }}" class="inp" placeholder="https://..."></div>
        <div><label class="lbl">atau Upload Musik</label><input type="file" name="music_file" accept=".mp3,.ogg,.m4a" class="inp"></div>
        <div><label class="lbl">Link Live Streaming</label><input type="url" name="livestream_url" value="{{ $v('livestream_url') }}" class="inp" placeholder="https://youtube.com/..."></div>
        <div><label class="lbl">Kalimat Penutup</label><textarea name="closing_text" rows="2" class="inp">{{ $v('closing_text') }}</textarea></div>
    </div>

    <div class="flex gap-3 sticky bottom-4">
        <button class="btn-p shadow-lg">💾 Simpan Undangan</button>
        <a href="{{ route('admin.invitations.index') }}" class="btn-o">Batal</a>
    </div>
</form>
@endsection

@push('scripts')
<script>
    document.querySelectorAll('[data-add]').forEach(btn => btn.addEventListener('click', () => {
        const key = btn.dataset.add, box = document.getElementById(key);
        const i = Number(box.dataset.next || 0);
        box.dataset.next = i + 1;
        box.insertAdjacentHTML('beforeend', document.getElementById('tpl-' + key).innerHTML.replaceAll('__i__', i));
    }));
    document.addEventListener('click', e => {
        if (e.target.closest('[data-remove]')) e.target.closest('[data-row]').remove();
    });
    document.getElementById('galleryInput').addEventListener('change', e => {
        const box = document.getElementById('galleryPreview');
        box.innerHTML = '';
        [...e.target.files].forEach(f => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(f);
            img.className = 'aspect-square object-cover rounded-lg ring-2 ring-rose-200';
            box.appendChild(img);
        });
    });
</script>
@endpush

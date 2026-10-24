@extends('layouts.admin')
@section('title', 'Atur Template: '.$template->name)
@section('actions')
    <a href="{{ route('template.preview', $template) }}" target="_blank" class="btn-o">Preview ↗</a>
@endsection

@php($s = $template->settings)

@section('content')
<form method="POST" action="{{ route('admin.templates.update', $template) }}" class="space-y-6 max-w-4xl">
    @csrf @method('PUT')

    <div class="panel grid md:grid-cols-3 gap-4">
        <div><label class="lbl">Nama</label><input name="name" value="{{ old('name', $template->name) }}" class="inp" required></div>
        <div><label class="lbl">Kategori</label><input name="category" value="{{ old('category', $template->category) }}" class="inp" required></div>
        <div><label class="lbl">Urutan</label><input type="number" name="sort_order" value="{{ old('sort_order', $template->sort_order) }}" class="inp" required></div>
        <div class="md:col-span-3"><label class="lbl">Deskripsi</label><textarea name="description" rows="2" class="inp">{{ old('description', $template->description) }}</textarea></div>
    </div>

    <div class="panel">
        <h2 class="font-bold mb-4">Palet Warna</h2>
        <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
            @foreach (['bg' => 'Latar', 'surface' => 'Kartu', 'primary' => 'Utama', 'accent' => 'Aksen', 'text' => 'Teks', 'muted' => 'Teks Redup'] as $k => $label)
                <label class="block">
                    <span class="lbl">{{ $label }}</span>
                    <input type="color" name="colors[{{ $k }}]" value="{{ old("colors.$k", $s['colors'][$k] ?? '#000000') }}" class="w-full h-12 rounded-lg border cursor-pointer">
                </label>
            @endforeach
        </div>
        <label class="flex items-center gap-2 text-sm mt-4"><input type="checkbox" name="dark" value="1" @checked(old('dark', $s['dark'] ?? false))> Tema gelap</label>
    </div>

    <div class="panel grid md:grid-cols-3 gap-4">
        <h2 class="font-bold md:col-span-3">Tipografi (Google Fonts)</h2>
        @foreach ($fontChoices as $role => $list)
            <div>
                <label class="lbl">Font {{ ['script' => 'Script / Nama', 'heading' => 'Judul', 'body' => 'Isi'][$role] }}</label>
                <select name="fonts[{{ $role }}]" class="inp">
                    @foreach (collect($list)->push($s['fonts'][$role] ?? null)->filter()->unique()->sort() as $font)
                        <option @selected(old("fonts.$role", $s['fonts'][$role] ?? '') === $font)>{{ $font }}</option>
                    @endforeach
                </select>
            </div>
        @endforeach
    </div>

    <div class="panel grid md:grid-cols-3 gap-4">
        <h2 class="font-bold md:col-span-3">Animasi &amp; Tata Letak</h2>
        @foreach ([
            'opening' => 'Animasi Pembuka',
            'ambient' => 'Efek Latar (partikel)',
            'reveal' => 'Gaya Reveal Scroll',
            'cover' => 'Layout Sampul',
            'ornament' => 'Ornamen',
            'gallery' => 'Gaya Galeri Foto',
        ] as $key => $label)
            <div>
                <label class="lbl">{{ $label }}</label>
                <select name="{{ $key }}" class="inp">
                    @foreach ($options[$key] as $opt)
                        <option @selected(old($key, $s[$key] ?? '') === $opt)>{{ $opt }}</option>
                    @endforeach
                </select>
            </div>
        @endforeach
    </div>

    <div class="flex gap-3">
        <button class="btn-p">💾 Simpan</button>
        <a href="{{ route('admin.templates.index') }}" class="btn-o">Batal</a>
    </div>
</form>
@endsection

<div data-row class="grid md:grid-cols-6 gap-3 p-4 rounded-xl bg-stone-50 border">
    <div><label class="lbl">Tahun</label><input name="love_stories[{{ $i }}][year]" value="{{ $st['year'] ?? '' }}" class="inp" placeholder="2020"></div>
    <div class="md:col-span-2"><label class="lbl">Judul</label><input name="love_stories[{{ $i }}][title]" value="{{ $st['title'] ?? '' }}" class="inp" placeholder="Pertama Bertemu"></div>
    <div class="md:col-span-2"><label class="lbl">Cerita</label><textarea name="love_stories[{{ $i }}][story]" rows="1" class="inp">{{ $st['story'] ?? '' }}</textarea></div>
    <div class="flex items-end"><button type="button" data-remove class="btn-o text-rose-600 w-full justify-center">Hapus</button></div>
</div>

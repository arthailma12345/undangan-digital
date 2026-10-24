<div data-row class="grid md:grid-cols-6 gap-3 p-4 rounded-xl bg-stone-50 border relative">
    <div class="md:col-span-2"><label class="lbl">Nama Acara</label><input name="events[{{ $i }}][name]" value="{{ $ev['name'] ?? '' }}" class="inp" placeholder="Akad Nikah"></div>
    <div><label class="lbl">Tanggal</label><input type="date" name="events[{{ $i }}][date]" value="{{ $ev['date'] ?? '' }}" class="inp"></div>
    <div><label class="lbl">Mulai</label><input type="time" name="events[{{ $i }}][start_time]" value="{{ $ev['start_time'] ?? '' }}" class="inp"></div>
    <div><label class="lbl">Selesai</label><input name="events[{{ $i }}][end_time]" value="{{ $ev['end_time'] ?? '' }}" class="inp" placeholder="Selesai / 12:00"></div>
    <div class="flex items-end"><button type="button" data-remove class="btn-o text-rose-600 w-full justify-center">Hapus</button></div>
    <div class="md:col-span-2"><label class="lbl">Nama Tempat</label><input name="events[{{ $i }}][venue]" value="{{ $ev['venue'] ?? '' }}" class="inp"></div>
    <div class="md:col-span-2"><label class="lbl">Alamat</label><input name="events[{{ $i }}][address]" value="{{ $ev['address'] ?? '' }}" class="inp"></div>
    <div class="md:col-span-2"><label class="lbl">Link Google Maps</label><input type="url" name="events[{{ $i }}][maps_url]" value="{{ $ev['maps_url'] ?? '' }}" class="inp" placeholder="https://maps.app.goo.gl/..."></div>
</div>

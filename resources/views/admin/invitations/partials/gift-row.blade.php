<div data-row class="grid md:grid-cols-4 gap-3 p-4 rounded-xl bg-stone-50 border">
    <div><label class="lbl">Bank / E-Wallet</label><input name="gifts[{{ $i }}][bank]" value="{{ $g['bank'] ?? '' }}" class="inp" placeholder="BCA / DANA"></div>
    <div><label class="lbl">No. Rekening</label><input name="gifts[{{ $i }}][number]" value="{{ $g['number'] ?? '' }}" class="inp"></div>
    <div><label class="lbl">Atas Nama</label><input name="gifts[{{ $i }}][holder]" value="{{ $g['holder'] ?? '' }}" class="inp"></div>
    <div class="flex items-end"><button type="button" data-remove class="btn-o text-rose-600 w-full justify-center">Hapus</button></div>
</div>

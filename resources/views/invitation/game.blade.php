@php
    use App\Models\Invitation;
    $m = fn ($p) => Invitation::media($p);
    $events = $invitation->events ?? [];
    $firstEvent = $events[0] ?? null;
    $date = $invitation->event_date;
    $calendarUrl = 'https://calendar.google.com/calendar/render?'.http_build_query([
        'action' => 'TEMPLATE',
        'text' => 'Pernikahan '.$invitation->coupleName(),
        'dates' => $date->format('Ymd\THis').'/'.$date->copy()->addHours(4)->format('Ymd\THis'),
        'details' => 'Undangan pernikahan '.$invitation->coupleName(),
        'location' => $firstEvent['address'] ?? '',
    ]);
    $coverPhoto = $m($invitation->cover_photo);
    $jsConfig = [
        'slug' => $invitation->slug,
        'groom' => $invitation->groom_nickname,
        'bride' => $invitation->bride_nickname,
        'preview' => $isPreview,
    ];
    $heart = '<svg class="pxheart" viewBox="0 0 7 6" shape-rendering="crispEdges" aria-hidden="true"><path d="M1 0h2v1h1V0h2v1h1v2H6v1H5v1H4v1H3V5H2V4H1V3H0V1h1z"/></svg>';
@endphp
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <title>The Wedding of {{ $invitation->coupleName() }}</title>
    <meta name="description" content="Undangan pernikahan {{ $invitation->coupleName() }} - {{ $date->translatedFormat('l, d F Y') }}">
    <meta property="og:title" content="The Wedding of {{ $invitation->coupleName() }}">
    <meta property="og:description" content="{{ $date->translatedFormat('l, d F Y') }}">
    @if ($coverPhoto)<meta property="og:image" content="{{ url($coverPhoto) }}">@endif
    <meta name="theme-color" content="#4f9d3a">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Pixelify+Sans:wght@400;600;700&display=swap">
    <link rel="stylesheet" href="{{ asset('css/invitation-farm.css') }}?v={{ filemtime(public_path('css/invitation-farm.css')) }}">
</head>
<body>

<canvas id="world" aria-label="Desa pixel tempat undangan berada. Gunakan tombol arah untuk berjalan."></canvas>

@if ($isPreview)
    <div class="preview-bar">
        <span>Preview: <b>{{ $template->name }}</b></span>
        <a href="{{ route('home') }}">← Semua Template</a>
        @auth<a href="{{ route('admin.invitations.create', ['template' => $template->id]) }}">Gunakan</a>@endauth
    </div>
@endif

{{-- ============ LAYAR JUDUL ============ --}}
<section id="title" class="title-screen">
    <div class="title-card panel">
        <p class="px eyebrow">~ The Wedding of ~</p>
        @if ($coverPhoto)
            <div class="title-photo"><img src="{{ $coverPhoto }}" alt="{{ $invitation->coupleName() }}"></div>
        @endif
        <h1 class="px title-names">
            <span>{{ $invitation->groom_nickname }}</span>
            <span class="amp">{!! $heart !!}</span>
            <span>{{ $invitation->bride_nickname }}</span>
        </h1>
        <p class="title-date">{{ $date->translatedFormat('l, d F Y') }}</p>
        <div class="guest-box">
            <p>Kepada Yth. Bapak/Ibu/Saudara/i</p>
            <h2>{{ $guestName }}</h2>
            <small>Mohon maaf apabila ada kesalahan penulisan nama/gelar</small>
        </div>
        <button type="button" id="startBtn" class="btn-px btn-start"><span class="blink">▶</span> MULAI JELAJAH</button>
        <p class="title-hint">Jalan-jalan di desa kami untuk menemukan isi undangan</p>
    </div>
</section>

{{-- ============ HUD ============ --}}
<div id="hud" hidden>
    <div class="quest panel">
        <b class="px">Jelajahi Desa</b>
        <div class="quest-bar"><i id="questFill"></i></div>
        <small><span id="questCount">0/0</span> tempat dikunjungi</small>
    </div>
    <div class="hud-btns">
        <button type="button" id="mapBtn" class="btn-px btn-sm">PETA</button>
        <button type="button" id="soundBtn" class="btn-px btn-sm" aria-label="Suara">♪</button>
    </div>
    <div id="prompt" class="prompt panel" hidden></div>
    <div id="say" class="say panel" hidden></div>
    <div id="help" class="help panel">
        <b class="px">Cara Bermain</b>
        <p class="only-key">⬅⬆➡⬇ / WASD : berjalan<br>Spasi / Enter : lihat &amp; bicara</p>
        <p class="only-touch">Pakai tombol arah, atau ketuk tempat yang ingin dituju. Tombol <b>A</b> untuk bicara.</p>
        <p>Cari tanda <b class="bang">!</b> di sekitar desa. Tombol <b>PETA</b> untuk langsung membuka isi undangan.</p>
    </div>
    <div id="pad" class="pad" aria-hidden="true">
        <div class="dpad">
            <button type="button" data-dir="up">▲</button>
            <button type="button" data-dir="left">◀</button>
            <button type="button" data-dir="right">▶</button>
            <button type="button" data-dir="down">▼</button>
        </div>
        <button type="button" class="abtn" id="aBtn">A</button>
    </div>
</div>

<div id="menu" class="menu panel" hidden role="dialog" aria-label="Peta desa">
    <div class="dlg-head"><b class="px">Peta Desa</b><button type="button" class="x" data-close-menu aria-label="Tutup">✕</button></div>
    <ul id="menuList"></ul>
</div>

{{-- ============ DIALOG / ISI UNDANGAN ============ --}}
<div id="shade" class="shade" hidden></div>
<div id="dialog" class="dialog panel" hidden role="dialog" aria-modal="true" tabindex="-1">
    <div class="dlg-head"><span id="dlgIcon" class="dlg-icon"></span><b id="dlgTitle" class="px"></b><button type="button" class="x" data-close aria-label="Tutup">✕</button></div>
    <div class="dlg-body" id="dlgBody">

        <section data-page="welcome" data-title="Selamat Datang" data-icon="🪧">
            <p class="eyebrow">Desa Bahagia</p>
            <p>Halo, <b>{{ $guestName }}</b>! Selamat datang di desa kecil kami.</p>
            <p>Undangan kami tersebar di seluruh penjuru desa. Kunjungi rumah, balai, lumbung, dan sudut-sudut lain untuk menemukannya. Tanda <b class="bang">!</b> menandai tempat yang belum kamu kunjungi.</p>
            <p class="muted">Tidak ingin berjalan-jalan? Tekan tombol <b>PETA</b> di pojok kanan atas.</p>
        </section>

        <section data-page="couple" data-title="Pelaminan" data-icon="💐">
            <p class="eyebrow">Assalamu'alaikum Wr. Wb.</p>
            <h3 class="names px">{{ $invitation->groom_nickname }} {!! $heart !!} {{ $invitation->bride_nickname }}</h3>
            <p>Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan kami. Terima kasih sudah datang sejauh ini!</p>
            @if ($invitation->quote)
                <blockquote class="card">“{{ $invitation->quote }}”@if ($invitation->quote_source)<cite>{{ $invitation->quote_source }}</cite>@endif</blockquote>
            @endif
        </section>

        @foreach ([['groom', 'Mempelai Pria'], ['bride', 'Mempelai Wanita']] as [$who, $label])
            <section data-page="{{ $who }}" data-title="Rumah {{ $invitation->{$who.'_nickname'} }}" data-icon="{{ $who === 'groom' ? '🏡' : '🏠' }}">
                <p class="eyebrow">{{ $label }}</p>
                <div class="person">
                    <div class="pframe">
                        @if ($photo = $m($invitation->{$who.'_photo'}))
                            <img src="{{ $photo }}" alt="{{ $invitation->{$who.'_name'} }}" loading="lazy">
                        @else
                            <span class="px">{{ mb_substr($invitation->{$who.'_nickname'}, 0, 1) }}</span>
                        @endif
                    </div>
                    <h3 class="px">{{ $invitation->{$who.'_nickname'} }}</h3>
                    <h4>{{ $invitation->{$who.'_name'} }}</h4>
                    @if ($invitation->{$who.'_father'} || $invitation->{$who.'_mother'})
                        <p class="parents">
                            {{ $invitation->{$who.'_child_order'} ?: ($who === 'groom' ? 'Putra dari' : 'Putri dari') }}<br>
                            {{ $invitation->{$who.'_father'} }} @if ($invitation->{$who.'_father'} && $invitation->{$who.'_mother'}) &amp; @endif {{ $invitation->{$who.'_mother'} }}
                        </p>
                    @endif
                    @if ($ig = $invitation->{$who.'_instagram'})
                        <a class="btn-px btn-sm" href="https://instagram.com/{{ ltrim($ig, '@') }}" target="_blank" rel="noopener">&#64;{{ ltrim($ig, '@') }}</a>
                    @endif
                </div>
            </section>
        @endforeach

        <section data-page="board" data-title="Papan Pengumuman" data-icon="📌">
            <p class="eyebrow">Save The Date</p>
            <p class="big-date px">{{ $date->translatedFormat('d . m . Y') }}</p>
            <p class="center">{{ $date->translatedFormat('l, d F Y') }}</p>
            <div class="countdown" data-date="{{ $date->toIso8601String() }}">
                <div><b data-cd="d">0</b><span>Hari</span></div>
                <div><b data-cd="h">0</b><span>Jam</span></div>
                <div><b data-cd="m">0</b><span>Menit</span></div>
                <div><b data-cd="s">0</b><span>Detik</span></div>
            </div>
            <p class="center"><a class="btn-px" href="{{ $calendarUrl }}" target="_blank" rel="noopener">Simpan ke Kalender</a></p>
        </section>

        @if ($events)
            <section data-page="hall" data-title="Balai Desa" data-icon="🏛️">
                <p class="eyebrow">Waktu &amp; Tempat</p>
                @foreach ($events as $ev)
                    @php($evDate = !empty($ev['date']) ? \Illuminate\Support\Carbon::parse($ev['date']) : $date)
                    <div class="card event">
                        <h3 class="px">{{ $ev['name'] ?? 'Acara' }}</h3>
                        <p class="ev-date">{{ $evDate->translatedFormat('l, d F Y') }}</p>
                        @if (!empty($ev['start_time']))
                            <p>Pukul {{ $ev['start_time'] }}{{ !empty($ev['end_time']) ? ' - '.$ev['end_time'] : ' - Selesai' }} WIB</p>
                        @endif
                        @if (!empty($ev['venue']))<p><b>{{ $ev['venue'] }}</b></p>@endif
                        @if (!empty($ev['address']))<p class="muted">{{ $ev['address'] }}</p>@endif
                        @if (!empty($ev['maps_url']) || !empty($ev['address']))
                            <a class="btn-px btn-sm" target="_blank" rel="noopener"
                               href="{{ $ev['maps_url'] ?? 'https://maps.google.com/?q='.urlencode($ev['address']) }}">Lihat Lokasi</a>
                        @endif
                    </div>
                @endforeach
                @if (!empty($firstEvent['address']))
                    <div class="map"><iframe loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Peta lokasi"
                        data-src="https://maps.google.com/maps?q={{ urlencode(($firstEvent['venue'] ?? '').' '.$firstEvent['address']) }}&output=embed"></iframe></div>
                @endif
                @if ($invitation->livestream_url)
                    <div class="card">
                        <h3 class="px">Live Streaming</h3>
                        <p>Saksikan momen bahagia kami secara virtual.</p>
                        <a class="btn-px btn-sm" href="{{ $invitation->livestream_url }}" target="_blank" rel="noopener">Tonton Live</a>
                    </div>
                @endif
            </section>
        @endif

        @if ($invitation->love_stories)
            <section data-page="tree" data-title="Pohon Kenangan" data-icon="🌸">
                <p class="eyebrow">Kisah Cinta Kami</p>
                <div class="timeline">
                    @foreach ($invitation->love_stories as $st)
                        <div class="tl-item">
                            <small class="px">{{ $st['year'] ?? '' }}</small>
                            <h3>{{ $st['title'] ?? '' }}</h3>
                            <p>{{ $st['story'] ?? '' }}</p>
                        </div>
                    @endforeach
                </div>
            </section>
        @endif

        @if ($invitation->gallery)
            <section data-page="barn" data-title="Lumbung Foto" data-icon="📷">
                <p class="eyebrow">Our Moments</p>
                <div class="gal">
                    @foreach (array_values($invitation->gallery) as $i => $img)
                        <button type="button" class="g-item" data-lightbox="{{ $m($img) }}"><img src="{{ $m($img) }}" alt="Foto {{ $i + 1 }} {{ $invitation->coupleName() }}" loading="lazy"></button>
                    @endforeach
                </div>
            </section>
        @endif

        <section data-page="mail" data-title="Kotak Surat" data-icon="💌">
            <p class="eyebrow">RSVP &amp; Ucapan</p>
            <form id="wishForm" class="card" data-url="{{ $isPreview ? '' : route('invitation.wish', $invitation) }}">
                <input type="hidden" name="guest_code" value="{{ $guest?->code }}">
                <label>Nama<input name="name" required maxlength="100" value="{{ $guestName !== 'Tamu Undangan' ? $guestName : '' }}"></label>
                <label>Konfirmasi Kehadiran
                    <select name="attendance">
                        @foreach (\App\Models\Wish::ATTENDANCE as $k => $v)<option value="{{ $k }}">{{ $v }}</option>@endforeach
                    </select>
                </label>
                <label>Jumlah Tamu
                    <select name="pax">@for ($i = 1; $i <= 5; $i++)<option>{{ $i }}</option>@endfor</select>
                </label>
                <label>Ucapan<textarea name="message" rows="3" maxlength="1000" placeholder="Tulis ucapan & doa terbaik..."></textarea></label>
                <button class="btn-px" type="submit">Kirim Surat</button>
                <p class="form-msg" hidden></p>
            </form>
            <div id="wishList" class="wishes">
                @foreach ($invitation->wishes as $w)
                    <div class="wish">
                        <b>{{ $w->name }}</b> <span class="badge">{{ $w->attendanceLabel() }}</span>
                        <p>{{ $w->message }}</p>
                        <small>{{ optional($w->created_at)->diffForHumans() }}</small>
                    </div>
                @endforeach
            </div>
        </section>

        @if ($invitation->gifts || $invitation->gift_address)
            <section data-page="chest" data-title="Peti Hadiah" data-icon="🎁">
                <p class="eyebrow">Wedding Gift</p>
                <p>Doa restu Anda merupakan karunia yang sangat berarti. Namun jika memberi adalah ungkapan tanda kasih, Anda dapat memberi kado secara cashless.</p>
                @foreach ($invitation->gifts ?? [] as $g)
                    <div class="card gift">
                        <b class="px">{{ $g['bank'] ?? '' }}</b>
                        <p class="acc">{{ $g['number'] ?? '' }}</p>
                        <p>a.n. {{ $g['holder'] ?? '' }}</p>
                        <button type="button" class="btn-px btn-sm" data-copy="{{ $g['number'] ?? '' }}">Salin No. Rekening</button>
                    </div>
                @endforeach
                @if ($invitation->gift_address)
                    <div class="card gift">
                        <b class="px">Kirim Kado</b>
                        <p>{{ $invitation->gift_address }}</p>
                        <button type="button" class="btn-px btn-sm" data-copy="{{ $invitation->gift_address }}">Salin Alamat</button>
                    </div>
                @endif
            </section>
        @endif

        <section data-page="finish" data-title="Terima Kasih" data-icon="💖">
            <p class="eyebrow">Petualangan Selesai!</p>
            <p>{{ $invitation->closing_text ?: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.' }}</p>
            <p class="center">Kami yang berbahagia,</p>
            <h3 class="names px">{{ $invitation->groom_nickname }} {!! $heart !!} {{ $invitation->bride_nickname }}</h3>
            <p class="credit">Dibuat dengan ♥ oleh {{ config('app.name') }}</p>
        </section>
    </div>
    <div class="dlg-foot"><button type="button" class="btn-px btn-sm" data-close>Tutup <span class="key">[Esc]</span></button></div>
</div>

<div id="lightbox" class="lightbox" hidden><img alt="Foto galeri"></div>
<div id="iris" class="iris"></div>

@if ($invitation->music_url)
    <audio id="bgm" src="{{ $invitation->music_url }}" loop preload="none"></audio>
@endif

<script>
    window.FARM = {!! json_encode($jsConfig, JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES) !!};
</script>
<script src="{{ asset('js/invitation-farm.js') }}?v={{ filemtime(public_path('js/invitation-farm.js')) }}"></script>
</body>
</html>

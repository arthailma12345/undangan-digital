@php
    use App\Models\Invitation;
    $s = $template->settings;
    $m = fn ($p) => Invitation::media($p);
    $orn = $s['ornament'] ?? 'line';
    $events = $invitation->events ?? [];
    $firstEvent = $events[0] ?? null;
    $date = $invitation->event_date;
    $initials = mb_substr($invitation->groom_nickname, 0, 1).mb_substr($invitation->bride_nickname, 0, 1);
    $calendarUrl = 'https://calendar.google.com/calendar/render?'.http_build_query([
        'action' => 'TEMPLATE',
        'text' => 'Pernikahan '.$invitation->coupleName(),
        'dates' => $date->format('Ymd\THis').'/'.$date->copy()->addHours(4)->format('Ymd\THis'),
        'details' => 'Undangan pernikahan '.$invitation->coupleName(),
        'location' => $firstEvent['address'] ?? '',
    ]);
    $coverPhoto = $m($invitation->cover_photo);
    $jsConfig = [
        'opening' => $s['opening'] ?? 'iris-close',
        'ambient' => $s['ambient'] ?? 'twinkle',
        'colors' => $s['colors'] ?? [],
        'dark' => (bool) ($s['dark'] ?? false),
    ];
@endphp
<!DOCTYPE html>
<html lang="id" class="{{ ($s['dark'] ?? false) ? 'is-dark' : '' }}"
      data-theme="{{ $template->slug }}" data-cover="{{ $s['cover'] ?? 'arch' }}" data-reveal="{{ $s['reveal'] ?? 'fade-up' }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>The Wedding of {{ $invitation->coupleName() }}</title>
    <meta name="description" content="Undangan pernikahan {{ $invitation->coupleName() }} - {{ $date->translatedFormat('l, d F Y') }}">
    <meta property="og:title" content="The Wedding of {{ $invitation->coupleName() }}">
    <meta property="og:description" content="{{ $date->translatedFormat('l, d F Y') }}">
    @if ($coverPhoto)<meta property="og:image" content="{{ url($coverPhoto) }}">@endif
    <meta name="theme-color" content="{{ $s['colors']['bg'] ?? '#ffffff' }}">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="{{ $template->googleFontsUrl() }}">
    <link rel="stylesheet" href="{{ asset('css/invitation.css') }}?v={{ filemtime(public_path('css/invitation.css')) }}">
    <style>:root { {!! $template->cssVariables() !!} }</style>
</head>
<body class="locked">

<canvas id="ambient" aria-hidden="true"></canvas>

@if ($isPreview)
    <div class="preview-bar">
        <span>Preview: <b>{{ $template->name }}</b></span>
        <a href="{{ route('home') }}">← Semua Template</a>
        @auth<a href="{{ route('admin.invitations.create', ['template' => $template->id]) }}">Gunakan</a>@endauth
    </div>
@endif

{{-- ============ SAMPUL ============ --}}
<section id="cover" class="cover" @if ($coverPhoto) style="--cover-img:url('{{ $coverPhoto }}')" @endif>
    <div class="cover-bg"></div>
    @include('invitation.ornament', ['type' => $orn, 'class' => 'corner tl'])
    @include('invitation.ornament', ['type' => $orn, 'class' => 'corner tr'])
    @include('invitation.ornament', ['type' => $orn, 'class' => 'corner bl'])
    @include('invitation.ornament', ['type' => $orn, 'class' => 'corner br'])

    <div class="cover-inner">
        <p class="cover-eyebrow">The Wedding of</p>
        <div class="cover-photo">
            @if ($coverPhoto)
                <img src="{{ $coverPhoto }}" alt="{{ $invitation->coupleName() }}">
            @else
                <span class="monogram">{{ $initials }}</span>
            @endif
        </div>
        <h1 class="cover-names">
            <span>{{ $invitation->groom_nickname }}</span>
            <span class="amp">&amp;</span>
            <span>{{ $invitation->bride_nickname }}</span>
        </h1>
        <p class="cover-date">{{ $date->translatedFormat('l, d F Y') }}</p>

        <div class="cover-guest">
            <p>Kepada Yth. Bapak/Ibu/Saudara/i</p>
            <h2>{{ $guestName }}</h2>
            <small>Mohon maaf apabila ada kesalahan penulisan nama/gelar</small>
        </div>
        <button type="button" id="openBtn" class="btn btn-open">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8l9 6 9-6M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z"/></svg>
            Buka Undangan
        </button>
    </div>
</section>

{{-- Panel samping untuk layar lebar --}}
<aside class="side-panel">
    <div class="cover-bg"></div>
    <div class="side-inner">
        <p class="cover-eyebrow">The Wedding of</p>
        <h1 class="cover-names"><span>{{ $invitation->groom_nickname }}</span><span class="amp">&amp;</span><span>{{ $invitation->bride_nickname }}</span></h1>
        <p class="cover-date">{{ $date->translatedFormat('d . m . Y') }}</p>
    </div>
    @include('invitation.ornament', ['type' => $orn, 'class' => 'corner tl'])
    @include('invitation.ornament', ['type' => $orn, 'class' => 'corner br'])
</aside>

{{-- ============ ISI UNDANGAN ============ --}}
<main id="content">

    <section id="home" class="sec hero">
        @include('invitation.ornament', ['type' => $orn, 'class' => 'corner tl'])
        @include('invitation.ornament', ['type' => $orn, 'class' => 'corner tr'])
        <div class="rv">
            <p class="eyebrow">Save The Date</p>
            <h2 class="script big">{{ $invitation->groom_nickname }} <span class="amp">&amp;</span> {{ $invitation->bride_nickname }}</h2>
            <p class="date-line">{{ $date->translatedFormat('l, d F Y') }}</p>
        </div>
        <div class="countdown rv" data-date="{{ $date->toIso8601String() }}">
            <div><b data-cd="d">0</b><span>Hari</span></div>
            <div><b data-cd="h">0</b><span>Jam</span></div>
            <div><b data-cd="m">0</b><span>Menit</span></div>
            <div><b data-cd="s">0</b><span>Detik</span></div>
        </div>
        <a class="btn rv" href="{{ $calendarUrl }}" target="_blank" rel="noopener">Simpan ke Kalender</a>
    </section>

    @if ($invitation->quote)
        <section class="sec quote">
            <div class="divider rv"><i></i><span>✦</span><i></i></div>
            <blockquote class="rv">“{{ $invitation->quote }}”</blockquote>
            @if ($invitation->quote_source)<cite class="rv">{{ $invitation->quote_source }}</cite>@endif
        </section>
    @endif

    <section id="couple" class="sec couple">
        <p class="eyebrow rv">Mempelai</p>
        <p class="intro rv">Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami:</p>

        @foreach ([['groom', 'Mempelai Pria'], ['bride', 'Mempelai Wanita']] as [$who, $label])
            <div class="person rv">
                <div class="person-photo">
                    @include('invitation.ornament', ['type' => $orn, 'class' => 'photo-orn'])
                    @if ($photo = $m($invitation->{$who.'_photo'}))
                        <img src="{{ $photo }}" alt="{{ $invitation->{$who.'_name'} }}" loading="lazy">
                    @else
                        <span class="monogram">{{ mb_substr($invitation->{$who.'_nickname'}, 0, 1) }}</span>
                    @endif
                </div>
                <h3 class="script">{{ $invitation->{$who.'_nickname'} }}</h3>
                <h4>{{ $invitation->{$who.'_name'} }}</h4>
                @if ($invitation->{$who.'_father'} || $invitation->{$who.'_mother'})
                    <p class="parents">
                        {{ $invitation->{$who.'_child_order'} ?: ($who === 'groom' ? 'Putra dari' : 'Putri dari') }}<br>
                        {{ $invitation->{$who.'_father'} }} @if ($invitation->{$who.'_father'} && $invitation->{$who.'_mother'}) &amp; @endif {{ $invitation->{$who.'_mother'} }}
                    </p>
                @endif
                @if ($ig = $invitation->{$who.'_instagram'})
                    <a class="ig" href="https://instagram.com/{{ ltrim($ig, '@') }}" target="_blank" rel="noopener">&#64;{{ ltrim($ig, '@') }}</a>
                @endif
            </div>
            @if ($who === 'groom')<div class="amp-big rv">&amp;</div>@endif
        @endforeach
    </section>

    @if ($events)
        <section id="event" class="sec events">
            <p class="eyebrow rv">Waktu &amp; Tempat</p>
            <h2 class="title rv">Rangkaian Acara</h2>
            @foreach ($events as $ev)
                @php($evDate = !empty($ev['date']) ? \Illuminate\Support\Carbon::parse($ev['date']) : $date)
                <div class="card event-card rv">
                    @include('invitation.ornament', ['type' => $orn, 'class' => 'card-orn'])
                    <h3 class="script">{{ $ev['name'] ?? 'Acara' }}</h3>
                    <div class="ev-date">
                        <span>{{ $evDate->translatedFormat('l') }}</span>
                        <b>{{ $evDate->format('d') }}</b>
                        <span>{{ $evDate->translatedFormat('F Y') }}</span>
                    </div>
                    @if (!empty($ev['start_time']))
                        <p class="ev-time">Pukul {{ $ev['start_time'] }}{{ !empty($ev['end_time']) ? ' - '.$ev['end_time'] : ' - Selesai' }} WIB</p>
                    @endif
                    @if (!empty($ev['venue']))<p class="ev-venue">{{ $ev['venue'] }}</p>@endif
                    @if (!empty($ev['address']))<p class="ev-address">{{ $ev['address'] }}</p>@endif
                    @if (!empty($ev['maps_url']) || !empty($ev['address']))
                        <a class="btn btn-sm" target="_blank" rel="noopener"
                           href="{{ $ev['maps_url'] ?? 'https://maps.google.com/?q='.urlencode($ev['address']) }}">Lihat Lokasi</a>
                    @endif
                </div>
            @endforeach
            @if (!empty($firstEvent['address']))
                <div class="map rv">
                    <iframe loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Peta lokasi"
                            src="https://maps.google.com/maps?q={{ urlencode(($firstEvent['venue'] ?? '').' '.$firstEvent['address']) }}&output=embed"></iframe>
                </div>
            @endif
            @if ($invitation->livestream_url)
                <div class="card rv">
                    <h3 class="title-sm">Live Streaming</h3>
                    <p>Saksikan momen bahagia kami secara virtual.</p>
                    <a class="btn btn-sm" href="{{ $invitation->livestream_url }}" target="_blank" rel="noopener">Tonton Live</a>
                </div>
            @endif
        </section>
    @endif

    @if ($invitation->love_stories)
        <section id="story" class="sec story">
            <p class="eyebrow rv">Our Journey</p>
            <h2 class="title rv">Kisah Cinta</h2>
            <div class="timeline">
                @foreach ($invitation->love_stories as $st)
                    <div class="tl-item rv">
                        <span class="tl-dot"></span>
                        <small>{{ $st['year'] ?? '' }}</small>
                        <h3>{{ $st['title'] ?? '' }}</h3>
                        <p>{{ $st['story'] ?? '' }}</p>
                    </div>
                @endforeach
            </div>
        </section>
    @endif

    @if ($invitation->gallery)
        @php($gStyle = $s['gallery'] ?? 'masonry')
        @php($photos = array_values($invitation->gallery))
        @php($tilts = [-4, 3, -2, 5, -3, 2])
        <section id="gallery" class="sec gallery">
            <p class="eyebrow rv">Our Moments</p>
            <h2 class="title rv">Galeri Pre-Wedding</h2>
            <p class="intro rv">Sepenggal kisah kami yang terabadikan dalam bingkai, menanti hari bahagia.</p>

            @if ($gStyle === 'carousel')
                <div class="gal g-carousel rv" data-carousel>
                    <div class="g-track">
                        @foreach ($photos as $i => $img)
                            <a href="{{ $m($img) }}" class="g-item" data-lightbox data-index="{{ $i }}"><img src="{{ $m($img) }}" alt="Foto {{ $i + 1 }} {{ $invitation->coupleName() }}" loading="lazy"></a>
                        @endforeach
                    </div>
                    <button type="button" class="g-nav prev" aria-label="Sebelumnya">‹</button>
                    <button type="button" class="g-nav next" aria-label="Berikutnya">›</button>
                    <div class="g-dots">@foreach ($photos as $i => $img)<i></i>@endforeach</div>
                </div>
            @elseif ($gStyle === 'filmstrip')
                <div class="gal g-filmstrip rv">
                    <div class="g-track" style="--n: {{ count($photos) }}">
                        @foreach ([false, true] as $dup)
                            @foreach ($photos as $i => $img)
                                <a href="{{ $m($img) }}" class="g-item" data-lightbox data-index="{{ $i }}" @if ($dup) data-dup aria-hidden="true" tabindex="-1" @endif><img src="{{ $m($img) }}" alt="Foto {{ $i + 1 }}" loading="lazy"></a>
                            @endforeach
                        @endforeach
                    </div>
                </div>
            @else
                <div class="gal g-{{ $gStyle }}">
                    @foreach ($photos as $i => $img)
                        <a href="{{ $m($img) }}" class="g-item rv" data-lightbox data-index="{{ $i }}" style="--tilt: {{ $tilts[$i % 6] }}deg; transition-delay: {{ ($i % 4) * 90 }}ms">
                            <img src="{{ $m($img) }}" alt="Foto {{ $i + 1 }} {{ $invitation->coupleName() }}" loading="lazy">
                            @if ($gStyle === 'polaroid')<span class="g-cap">{{ $invitation->groom_nickname }} &amp; {{ $invitation->bride_nickname }}</span>@endif
                        </a>
                    @endforeach
                </div>
            @endif
        </section>
    @endif

    <section id="rsvp" class="sec rsvp">
        <p class="eyebrow rv">RSVP</p>
        <h2 class="title rv">Ucapan &amp; Doa</h2>
        <form id="wishForm" class="card rv" data-url="{{ $isPreview ? '' : route('invitation.wish', $invitation) }}">
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
            <button class="btn" type="submit">Kirim</button>
            <p class="form-msg" hidden></p>
        </form>
        <div id="wishList" class="wishes rv">
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
        <section id="gift" class="sec gift">
            <p class="eyebrow rv">Wedding Gift</p>
            <h2 class="title rv">Tanda Kasih</h2>
            <p class="intro rv">Doa restu Anda merupakan karunia yang sangat berarti. Namun jika memberi adalah ungkapan tanda kasih, Anda dapat memberi kado secara cashless.</p>
            @foreach ($invitation->gifts ?? [] as $g)
                <div class="card gift-card rv">
                    <b class="bank">{{ $g['bank'] ?? '' }}</b>
                    <p class="acc">{{ $g['number'] ?? '' }}</p>
                    <p>a.n. {{ $g['holder'] ?? '' }}</p>
                    <button type="button" class="btn btn-sm" data-copy="{{ $g['number'] ?? '' }}">Salin No. Rekening</button>
                </div>
            @endforeach
            @if ($invitation->gift_address)
                <div class="card gift-card rv">
                    <b class="bank">Kirim Kado</b>
                    <p>{{ $invitation->gift_address }}</p>
                    <button type="button" class="btn btn-sm" data-copy="{{ $invitation->gift_address }}">Salin Alamat</button>
                </div>
            @endif
        </section>
    @endif

    <section class="sec closing">
        @include('invitation.ornament', ['type' => $orn, 'class' => 'corner bl'])
        @include('invitation.ornament', ['type' => $orn, 'class' => 'corner br'])
        <p class="intro rv">{{ $invitation->closing_text ?: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.' }}</p>
        <p class="rv">Kami yang berbahagia,</p>
        <h2 class="script big rv">{{ $invitation->groom_nickname }} <span class="amp">&amp;</span> {{ $invitation->bride_nickname }}</h2>
        <footer class="credit">Dibuat dengan ♥ oleh {{ config('app.name') }}</footer>
    </section>
</main>

<nav class="dock" aria-label="Navigasi undangan">
    <a href="#home" title="Beranda"><svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/></svg></a>
    <a href="#couple" title="Mempelai"><svg viewBox="0 0 24 24"><path d="M12 21s-7-4.5-9.5-9A5 5 0 0112 6a5 5 0 019.5 6c-2.5 4.5-9.5 9-9.5 9z"/></svg></a>
    @if ($events)<a href="#event" title="Acara"><svg viewBox="0 0 24 24"><path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4"/></svg></a>@endif
    @if ($invitation->gallery)<a href="#gallery" title="Galeri"><svg viewBox="0 0 24 24"><path d="M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4"/></svg></a>@endif
    <a href="#rsvp" title="Ucapan"><svg viewBox="0 0 24 24"><path d="M4 5h16v11H8l-4 4z"/></svg></a>
    @if ($invitation->gifts || $invitation->gift_address)<a href="#gift" title="Hadiah"><svg viewBox="0 0 24 24"><path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0"/></svg></a>@endif
</nav>

@if ($invitation->music_url)
    <audio id="bgm" src="{{ $invitation->music_url }}" loop preload="none"></audio>
    <button type="button" id="musicBtn" class="music-btn" aria-label="Putar/Jeda musik">
        <svg viewBox="0 0 24 24"><path d="M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zM21 16a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
    </button>
@endif

<div id="lightbox" class="lightbox" hidden>
    <button type="button" class="lb-close" aria-label="Tutup">×</button>
    <button type="button" class="lb-prev" aria-label="Foto sebelumnya">‹</button>
    <img alt="Foto galeri">
    <button type="button" class="lb-next" aria-label="Foto berikutnya">›</button>
    <span class="lb-count"></span>
</div>
<div id="toast" class="toast" hidden></div>

<script>
    window.INVITATION = {!! json_encode($jsConfig, JSON_HEX_TAG | JSON_UNESCAPED_SLASHES) !!};
</script>
<script src="{{ asset('js/invitation.js') }}?v={{ filemtime(public_path('js/invitation.js')) }}"></script>
</body>
</html>

{{-- Ornamen sudut (posisi kiri-atas, dicerminkan via CSS untuk sudut lain). Warna mengikuti currentColor. --}}
<svg class="orn {{ $class ?? '' }}" viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
@switch($type)
    @case('baroque')
        <path d="M8 8C60 8 92 28 100 68c5 26-20 36-31 21-8-12 5-24 15-15"/>
        <path d="M8 8c0 52 20 84 60 92 26 5 36-20 21-31-12-8-24 5-15 15"/>
        <path d="M8 40c22 2 34 14 36 36M40 8c2 22 14 34 36 36"/>
        <path d="M120 20c18 4 30 0 46-10M20 120c4 18 0 30-10 46"/>
        <circle cx="30" cy="30" r="6"/><circle cx="30" cy="30" r="2" fill="currentColor"/>
        <path d="M150 14c6 6 14 6 20 0-6-6-14-6-20 0zM14 150c6 6 6 14 0 20-6-6-6-14 0-20z" fill="currentColor" opacity=".5"/>
        @break
    @case('floral')
        <g transform="translate(42 42)">
            @foreach ([0, 72, 144, 216, 288] as $deg)
                <ellipse rx="10" ry="20" cy="-18" transform="rotate({{ $deg }})" fill="currentColor" opacity=".25"/>
                <ellipse rx="10" ry="20" cy="-18" transform="rotate({{ $deg }})"/>
            @endforeach
            <circle r="6" fill="currentColor"/>
        </g>
        <path d="M70 30c30-10 60-8 100 6M30 70c-10 30-8 60 6 100"/>
        <path d="M100 26c6-12 18-14 26-8-8 10-18 12-26 8zM140 32c8-10 20-10 26-2-10 8-20 8-26 2zM26 100c-12 6-14 18-8 26 10-8 12-18 8-26zM32 140c-10 8-10 20-2 26 8-10 8-20 2-26z" fill="currentColor" opacity=".4"/>
        @break
    @case('leaves')
        <path d="M6 6c50 20 100 40 180 50M6 6c20 50 40 100 50 180"/>
        @foreach ([[40,18,20],[80,32,15],[120,42,10],[160,50,5],[18,40,70],[32,80,75],[42,120,80],[50,160,85]] as [$x,$y,$r])
            <ellipse cx="{{ $x }}" cy="{{ $y }}" rx="14" ry="6" transform="rotate({{ $r }} {{ $x }} {{ $y }})" fill="currentColor" opacity=".35"/>
            <ellipse cx="{{ $x }}" cy="{{ $y }}" rx="14" ry="6" transform="rotate({{ $r }} {{ $x }} {{ $y }})"/>
        @endforeach
        @break
    @case('geometric')
        <g transform="translate(44 44)">
            <rect x="-26" y="-26" width="52" height="52"/>
            <rect x="-26" y="-26" width="52" height="52" transform="rotate(45)"/>
            <circle r="14"/><circle r="4" fill="currentColor"/>
        </g>
        <path d="M90 10h100M10 90v100M90 22h70M22 90v70"/>
        <path d="M100 10l10 10-10 10-10-10zM10 100l10 10-10 10-10-10z" fill="currentColor" opacity=".4"/>
        @break
    @case('line')
        <path d="M10 190V10h180M22 160V22h138"/>
        <path d="M22 22l10 10" /><rect x="6" y="6" width="8" height="8" transform="rotate(45 10 10)" fill="currentColor"/>
        @break
    @case('pampas')
        @foreach ([[10,160,120,40],[10,120,150,20],[40,180,170,70]] as [$x1,$y1,$x2,$y2])
            <path d="M{{ $x1 }} {{ $y1 }}Q{{ ($x1+$x2)/2 - 20 }} {{ ($y1+$y2)/2 - 20 }} {{ $x2 }} {{ $y2 }}"/>
            @for ($i = 1; $i < 9; $i++)
                @php($px = $x1 + ($x2 - $x1) * $i / 9 - 10 * sin($i)) @php($py = $y1 + ($y2 - $y1) * $i / 9 - 12)
                <path d="M{{ $px }} {{ $py }}l-8 -10M{{ $px }} {{ $py }}l10 -6" opacity=".6"/>
            @endfor
        @endforeach
        @break
    @case('monstera')
        <path d="M0 0C80 0 150 40 160 100 120 120 60 110 30 80 10 60 0 30 0 0z" fill="currentColor" opacity=".3"/>
        <path d="M0 0C80 0 150 40 160 100M0 0c30 30 70 60 160 100M40 20l-10 30M80 36l-16 36M115 58l-18 36" stroke-width="2"/>
        <path d="M0 0c0 80 40 130 90 150-10-50-30-90-90-150z" fill="currentColor" opacity=".2"/>
        @break
    @case('filigree')
        <path d="M10 10c40 0 60 20 60 46 0 18-22 22-28 8-4-10 6-18 14-12"/>
        <path d="M10 10c0 40 20 60 46 60 18 0 22-22 8-28-10-4-18 6-12 14"/>
        <path d="M70 30c30-6 60 0 80 20M30 70c-6 30 0 60 20 80" stroke-dasharray="2 6"/>
        <circle cx="160" cy="56" r="4"/><circle cx="56" cy="160" r="4"/>
        @break
    @case('snowflake')
        <g transform="translate(46 46)">
            @foreach ([0, 60, 120] as $deg)
                <g transform="rotate({{ $deg }})"><path d="M-34 0h68M-24 0l-8-8M-24 0l-8 8M24 0l8-8M24 0l8 8M-12 0l-6-6M-12 0l-6 6M12 0l6-6M12 0l6 6"/></g>
            @endforeach
        </g>
        <circle cx="120" cy="20" r="3" fill="currentColor"/><circle cx="20" cy="120" r="3" fill="currentColor"/><circle cx="150" cy="40" r="2" fill="currentColor"/>
        @break
    @case('sun')
        <circle cx="0" cy="0" r="50" fill="currentColor" opacity=".25"/><circle cx="0" cy="0" r="50"/>
        @foreach (range(0, 90, 15) as $deg)
            <line x1="62" y1="0" x2="{{ $deg % 30 ? 110 : 140 }}" y2="0" transform="rotate({{ $deg }})"/>
        @endforeach
        @break
    @case('deco')
        @foreach ([40, 70, 100, 130] as $r)
            <path d="M{{ $r }} 0A{{ $r }} {{ $r }} 0 0 1 0 {{ $r }}"/>
        @endforeach
        @foreach (range(10, 80, 14) as $deg)
            <line x1="40" y1="0" x2="130" y2="0" transform="rotate({{ $deg }})" opacity=".6"/>
        @endforeach
        <path d="M150 6h44M6 150v44M160 14h30M14 160v30"/>
        @break
    @case('hearts')
        @foreach ([[30,30,1.4],[80,20,.8],[20,80,.8],[120,30,.6],[30,120,.6],[70,70,1]] as [$x,$y,$s])
            <path transform="translate({{ $x }} {{ $y }}) scale({{ $s }})" d="M0 6C-4-4-18-2-16 8c2 8 12 14 16 18 4-4 14-10 16-18 2-10-12-12-16-2z" fill="currentColor" opacity=".35"/>
        @endforeach
        <path d="M100 10c30 10 60 4 90-6M10 100c10 30 4 60-6 90" stroke-dasharray="4 6"/>
        @break
    @case('batik')
        @foreach ([[30,30],[80,30],[30,80],[80,80],[130,30],[30,130]] as [$x,$y])
            <g transform="translate({{ $x }} {{ $y }})">
                <ellipse rx="8" ry="16" cy="-12" fill="currentColor" opacity=".3"/><ellipse rx="8" ry="16" cy="12" fill="currentColor" opacity=".3"/>
                <ellipse rx="16" ry="8" cx="-12" fill="currentColor" opacity=".3"/><ellipse rx="16" ry="8" cx="12" fill="currentColor" opacity=".3"/>
                <circle r="3" fill="currentColor"/>
            </g>
        @endforeach
        <path d="M4 4h192M4 4v192M4 12h180M12 4v180"/>
        @break
    @case('kawung')
        {{-- Bingkai ganda bergerigi tumpal + motif kawung di sudut + sulur --}}
        <path d="M4 4h192M4 4v192M14 14h170M14 14v170"/>
        @foreach (range(30, 170, 20) as $v)
            <path d="M{{ $v - 8 }} 14l8 12 8-12M14 {{ $v - 8 }}l12 8-12 8" fill="currentColor" opacity=".35"/>
        @endforeach
        <g transform="translate(52 52) rotate(45)">
            @foreach ([[0, -15], [15, 0], [0, 15], [-15, 0]] as [$x, $y])
                <ellipse cx="{{ $x }}" cy="{{ $y }}" rx="{{ $x ? 13 : 7 }}" ry="{{ $x ? 7 : 13 }}" fill="currentColor" opacity=".3"/>
                <ellipse cx="{{ $x }}" cy="{{ $y }}" rx="{{ $x ? 13 : 7 }}" ry="{{ $x ? 7 : 13 }}"/>
                <circle cx="{{ $x * 1.25 }}" cy="{{ $y * 1.25 }}" r="1.6" fill="currentColor"/>
            @endforeach
            <path d="M0-4L4 0 0 4-4 0z" fill="currentColor"/>
        </g>
        <path d="M84 40c14-10 30-6 34 6 3 10-8 16-14 9-4-5 1-11 6-8M40 84c-10 14-6 30 6 34 10 3 16-8 9-14-5-4-11 1-8 6"/>
        <path d="M120 34c10 2 20-2 28-10M34 120c2 10-2 20-10 28" opacity=".7"/>
        @break
    @case('moon')
        <path d="M70 20a40 40 0 1 0 40 56 32 32 0 1 1-40-56z" fill="currentColor" opacity=".3"/>
        <path d="M70 20a40 40 0 1 0 40 56 32 32 0 1 1-40-56z"/>
        @foreach ([[140,30],[160,80],[30,150],[110,130]] as [$x,$y])
            <path transform="translate({{ $x }} {{ $y }})" d="M0-8L2-2 8 0 2 2 0 8-2 2-8 0-2-2z" fill="currentColor"/>
        @endforeach
        @break
    @case('watercolor')
        <g stroke="none">
            <circle cx="30" cy="40" r="45" fill="currentColor" opacity=".18"/>
            <circle cx="70" cy="20" r="35" fill="currentColor" opacity=".14"/>
            <circle cx="20" cy="90" r="30" fill="currentColor" opacity=".12"/>
            <circle cx="60" cy="60" r="20" fill="currentColor" opacity=".2"/>
        </g>
        @break
    @case('cloud')
        <path d="M10 60c0-20 24-26 34-12 4-18 30-20 36-2 16-6 28 6 22 20H14"/>
        <path d="M44 48c-6 8 2 16 8 10M80 46c-4 10 6 14 10 8"/>
        <path d="M60 110c0-16 20-20 28-10 4-14 24-16 28-2 12-4 22 4 18 16H62" opacity=".7"/>
        <path d="M4 4h70M4 4v70" stroke-width="3"/>
        @break
    @case('grid')
        @foreach (range(0, 200, 25) as $v)
            <line x1="{{ $v }}" y1="0" x2="0" y2="{{ 200 - $v }}" opacity=".35"/>
        @endforeach
        <path d="M0 0h120M0 0v120" stroke-width="3"/>
        @break
    @case('paper')
        <g stroke="none">
            <path d="M0 0h140L0 140z" fill="currentColor" opacity=".25"/>
            <path d="M0 0h90L0 90z" fill="currentColor" opacity=".35"/>
            <path d="M0 0h50L0 50z" fill="currentColor" opacity=".5"/>
        </g>
        @break
    @case('stars')
        @foreach ([[30,30,1.6],[90,20,.8],[20,90,.8],[140,40,.6],[50,140,.6],[70,70,1]] as [$x,$y,$s])
            <path transform="translate({{ $x }} {{ $y }}) scale({{ $s }})" d="M0-12L3-3 12 0 3 3 0 12-3 3-12 0-3-3z" fill="currentColor"/>
        @endforeach
        @break
    @case('wave')
        @foreach ([0, 14, 28, 42] as $o)
            <path d="M0 {{ 20 + $o }}c25-16 50 16 75 0s50-16 75 0 50 16 75 0" opacity="{{ 1 - $o / 60 }}"/>
        @endforeach
        @break
    @case('rings')
        <circle cx="40" cy="44" r="22"/><circle cx="64" cy="44" r="22"/>
        <path d="M52 16l-6-8h12zM52 16l-4 4h8z" fill="currentColor"/>
        <path d="M100 14c30 4 60 0 90-8M14 100c4 30 0 60-8 90"/>
        @break
    @default
        <path d="M10 190V10h180"/>
@endswitch
</svg>

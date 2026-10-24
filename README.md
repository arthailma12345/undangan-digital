# Undangan Digital — Laravel 10 + PostgreSQL

Platform undangan pernikahan online dengan **30 template dinamis**. Setiap template punya
**animasi pembuka unik**, **efek partikel latar unik**, gaya reveal, layout sampul, ornamen,
palet warna, dan font sendiri — semuanya bisa diatur dari panel admin tanpa menyentuh kode.

## Instalasi

```bash
composer install
cp .env.example .env        # lalu isi DB_PASSWORD PostgreSQL
php artisan key:generate
```

Buat database di PostgreSQL:

```sql
CREATE DATABASE undangan_digital;
```

```bash
php artisan migrate --seed
php artisan storage:link
php artisan serve            # atau buka http://undangan-digital.test di Laragon
```

Login admin: **admin@undangan.test** / **password**

> PHP harus memiliki ekstensi `pdo_pgsql` (sudah aktif di PHP 8.1 Laragon).

## Fitur

| Publik | Admin |
|---|---|
| Galeri 30 template + filter kategori | Dashboard statistik |
| Preview template dengan data contoh | CRUD undangan (repeater acara, kisah cinta, rekening) |
| Undangan: sampul + nama tamu personal | Upload foto sampul, mempelai, galeri, musik |
| Countdown, simpan ke Google Calendar | Daftar tamu + import massal + link WhatsApp personal |
| Profil mempelai, acara, peta Google Maps | Status tamu sudah membuka undangan |
| Kisah cinta (timeline), galeri + lightbox | Moderasi ucapan / RSVP |
| RSVP + buku ucapan (AJAX, rate-limited) | Atur warna, font, animasi tiap template |
| Amplop digital (salin no. rekening) | Aktif/nonaktifkan template |
| Musik latar, navigasi dock, panel desktop | |

## Galeri Foto Pengantin

Foto pre-wedding diunggah di form undangan (bagian **7. Galeri Foto**, bisa banyak sekaligus).
Tampilannya mengikuti gaya galeri template, dan bisa diganti di **Admin → Template → Atur**:

| Gaya | Tampilan | Dipakai template |
|---|---|---|
| `mosaic` | Grid dengan foto utama besar | Royal Gold, Javanese, Minimalist, Navy, Sage, Oriental, Classic White |
| `polaroid` | Foto berbingkai polaroid miring + selotip | Sakura, Rustic, Lavender, Boho, Garden Party, Paper Craft |
| `carousel` | Slider geser + tombol + titik + autoplay | Emerald, Ocean, Rose Gold, Winter, Cherry, Celestial, Burgundy |
| `filmstrip` | Pita film berjalan otomatis | Vintage, Golden Hour, Gatsby, Neon |
| `masonry` | Kolom bertingkat (Pinterest) | Midnight, Islamic, Tropical, Bali, Watercolor, Aurora |

Klik foto untuk membuka lightbox (tombol ‹ ›, geser di HP, panah keyboard, Esc).
Preview template memakai 8 foto contoh di `public/images/demo/`.

## URL

| URL | Keterangan |
|---|---|
| `/` | Galeri template |
| `/preview/{template}?to=Nama` | Preview template |
| `/u/{slug}` | Undangan (umum), bisa ditambah `?to=Nama+Tamu` |
| `/u/{slug}/{kode-tamu}` | Undangan personal (tercatat saat dibuka) |
| `/admin` | Panel admin |

## Daftar 30 Template

| # | Template | Animasi Pembuka | Efek Latar | Reveal |
|---|---|---|---|---|
| 1 | Royal Gold | royal-doors (pintu istana 3D) | gold-dust | fade-up |
| 2 | Sakura Bloom | petal-burst (ledakan kelopak) | sakura | zoom |
| 3 | Rustic Barn | book-cover (sampul buku) | autumn-leaves | slide-left |
| 4 | Emerald Garden | silk-curtain (tirai sutra) | fireflies | blur |
| 5 | Ocean Breeze | tide-wave (ombak surut) | bubbles | fade-up |
| 6 | Midnight Star | iris-close (iris kamera) | shooting-stars | zoom-out |
| 7 | Javanese Heritage | gebyok-shutters (daun jendela) | jasmine (melati) | flip |
| 8 | Islamic Noor | lantern-glow (cahaya lentera) | sky-lanterns | rise |
| 9 | Lavender Dream | accordion-fold (lipat akordeon) | butterflies | blur |
| 10 | Minimalist Mono | venetian-blinds (kerai) | floating-rings | mask-up |
| 11 | Boho Terracotta | diagonal-wipe | feathers | rotate |
| 12 | Rose Gold Luxe | light-bloom (kilatan cahaya) | bokeh | zoom |
| 13 | Tropical Paradise | split-diagonal | confetti | slide-right |
| 14 | Vintage Sepia | scroll-roll (gulungan surat) | film-dust | fade |
| 15 | Winter Snow | ice-shatter (pecah es) | snow | blur |
| 16 | Golden Hour | swing-drop (papan berayun) | sun-rays | fade-up |
| 17 | Navy Classic | cube-turn (kubus 3D) | rising-diamonds | slide-right |
| 18 | Gatsby Deco | zoom-through | sequins | flip |
| 19 | Garden Party | envelope (amplop terbuka) | dandelion | fade-up |
| 20 | Cherry Love | heart-wipe (hati membesar) | hearts | zoom |
| 21 | Bali Heritage | temple-gate (candi bentar) | frangipani | rise |
| 22 | Celestial Moon | eclipse (gerhana) | constellation | blur |
| 23 | Watercolor Blue | ink-spread (tinta menyebar) | ink-ripples | fade |
| 24 | Sage Greenery | skew-slide | eucalyptus | slide-left |
| 25 | Burgundy Velvet | theater-rise (tirai panggung) | rose-petals | zoom-out |
| 26 | Oriental Red | side-scroll (lukisan gulung) | fireworks | rise |
| 27 | Neon Modern | glitch (TV mati) | neon-shapes | skew |
| 28 | Paper Craft | tile-flip (ubin berbalik) | paper-planes | flip |
| 29 | Aurora North | evaporate (menguap) | aurora | blur |
| 30 | Classic White | spiral (pusaran) | twinkle | fade-up |

## Struktur Penting

```
config/themes.php                         definisi 30 template (sumber seeder)
app/Models/Template.php                   settings jsonb, CSS variables, URL Google Fonts
app/Models/Invitation.php                 data undangan + data demo untuk preview
resources/views/invitation/show.blade.php satu view dinamis untuk semua template
resources/views/invitation/ornament.blade.php  21 ornamen SVG
public/js/invitation.js                   30 animasi pembuka + 30 efek canvas
public/css/invitation.css                 layout sampul & gaya reveal
```

### Menambah template baru

1. Tambahkan entri baru di `config/themes.php` (boleh memakai animasi yang sudah ada).
2. Untuk animasi baru: tambah fungsi di objek `OPENERS` / `AMBIENT` di `public/js/invitation.js`.
3. Jalankan `php artisan db:seed --class=TemplateSeeder`.

Catatan: panel admin & galeri memakai Tailwind via CDN (tanpa build step). Halaman undangan
sepenuhnya CSS/JS murni tanpa dependensi. Animasi otomatis dimatikan jika pengguna
mengaktifkan *reduce motion*.

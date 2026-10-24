<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Invitation extends Model
{
    protected $guarded = ['id', 'user_id', 'view_count'];

    protected $casts = [
        'event_date' => 'datetime',
        'events' => 'array',
        'love_stories' => 'array',
        'gallery' => 'array',
        'gifts' => 'array',
        'is_published' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }

    public function guests(): HasMany
    {
        return $this->hasMany(Guest::class);
    }

    public function wishes(): HasMany
    {
        return $this->hasMany(Wish::class)->latest();
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function coupleName(): string
    {
        return $this->groom_nickname.' & '.$this->bride_nickname;
    }

    /** URL file: mendukung path storage lokal maupun URL penuh. */
    public static function media(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        return Str::startsWith($path, ['http://', 'https://', '/']) ? $path : Storage::url($path);
    }

    public function publicUrl(?Guest $guest = null): string
    {
        return $guest
            ? route('invitation.guest', [$this->slug, $guest->code])
            : route('invitation.show', $this->slug);
    }

    /** Data contoh untuk preview template tanpa menyimpan ke database. */
    public static function demo(Template $template): self
    {
        $date = Carbon::now()->addDays(45)->setTime(8, 0);

        $inv = new self([
            'slug' => 'preview-'.$template->slug,
            'groom_nickname' => 'Arya',
            'groom_name' => 'Arya Pratama Wijaya, S.T.',
            'groom_father' => 'Bapak H. Bambang Wijaya',
            'groom_mother' => 'Ibu Hj. Sri Lestari',
            'groom_child_order' => 'Putra pertama dari',
            'groom_instagram' => 'aryapratama',
            'bride_nickname' => 'Nadia',
            'bride_name' => 'Nadia Putri Maharani, S.Ked.',
            'bride_father' => 'Bapak Ir. Hendra Gunawan',
            'bride_mother' => 'Ibu Ratna Dewi',
            'bride_child_order' => 'Putri kedua dari',
            'bride_instagram' => 'nadiaputri',
            'event_date' => $date,
            'events' => [
                ['name' => 'Akad Nikah', 'date' => $date->toDateString(), 'start_time' => '08:00', 'end_time' => '10:00',
                    'venue' => 'Masjid Agung Al-Azhar', 'address' => 'Jl. Sisingamangaraja, Kebayoran Baru, Jakarta Selatan', 'maps_url' => 'https://maps.google.com/?q=Masjid+Agung+Al-Azhar'],
                ['name' => 'Resepsi', 'date' => $date->toDateString(), 'start_time' => '11:00', 'end_time' => '14:00',
                    'venue' => 'Gedung Serbaguna Graha Cempaka', 'address' => 'Jl. Cempaka Putih Raya No. 12, Jakarta Pusat', 'maps_url' => 'https://maps.google.com/?q=Cempaka+Putih+Jakarta'],
            ],
            'quote' => 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang.',
            'quote_source' => 'QS. Ar-Rum: 21',
            'love_stories' => [
                ['year' => '2019', 'title' => 'Pertama Bertemu', 'story' => 'Kami pertama kali bertemu di sebuah acara kampus. Sebuah percakapan singkat yang ternyata menjadi awal segalanya.'],
                ['year' => '2022', 'title' => 'Menjalin Kasih', 'story' => 'Setelah bertahun-tahun bersahabat, kami memutuskan untuk melangkah bersama.'],
                ['year' => '2026', 'title' => 'Lamaran', 'story' => 'Dengan restu kedua keluarga, kami bertunangan dan sepakat menuju jenjang pernikahan.'],
            ],
            'gallery' => array_map(fn ($n) => "/images/demo/prewedding-$n.svg", range(1, 8)),
            'gifts' => [
                ['bank' => 'BCA', 'number' => '1234567890', 'holder' => 'Arya Pratama Wijaya'],
                ['bank' => 'Mandiri', 'number' => '0987654321', 'holder' => 'Nadia Putri Maharani'],
            ],
            'gift_address' => 'Jl. Melati No. 8, Kebayoran Baru, Jakarta Selatan 12110',
            'closing_text' => 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.',
        ]);
        $inv->setRelation('template', $template);
        $inv->setRelation('wishes', collect([
            new Wish(['name' => 'Rina & Keluarga', 'attendance' => 'hadir', 'message' => 'Selamat menempuh hidup baru! Semoga menjadi keluarga sakinah, mawaddah, warahmah.', 'created_at' => now()->subHours(3)]),
            new Wish(['name' => 'Budi Santoso', 'attendance' => 'ragu', 'message' => 'Barakallahu lakuma wa baraka alaikuma. Bahagia selalu!', 'created_at' => now()->subDay()]),
        ]));

        return $inv;
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Guest extends Model
{
    protected $fillable = ['invitation_id', 'name', 'code', 'phone', 'group', 'opened_at'];

    protected $casts = ['opened_at' => 'datetime'];

    protected static function booted(): void
    {
        static::creating(function (Guest $guest) {
            if (! $guest->code) {
                do {
                    $code = Str::lower(Str::random(8));
                } while (static::where('code', $code)->exists());
                $guest->code = $code;
            }
        });
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class);
    }

    /** Link WhatsApp berisi pesan undangan personal. */
    public function whatsappUrl(): string
    {
        $inv = $this->invitation;
        $text = "Kepada Yth.\n*{$this->name}*\n\nTanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami:\n\n*{$inv->coupleName()}*\n\nInfo lengkap acara:\n{$inv->publicUrl($this)}\n\nMerupakan kebahagiaan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.\n\nTerima kasih.";
        $phone = preg_replace('/\D/', '', (string) $this->phone);
        if (Str::startsWith($phone, '0')) {
            $phone = '62'.substr($phone, 1);
        }

        return 'https://wa.me/'.$phone.'?text='.rawurlencode($text);
    }
}

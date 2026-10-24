<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Template extends Model
{
    protected $fillable = ['name', 'slug', 'category', 'description', 'settings', 'is_active', 'sort_order'];

    protected $casts = [
        'settings' => 'array',
        'is_active' => 'boolean',
    ];

    /** Bobot font Google yang tersedia, supaya request Google Fonts tidak gagal. */
    public const FONT_WEIGHTS = [
        'Cinzel' => 'wght@400;600;700',
        'Cinzel Decorative' => 'wght@400;700',
        'Cormorant Garamond' => 'ital,wght@0,400;0,600;0,700;1,400',
        'Playfair Display' => 'ital,wght@0,400;0,600;0,700;1,400',
        'Lora' => 'ital,wght@0,400;0,600;1,400',
        'Montserrat' => 'wght@300;400;600',
        'Poppins' => 'wght@300;400;600',
        'Josefin Sans' => 'wght@300;400;600',
        'Raleway' => 'wght@300;400;600',
        'Quicksand' => 'wght@400;600',
        'Nunito' => 'wght@400;600;700',
        'El Messiri' => 'wght@400;600',
        'Bodoni Moda' => 'wght@400;600',
        'Libre Baskerville' => 'ital,wght@0,400;0,700;1,400',
        'EB Garamond' => 'ital,wght@0,400;0,600;1,400',
        'Fraunces' => 'wght@400;600',
        'Syne' => 'wght@400;600;700',
        'Philosopher' => 'wght@400;700',
        'Amiri' => 'wght@400;700',
    ];

    public const FONT_CHOICES = [
        'script' => ['Great Vibes', 'Parisienne', 'Sacramento', 'Pinyon Script', 'Dancing Script', 'Allura', 'Alex Brush', 'Italianno', 'Tangerine', 'Monsieur La Doulaise', 'Amiri'],
        'heading' => ['Cinzel', 'Cinzel Decorative', 'Playfair Display', 'Cormorant Garamond', 'Yeseva One', 'Josefin Sans', 'El Messiri', 'Bodoni Moda', 'Fraunces', 'DM Serif Display', 'Libre Baskerville', 'Poiret One', 'Syne'],
        'body' => ['Lora', 'Cormorant Garamond', 'Raleway', 'Quicksand', 'Marcellus', 'Montserrat', 'Josefin Sans', 'Poppins', 'EB Garamond', 'Nunito', 'Philosopher'],
    ];

    public function invitations(): HasMany
    {
        return $this->hasMany(Invitation::class);
    }

    public function scopeActive(Builder $q): Builder
    {
        return $q->where('is_active', true);
    }

    public function setting(string $key, $default = null)
    {
        return data_get($this->settings, $key, $default);
    }

    /** Pilihan unik per jenis (opening/ambient/dll) diambil dari config/themes.php */
    public static function options(string $key): array
    {
        return collect(config('themes'))->pluck($key)->unique()->sort()->values()->all();
    }

    /** View undangan: layout "game" memakai halaman permainan, selain itu halaman standar. */
    public function viewName(): string
    {
        return $this->setting('layout') === 'game' ? 'invitation.game' : 'invitation.show';
    }

    public function googleFontsUrl(): string
    {
        $families = collect($this->setting('fonts', []))->unique()->map(function ($font) {
            $spec = str_replace(' ', '+', $font);
            $weights = self::FONT_WEIGHTS[$font] ?? null;

            return 'family='.$spec.($weights ? ':'.$weights : '');
        })->implode('&');

        return 'https://fonts.googleapis.com/css2?'.$families.'&display=swap';
    }

    public function cssVariables(): string
    {
        $c = $this->setting('colors', []);
        $f = $this->setting('fonts', []);

        $vars = [
            '--bg' => $c['bg'] ?? '#fff',
            '--surface' => $c['surface'] ?? '#fff',
            '--primary' => $c['primary'] ?? '#b49b6b',
            '--accent' => $c['accent'] ?? '#ece3d1',
            '--text' => $c['text'] ?? '#333',
            '--muted' => $c['muted'] ?? '#888',
            '--font-script' => "'".($f['script'] ?? 'Great Vibes')."', cursive",
            '--font-heading' => "'".($f['heading'] ?? 'Cinzel')."', serif",
            '--font-body' => "'".($f['body'] ?? 'Lora')."', serif",
        ];

        return collect($vars)->map(fn ($v, $k) => "$k: $v;")->implode(' ');
    }
}

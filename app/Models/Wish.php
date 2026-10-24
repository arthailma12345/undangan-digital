<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Wish extends Model
{
    protected $fillable = ['invitation_id', 'guest_id', 'name', 'attendance', 'pax', 'message', 'created_at'];

    public const ATTENDANCE = [
        'hadir' => 'Hadir',
        'tidak' => 'Tidak Hadir',
        'ragu' => 'Masih Ragu',
    ];

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class);
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class);
    }

    public function attendanceLabel(): string
    {
        return self::ATTENDANCE[$this->attendance] ?? $this->attendance;
    }
}

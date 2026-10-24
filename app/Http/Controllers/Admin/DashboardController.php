<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Guest;
use App\Models\Invitation;
use App\Models\Template;
use App\Models\Wish;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $invitationIds = Invitation::where('user_id', $request->user()->id)->pluck('id');

        return view('admin.dashboard', [
            'stats' => [
                'Undangan' => $invitationIds->count(),
                'Template Aktif' => Template::active()->count(),
                'Tamu' => Guest::whereIn('invitation_id', $invitationIds)->count(),
                'Ucapan / RSVP' => Wish::whereIn('invitation_id', $invitationIds)->count(),
                'Konfirmasi Hadir' => Wish::whereIn('invitation_id', $invitationIds)->where('attendance', 'hadir')->sum('pax'),
                'Total Dilihat' => Invitation::whereIn('id', $invitationIds)->sum('view_count'),
            ],
            'latestWishes' => Wish::with('invitation')->whereIn('invitation_id', $invitationIds)->latest()->limit(8)->get(),
            'invitations' => Invitation::with('template')->whereIn('id', $invitationIds)->latest()->limit(5)->get(),
        ]);
    }
}

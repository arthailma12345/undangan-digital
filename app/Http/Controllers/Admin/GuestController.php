<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Guest;
use App\Models\Invitation;
use Illuminate\Http\Request;

class GuestController extends Controller
{
    public function store(Request $request, Invitation $invitation)
    {
        abort_unless($invitation->user_id === $request->user()->id, 403);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'phone' => ['nullable', 'string', 'max:20'],
            'group' => ['nullable', 'string', 'max:50'],
        ]);
        $invitation->guests()->create($data);

        return back()->with('success', 'Tamu ditambahkan.');
    }

    /** Tambah banyak tamu sekaligus: satu baris = "Nama" atau "Nama, 0812xxxx" */
    public function bulk(Request $request, Invitation $invitation)
    {
        abort_unless($invitation->user_id === $request->user()->id, 403);

        $request->validate(['names' => ['required', 'string', 'max:20000']]);

        $count = 0;
        foreach (preg_split('/\r\n|\r|\n/', $request->names) as $line) {
            [$name, $phone] = array_pad(array_map('trim', explode(',', $line, 2)), 2, null);
            if ($name !== '') {
                $invitation->guests()->create(['name' => mb_substr($name, 0, 150), 'phone' => $phone ? mb_substr($phone, 0, 20) : null]);
                $count++;
            }
        }

        return back()->with('success', "$count tamu ditambahkan.");
    }

    public function destroy(Request $request, Guest $guest)
    {
        abort_unless($guest->invitation->user_id === $request->user()->id, 403);
        $guest->delete();

        return back()->with('success', 'Tamu dihapus.');
    }
}

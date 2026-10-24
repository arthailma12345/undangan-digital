<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Wish;
use Illuminate\Http\Request;

class WishController extends Controller
{
    public function destroy(Request $request, Wish $wish)
    {
        abort_unless($wish->invitation->user_id === $request->user()->id, 403);
        $wish->delete();

        return back()->with('success', 'Ucapan dihapus.');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Guest;
use App\Models\Invitation;
use App\Models\Wish;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class InvitationController extends Controller
{
    public function show(Request $request, Invitation $invitation, ?string $code = null)
    {
        abort_unless($invitation->is_published || $request->user()?->id === $invitation->user_id, 404);

        $guest = null;
        if ($code) {
            $guest = Guest::where('invitation_id', $invitation->id)->where('code', $code)->firstOrFail();
            $guest->opened_at ??= now();
            $guest->save();
        }

        $invitation->increment('view_count');
        $invitation->load(['template', 'wishes' => fn ($q) => $q->limit(50)]);

        return view($invitation->template->viewName(), [
            'invitation' => $invitation,
            'template' => $invitation->template,
            'guestName' => $guest?->name ?? $request->query('to', 'Tamu Undangan'),
            'guest' => $guest,
            'isPreview' => false,
        ]);
    }

    public function storeWish(Request $request, Invitation $invitation)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'attendance' => ['required', Rule::in(array_keys(Wish::ATTENDANCE))],
            'pax' => ['nullable', 'integer', 'min:1', 'max:10'],
            'message' => ['nullable', 'string', 'max:1000'],
            'guest_code' => ['nullable', 'string'],
        ]);

        $guestId = ! empty($data['guest_code'])
            ? Guest::where('invitation_id', $invitation->id)->where('code', $data['guest_code'])->value('id')
            : null;

        $wish = $invitation->wishes()->create([
            'guest_id' => $guestId,
            'name' => strip_tags($data['name']),
            'attendance' => $data['attendance'],
            'pax' => $data['pax'] ?? 1,
            'message' => strip_tags($data['message'] ?? ''),
        ]);

        return response()->json([
            'name' => e($wish->name),
            'attendance' => $wish->attendanceLabel(),
            'message' => e($wish->message),
            'time' => $wish->created_at->diffForHumans(),
        ]);
    }
}

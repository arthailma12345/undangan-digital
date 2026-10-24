<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invitation;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class InvitationController extends Controller
{
    public function index(Request $request)
    {
        $invitations = Invitation::with('template')
            ->withCount(['guests', 'wishes'])
            ->where('user_id', $request->user()->id)
            ->when($request->q, fn ($q, $s) => $q->where(fn ($w) => $w
                ->where('groom_nickname', 'ilike', "%$s%")
                ->orWhere('bride_nickname', 'ilike', "%$s%")
                ->orWhere('slug', 'ilike', "%$s%")))
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return view('admin.invitations.index', compact('invitations'));
    }

    public function create(Request $request)
    {
        $invitation = new Invitation([
            'template_id' => $request->query('template'),
            'event_date' => now()->addMonth()->setTime(8, 0),
            'events' => [['name' => 'Akad Nikah'], ['name' => 'Resepsi']],
            'love_stories' => [],
            'gifts' => [],
            'is_published' => true,
        ]);

        return view('admin.invitations.form', $this->formData($invitation));
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $data = $this->handleUploads($request, $data, new Invitation());

        $invitation = new Invitation($data);
        $invitation->user_id = $request->user()->id;
        $invitation->save();

        return redirect()->route('admin.invitations.show', $invitation)->with('success', 'Undangan berhasil dibuat.');
    }

    public function show(Request $request, Invitation $invitation)
    {
        $this->authorizeOwner($request, $invitation);
        $invitation->load(['template', 'guests' => fn ($q) => $q->latest(), 'wishes.guest']);
        $invitation->guests->each->setRelation('invitation', $invitation);

        $summary = [
            'hadir' => $invitation->wishes->where('attendance', 'hadir')->sum('pax'),
            'tidak' => $invitation->wishes->where('attendance', 'tidak')->count(),
            'ragu' => $invitation->wishes->where('attendance', 'ragu')->count(),
            'dibuka' => $invitation->guests->whereNotNull('opened_at')->count(),
        ];

        return view('admin.invitations.show', compact('invitation', 'summary'));
    }

    public function edit(Request $request, Invitation $invitation)
    {
        $this->authorizeOwner($request, $invitation);

        return view('admin.invitations.form', $this->formData($invitation));
    }

    public function update(Request $request, Invitation $invitation)
    {
        $this->authorizeOwner($request, $invitation);

        $data = $this->validated($request, $invitation);
        $data = $this->handleUploads($request, $data, $invitation);
        $invitation->update($data);

        return redirect()->route('admin.invitations.show', $invitation)->with('success', 'Undangan berhasil diperbarui.');
    }

    public function destroy(Request $request, Invitation $invitation)
    {
        $this->authorizeOwner($request, $invitation);

        $files = array_filter(array_merge(
            [$invitation->cover_photo, $invitation->groom_photo, $invitation->bride_photo],
            $invitation->gallery ?? []
        ));
        Storage::disk('public')->delete($files);
        $invitation->delete();

        return redirect()->route('admin.invitations.index')->with('success', 'Undangan dihapus.');
    }

    private function formData(Invitation $invitation): array
    {
        return [
            'invitation' => $invitation,
            'templates' => Template::active()->orderBy('sort_order')->get(),
        ];
    }

    private function authorizeOwner(Request $request, Invitation $invitation): void
    {
        abort_unless($invitation->user_id === $request->user()->id, 403);
    }

    private function validated(Request $request, ?Invitation $invitation = null): array
    {
        $request->merge(['slug' => Str::slug($request->input('slug') ?: $request->groom_nickname.'-'.$request->bride_nickname)]);

        $data = $request->validate([
            'template_id' => ['required', 'exists:templates,id'],
            'slug' => ['required', 'max:100', Rule::unique('invitations', 'slug')->ignore($invitation?->id)],
            'title' => ['nullable', 'string', 'max:150'],
            'groom_nickname' => ['required', 'string', 'max:50'],
            'groom_name' => ['required', 'string', 'max:150'],
            'groom_father' => ['nullable', 'string', 'max:150'],
            'groom_mother' => ['nullable', 'string', 'max:150'],
            'groom_child_order' => ['nullable', 'string', 'max:50'],
            'groom_instagram' => ['nullable', 'string', 'max:50'],
            'bride_nickname' => ['required', 'string', 'max:50'],
            'bride_name' => ['required', 'string', 'max:150'],
            'bride_father' => ['nullable', 'string', 'max:150'],
            'bride_mother' => ['nullable', 'string', 'max:150'],
            'bride_child_order' => ['nullable', 'string', 'max:50'],
            'bride_instagram' => ['nullable', 'string', 'max:50'],
            'event_date' => ['required', 'date'],
            'events' => ['nullable', 'array'],
            'events.*.name' => ['nullable', 'string', 'max:100'],
            'events.*.date' => ['nullable', 'date'],
            'events.*.start_time' => ['nullable', 'string', 'max:10'],
            'events.*.end_time' => ['nullable', 'string', 'max:20'],
            'events.*.venue' => ['nullable', 'string', 'max:150'],
            'events.*.address' => ['nullable', 'string', 'max:300'],
            'events.*.maps_url' => ['nullable', 'url', 'max:500'],
            'quote' => ['nullable', 'string', 'max:1000'],
            'quote_source' => ['nullable', 'string', 'max:100'],
            'love_stories' => ['nullable', 'array'],
            'love_stories.*.year' => ['nullable', 'string', 'max:20'],
            'love_stories.*.title' => ['nullable', 'string', 'max:100'],
            'love_stories.*.story' => ['nullable', 'string', 'max:1000'],
            'gifts' => ['nullable', 'array'],
            'gifts.*.bank' => ['nullable', 'string', 'max:50'],
            'gifts.*.number' => ['nullable', 'string', 'max:50'],
            'gifts.*.holder' => ['nullable', 'string', 'max:100'],
            'gift_address' => ['nullable', 'string', 'max:500'],
            'music_url' => ['nullable', 'url', 'max:500'],
            'livestream_url' => ['nullable', 'url', 'max:500'],
            'closing_text' => ['nullable', 'string', 'max:1000'],
            'cover_photo_file' => ['nullable', 'image', 'max:4096'],
            'groom_photo_file' => ['nullable', 'image', 'max:4096'],
            'bride_photo_file' => ['nullable', 'image', 'max:4096'],
            'music_file' => ['nullable', 'file', 'mimes:mp3,ogg,m4a', 'max:12288'],
            'gallery_files' => ['nullable', 'array', 'max:20'],
            'gallery_files.*' => ['image', 'max:4096'],
            'remove_gallery' => ['nullable', 'array'],
        ]);

        // Buang baris repeater yang kosong
        $data['events'] = $this->cleanRows($data['events'] ?? [], 'name');
        $data['love_stories'] = $this->cleanRows($data['love_stories'] ?? [], 'title');
        $data['gifts'] = $this->cleanRows($data['gifts'] ?? [], 'number');
        $data['is_published'] = $request->boolean('is_published');

        return $data;
    }

    private function cleanRows(array $rows, string $requiredKey): array
    {
        return array_values(array_filter($rows, fn ($r) => filled($r[$requiredKey] ?? null)));
    }

    private function handleUploads(Request $request, array $data, Invitation $invitation): array
    {
        $dir = 'invitations/'.$data['slug'];

        foreach (['cover_photo', 'groom_photo', 'bride_photo'] as $field) {
            if ($request->hasFile($field.'_file')) {
                if ($invitation->$field) {
                    Storage::disk('public')->delete($invitation->$field);
                }
                $data[$field] = $request->file($field.'_file')->store($dir, 'public');
            }
        }

        if ($request->hasFile('music_file')) {
            $data['music_url'] = Storage::url($request->file('music_file')->store($dir, 'public'));
        }

        $gallery = $invitation->gallery ?? [];
        $remove = array_values(array_intersect($data['remove_gallery'] ?? [], $gallery));
        if ($remove) {
            Storage::disk('public')->delete($remove);
            $gallery = array_values(array_diff($gallery, $remove));
        }
        foreach ($request->file('gallery_files', []) as $file) {
            $gallery[] = $file->store($dir.'/gallery', 'public');
        }
        $data['gallery'] = $gallery;

        unset($data['cover_photo_file'], $data['groom_photo_file'], $data['bride_photo_file'],
            $data['music_file'], $data['gallery_files'], $data['remove_gallery']);

        return $data;
    }
}

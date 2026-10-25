<?php

namespace Database\Seeders;

use App\Models\Guest;
use App\Models\Invitation;
use App\Models\Template;
use App\Models\User;
use App\Models\Wish;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(TemplateSeeder::class);

        $admin = User::updateOrCreate(
            ['email' => 'admin@undangan.test'],
            ['name' => 'Administrator', 'password' => Hash::make('arthailma12345')]
        );

        // Undangan contoh
        $template = Template::where('slug', 'royal-gold')->first();
        $demo = Invitation::demo($template);
        $data = collect($demo->attributesToArray())->except(['slug'])->all();

        $invitation = Invitation::firstOrNew(['slug' => 'putra-nadia']);
        $invitation->fill(array_merge($data, [
            'template_id' => $template->id,
            'title' => 'Pernikahan Putra & Nadia',
            'event_date' => $demo->event_date,
        ]));
        $invitation->user_id = $admin->id;
        $invitation->save();

        if ($invitation->guests()->count() === 0) {
            foreach (['Bapak Ahmad Fauzi', 'Ibu Siti Aminah', 'Keluarga Besar Santoso', 'Rekan Kantor PT Maju Jaya'] as $name) {
                $invitation->guests()->create(['name' => $name, 'phone' => '081234567890', 'group' => 'Tamu']);
            }
            Wish::create(['invitation_id' => $invitation->id, 'name' => 'Rina & Keluarga', 'attendance' => 'hadir', 'pax' => 3,
                'message' => 'Selamat menempuh hidup baru! Semoga menjadi keluarga sakinah, mawaddah, warahmah.']);
        }
    }
}

<?php

namespace Database\Seeders;

use App\Models\Template;
use Illuminate\Database\Seeder;

class TemplateSeeder extends Seeder
{
    public function run(): void
    {
        foreach (config('themes') as $i => $theme) {
            Template::updateOrCreate(
                ['slug' => $theme['slug']],
                [
                    'name' => $theme['name'],
                    'category' => $theme['category'],
                    'description' => sprintf(
                        'Tema %s dengan animasi pembuka "%s" dan efek latar "%s".',
                        $theme['name'], $theme['opening'], $theme['ambient']
                    ),
                    'settings' => collect($theme)->except(['slug', 'name', 'category'])->all(),
                    'is_active' => true,
                    'sort_order' => $i + 1,
                ]
            );
        }
    }
}

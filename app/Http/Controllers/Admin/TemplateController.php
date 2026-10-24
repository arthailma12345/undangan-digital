<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TemplateController extends Controller
{
    public function index()
    {
        return view('admin.templates.index', [
            'templates' => Template::withCount('invitations')->orderBy('sort_order')->get(),
        ]);
    }

    public function edit(Template $template)
    {
        return view('admin.templates.edit', [
            'template' => $template,
            'options' => collect(['opening', 'ambient', 'reveal', 'cover', 'ornament', 'gallery'])
                ->mapWithKeys(fn ($k) => [$k => Template::options($k)]),
            'fontChoices' => Template::FONT_CHOICES,
        ]);
    }

    public function update(Request $request, Template $template)
    {
        $hex = ['required', 'regex:/^#[0-9a-fA-F]{6}$/'];
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'category' => ['required', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:500'],
            'sort_order' => ['required', 'integer', 'min:0'],
            'colors.*' => $hex,
            'fonts.script' => ['required', 'string', 'max:60'],
            'fonts.heading' => ['required', 'string', 'max:60'],
            'fonts.body' => ['required', 'string', 'max:60'],
            'opening' => ['required', Rule::in(Template::options('opening'))],
            'ambient' => ['required', Rule::in(Template::options('ambient'))],
            'reveal' => ['required', Rule::in(Template::options('reveal'))],
            'cover' => ['required', Rule::in(Template::options('cover'))],
            'ornament' => ['required', Rule::in(Template::options('ornament'))],
            'gallery' => ['required', Rule::in(Template::options('gallery'))],
        ]);

        $template->update([
            'name' => $data['name'],
            'category' => $data['category'],
            'description' => $data['description'] ?? null,
            'sort_order' => $data['sort_order'],
            'settings' => [
                'dark' => $request->boolean('dark'),
                'colors' => $data['colors'],
                'fonts' => $data['fonts'],
                'opening' => $data['opening'],
                'ambient' => $data['ambient'],
                'reveal' => $data['reveal'],
                'cover' => $data['cover'],
                'ornament' => $data['ornament'],
                'gallery' => $data['gallery'],
            ] + array_filter(['layout' => $template->setting('layout')]),
        ]);

        return redirect()->route('admin.templates.index')->with('success', "Template {$template->name} diperbarui.");
    }

    public function toggle(Template $template)
    {
        $template->update(['is_active' => ! $template->is_active]);

        return back()->with('success', "Template {$template->name} ".($template->is_active ? 'diaktifkan' : 'dinonaktifkan').'.');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use App\Models\Template;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        $templates = Template::active()->orderBy('sort_order')->get();
        $categories = $templates->pluck('category')->unique()->sort()->values();

        return view('home', compact('templates', 'categories'));
    }

    public function preview(Request $request, Template $template)
    {
        abort_unless($template->is_active || auth()->check(), 404);

        return view($template->viewName(), [
            'invitation' => Invitation::demo($template),
            'template' => $template,
            'guestName' => $request->query('to', 'Tamu Undangan'),
            'guest' => null,
            'isPreview' => true,
        ]);
    }
}

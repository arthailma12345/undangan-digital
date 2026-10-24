<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\GuestController;
use App\Http\Controllers\Admin\InvitationController as AdminInvitationController;
use App\Http\Controllers\Admin\TemplateController;
use App\Http\Controllers\Admin\WishController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\InvitationController;
use Illuminate\Support\Facades\Route;

// Publik
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/preview/{template:slug}', [HomeController::class, 'preview'])->name('template.preview');

Route::get('/u/{invitation}', [InvitationController::class, 'show'])->name('invitation.show');
Route::get('/u/{invitation}/{code}', [InvitationController::class, 'show'])->name('invitation.guest');
Route::post('/u/{invitation}/wishes', [InvitationController::class, 'storeWish'])
    ->middleware('throttle:10,1')->name('invitation.wish');

// Auth
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');

// Admin
Route::prefix('admin')->name('admin.')->middleware('auth')->group(function () {
    Route::get('/', DashboardController::class)->name('dashboard');

    Route::get('templates', [TemplateController::class, 'index'])->name('templates.index');
    Route::get('templates/{template}/edit', [TemplateController::class, 'edit'])->name('templates.edit');
    Route::put('templates/{template}', [TemplateController::class, 'update'])->name('templates.update');
    Route::patch('templates/{template}/toggle', [TemplateController::class, 'toggle'])->name('templates.toggle');

    Route::resource('invitations', AdminInvitationController::class);

    Route::post('invitations/{invitation}/guests', [GuestController::class, 'store'])->name('guests.store');
    Route::post('invitations/{invitation}/guests/bulk', [GuestController::class, 'bulk'])->name('guests.bulk');
    Route::delete('guests/{guest}', [GuestController::class, 'destroy'])->name('guests.destroy');

    Route::delete('wishes/{wish}', [WishController::class, 'destroy'])->name('wishes.destroy');
});

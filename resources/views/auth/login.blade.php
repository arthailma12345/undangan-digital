<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Masuk · {{ config('app.name') }}</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Plus+Jakarta+Sans:wght@400;600;800&display=swap">
    <script src="https://cdn.tailwindcss.com/3.4.16"></script>
    <style>body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }</style>
</head>
<body class="min-h-screen grid place-items-center bg-gradient-to-br from-rose-50 via-white to-amber-50 p-4">
<form method="POST" action="{{ route('login') }}" class="w-full max-w-sm bg-white rounded-3xl shadow-xl shadow-rose-100 p-8 space-y-4">
    @csrf
    <div class="text-center">
        <p style="font-family: 'Great Vibes', cursive" class="text-5xl text-rose-500">Undangan</p>
        <p class="text-sm text-stone-500 mt-1">Masuk ke panel admin</p>
    </div>
    @error('email')<p class="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{{ $message }}</p>@enderror
    <label class="block text-sm font-semibold">Email
        <input type="email" name="email" value="{{ old('email', 'admin@undangan.test') }}" required autofocus class="mt-1 w-full border rounded-xl px-3 py-2 font-normal">
    </label>
    <label class="block text-sm font-semibold">Password
        <input type="password" name="password" required class="mt-1 w-full border rounded-xl px-3 py-2 font-normal">
    </label>
    <label class="flex items-center gap-2 text-sm"><input type="checkbox" name="remember"> Ingat saya</label>
    <button class="w-full bg-stone-900 text-white rounded-xl py-2.5 font-semibold hover:bg-stone-700">Masuk</button>
    <a href="{{ route('home') }}" class="block text-center text-sm text-stone-500">← Kembali ke galeri template</a>
</form>
</body>
</html>

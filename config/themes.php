<?php

/*
|--------------------------------------------------------------------------
| Definisi 30 Template Undangan
|--------------------------------------------------------------------------
| Setiap template memiliki kombinasi unik:
|  - opening : animasi saat tombol "Buka Undangan" ditekan (30 animasi berbeda)
|  - ambient : efek partikel latar berjalan (30 efek berbeda, canvas)
|  - reveal  : gaya animasi kemunculan section saat di-scroll
|  - cover   : tata letak halaman sampul (arch, circle, frame, full, split, minimal)
|  - ornament: ornamen SVG dekoratif
|  - gallery : gaya galeri foto (masonry, carousel, polaroid, filmstrip, mosaic)
| Nilai di sini dipakai TemplateSeeder untuk mengisi tabel `templates`.
| Setelah di-seed, semua setting bisa diubah lewat panel admin (dinamis).
*/

return [
    ['slug' => 'royal-gold', 'name' => 'Royal Gold', 'category' => 'Luxury', 'dark' => true,
        'colors' => ['bg' => '#0f0d0a', 'surface' => '#1b1711', 'primary' => '#d4af37', 'accent' => '#f5e6b3', 'text' => '#f7f1e3', 'muted' => '#b8a98a'],
        'fonts' => ['script' => 'Great Vibes', 'heading' => 'Cinzel', 'body' => 'Cormorant Garamond'],
        'ornament' => 'baroque', 'cover' => 'arch', 'opening' => 'royal-doors', 'ambient' => 'gold-dust', 'reveal' => 'fade-up', 'gallery' => 'mosaic'],

    ['slug' => 'sakura-bloom', 'name' => 'Sakura Bloom', 'category' => 'Floral', 'dark' => false,
        'colors' => ['bg' => '#fff5f7', 'surface' => '#ffffff', 'primary' => '#d9668a', 'accent' => '#f9c5d5', 'text' => '#5a3a44', 'muted' => '#9a7a84'],
        'fonts' => ['script' => 'Parisienne', 'heading' => 'Playfair Display', 'body' => 'Lora'],
        'ornament' => 'floral', 'cover' => 'circle', 'opening' => 'petal-burst', 'ambient' => 'sakura', 'reveal' => 'zoom', 'gallery' => 'polaroid'],

    ['slug' => 'rustic-barn', 'name' => 'Rustic Barn', 'category' => 'Rustic', 'dark' => false,
        'colors' => ['bg' => '#f4ece1', 'surface' => '#fffaf3', 'primary' => '#8b5e3c', 'accent' => '#c9a27e', 'text' => '#3e2c1f', 'muted' => '#7d6a58'],
        'fonts' => ['script' => 'Sacramento', 'heading' => 'Yeseva One', 'body' => 'Lora'],
        'ornament' => 'leaves', 'cover' => 'frame', 'opening' => 'book-cover', 'ambient' => 'autumn-leaves', 'reveal' => 'slide-left', 'gallery' => 'polaroid'],

    ['slug' => 'emerald-garden', 'name' => 'Emerald Garden', 'category' => 'Elegant', 'dark' => true,
        'colors' => ['bg' => '#0d2b23', 'surface' => '#12372d', 'primary' => '#c8a96a', 'accent' => '#7fbf9f', 'text' => '#eef5f0', 'muted' => '#a7c2b5'],
        'fonts' => ['script' => 'Pinyon Script', 'heading' => 'Cormorant Garamond', 'body' => 'Lora'],
        'ornament' => 'leaves', 'cover' => 'arch', 'opening' => 'silk-curtain', 'ambient' => 'fireflies', 'reveal' => 'blur', 'gallery' => 'carousel'],

    ['slug' => 'ocean-breeze', 'name' => 'Ocean Breeze', 'category' => 'Beach', 'dark' => false,
        'colors' => ['bg' => '#eaf6f8', 'surface' => '#ffffff', 'primary' => '#2a7f9e', 'accent' => '#9fd8e5', 'text' => '#1f3d4a', 'muted' => '#5f8796'],
        'fonts' => ['script' => 'Dancing Script', 'heading' => 'Josefin Sans', 'body' => 'Quicksand'],
        'ornament' => 'wave', 'cover' => 'full', 'opening' => 'tide-wave', 'ambient' => 'bubbles', 'reveal' => 'fade-up', 'gallery' => 'carousel'],

    ['slug' => 'midnight-star', 'name' => 'Midnight Star', 'category' => 'Celestial', 'dark' => true,
        'colors' => ['bg' => '#0b1026', 'surface' => '#141a3a', 'primary' => '#c9d6ff', 'accent' => '#f3d27a', 'text' => '#e8ecff', 'muted' => '#8f9ac4'],
        'fonts' => ['script' => 'Allura', 'heading' => 'Cinzel', 'body' => 'Raleway'],
        'ornament' => 'stars', 'cover' => 'circle', 'opening' => 'iris-close', 'ambient' => 'shooting-stars', 'reveal' => 'zoom-out', 'gallery' => 'masonry'],

    ['slug' => 'javanese-heritage', 'name' => 'Javanese Heritage', 'category' => 'Adat', 'dark' => true,
        'colors' => ['bg' => '#2a1a0e', 'surface' => '#3a2516', 'primary' => '#d9a441', 'accent' => '#9c2a1d', 'text' => '#f6ead2', 'muted' => '#c7ab83'],
        'fonts' => ['script' => 'Pinyon Script', 'heading' => 'Cinzel Decorative', 'body' => 'Marcellus'],
        'ornament' => 'batik', 'cover' => 'frame', 'opening' => 'gebyok-shutters', 'ambient' => 'jasmine', 'reveal' => 'flip', 'gallery' => 'mosaic'],

    ['slug' => 'islamic-noor', 'name' => 'Islamic Noor', 'category' => 'Islami', 'dark' => false,
        'colors' => ['bg' => '#f6f3ea', 'surface' => '#ffffff', 'primary' => '#1f6f5c', 'accent' => '#c9a24b', 'text' => '#24332e', 'muted' => '#6c7f78'],
        'fonts' => ['script' => 'Amiri', 'heading' => 'El Messiri', 'body' => 'Lora'],
        'ornament' => 'geometric', 'cover' => 'arch', 'opening' => 'lantern-glow', 'ambient' => 'sky-lanterns', 'reveal' => 'rise', 'gallery' => 'masonry'],

    ['slug' => 'lavender-dream', 'name' => 'Lavender Dream', 'category' => 'Floral', 'dark' => false,
        'colors' => ['bg' => '#f3effa', 'surface' => '#ffffff', 'primary' => '#7e62b3', 'accent' => '#d6c8f0', 'text' => '#3e3456', 'muted' => '#857ba0'],
        'fonts' => ['script' => 'Alex Brush', 'heading' => 'Cormorant Garamond', 'body' => 'Raleway'],
        'ornament' => 'floral', 'cover' => 'circle', 'opening' => 'accordion-fold', 'ambient' => 'butterflies', 'reveal' => 'blur', 'gallery' => 'polaroid'],

    ['slug' => 'minimalist-mono', 'name' => 'Minimalist Mono', 'category' => 'Minimalis', 'dark' => false,
        'colors' => ['bg' => '#fafafa', 'surface' => '#ffffff', 'primary' => '#111111', 'accent' => '#d4d4d4', 'text' => '#1a1a1a', 'muted' => '#777777'],
        'fonts' => ['script' => 'Italianno', 'heading' => 'Bodoni Moda', 'body' => 'Montserrat'],
        'ornament' => 'line', 'cover' => 'minimal', 'opening' => 'venetian-blinds', 'ambient' => 'floating-rings', 'reveal' => 'mask-up', 'gallery' => 'mosaic'],

    ['slug' => 'boho-terracotta', 'name' => 'Boho Terracotta', 'category' => 'Boho', 'dark' => false,
        'colors' => ['bg' => '#f6ede4', 'surface' => '#fffaf5', 'primary' => '#c0673e', 'accent' => '#e7b58f', 'text' => '#4a2f22', 'muted' => '#93715f'],
        'fonts' => ['script' => 'Sacramento', 'heading' => 'Fraunces', 'body' => 'Josefin Sans'],
        'ornament' => 'pampas', 'cover' => 'arch', 'opening' => 'diagonal-wipe', 'ambient' => 'feathers', 'reveal' => 'rotate', 'gallery' => 'polaroid'],

    ['slug' => 'rose-gold-luxe', 'name' => 'Rose Gold Luxe', 'category' => 'Luxury', 'dark' => false,
        'colors' => ['bg' => '#fbf1ee', 'surface' => '#ffffff', 'primary' => '#b76e79', 'accent' => '#e8c3b9', 'text' => '#4b2e33', 'muted' => '#9a7479'],
        'fonts' => ['script' => 'Great Vibes', 'heading' => 'Playfair Display', 'body' => 'Raleway'],
        'ornament' => 'floral', 'cover' => 'frame', 'opening' => 'light-bloom', 'ambient' => 'bokeh', 'reveal' => 'zoom', 'gallery' => 'carousel'],

    ['slug' => 'tropical-paradise', 'name' => 'Tropical Paradise', 'category' => 'Beach', 'dark' => false,
        'colors' => ['bg' => '#fffbf0', 'surface' => '#ffffff', 'primary' => '#0f8b6d', 'accent' => '#ff8a5b', 'text' => '#23413a', 'muted' => '#5f7d75'],
        'fonts' => ['script' => 'Dancing Script', 'heading' => 'DM Serif Display', 'body' => 'Poppins'],
        'ornament' => 'monstera', 'cover' => 'split', 'opening' => 'split-diagonal', 'ambient' => 'confetti', 'reveal' => 'slide-right', 'gallery' => 'masonry'],

    ['slug' => 'vintage-sepia', 'name' => 'Vintage Sepia', 'category' => 'Vintage', 'dark' => false,
        'colors' => ['bg' => '#efe6d6', 'surface' => '#f8f1e4', 'primary' => '#6b4f36', 'accent' => '#b89a6a', 'text' => '#3a2c20', 'muted' => '#7f6b55'],
        'fonts' => ['script' => 'Monsieur La Doulaise', 'heading' => 'Playfair Display', 'body' => 'EB Garamond'],
        'ornament' => 'filigree', 'cover' => 'frame', 'opening' => 'scroll-roll', 'ambient' => 'film-dust', 'reveal' => 'fade', 'gallery' => 'filmstrip'],

    ['slug' => 'winter-snow', 'name' => 'Winter Snow', 'category' => 'Elegant', 'dark' => false,
        'colors' => ['bg' => '#eef4fa', 'surface' => '#ffffff', 'primary' => '#5b7fa6', 'accent' => '#cfe0f1', 'text' => '#2c3e52', 'muted' => '#71859b'],
        'fonts' => ['script' => 'Tangerine', 'heading' => 'Cinzel', 'body' => 'Raleway'],
        'ornament' => 'snowflake', 'cover' => 'circle', 'opening' => 'ice-shatter', 'ambient' => 'snow', 'reveal' => 'blur', 'gallery' => 'carousel'],

    ['slug' => 'golden-hour', 'name' => 'Golden Hour', 'category' => 'Sunset', 'dark' => true,
        'colors' => ['bg' => '#2d1b3d', 'surface' => '#3b2550', 'primary' => '#f4a259', 'accent' => '#f5cba7', 'text' => '#fff3e6', 'muted' => '#d6b9c4'],
        'fonts' => ['script' => 'Allura', 'heading' => 'Playfair Display', 'body' => 'Quicksand'],
        'ornament' => 'sun', 'cover' => 'full', 'opening' => 'swing-drop', 'ambient' => 'sun-rays', 'reveal' => 'fade-up', 'gallery' => 'filmstrip'],

    ['slug' => 'navy-classic', 'name' => 'Navy Classic', 'category' => 'Klasik', 'dark' => true,
        'colors' => ['bg' => '#0f1c2e', 'surface' => '#16263d', 'primary' => '#c5a572', 'accent' => '#8fa3bf', 'text' => '#f1ede4', 'muted' => '#9fb0c6'],
        'fonts' => ['script' => 'Pinyon Script', 'heading' => 'Libre Baskerville', 'body' => 'Raleway'],
        'ornament' => 'deco', 'cover' => 'frame', 'opening' => 'cube-turn', 'ambient' => 'rising-diamonds', 'reveal' => 'slide-right', 'gallery' => 'mosaic'],

    ['slug' => 'gatsby-deco', 'name' => 'Gatsby Deco', 'category' => 'Luxury', 'dark' => true,
        'colors' => ['bg' => '#0a0a0a', 'surface' => '#151515', 'primary' => '#e6c068', 'accent' => '#5a4a26', 'text' => '#f4e9cf', 'muted' => '#a89a78'],
        'fonts' => ['script' => 'Italianno', 'heading' => 'Poiret One', 'body' => 'Josefin Sans'],
        'ornament' => 'deco', 'cover' => 'arch', 'opening' => 'zoom-through', 'ambient' => 'sequins', 'reveal' => 'flip', 'gallery' => 'filmstrip'],

    ['slug' => 'garden-party', 'name' => 'Garden Party', 'category' => 'Floral', 'dark' => false,
        'colors' => ['bg' => '#fdfaf3', 'surface' => '#ffffff', 'primary' => '#6f9a69', 'accent' => '#f2b5c4', 'text' => '#3d4a3a', 'muted' => '#7b8a77'],
        'fonts' => ['script' => 'Parisienne', 'heading' => 'Cormorant Garamond', 'body' => 'Nunito'],
        'ornament' => 'floral', 'cover' => 'circle', 'opening' => 'envelope', 'ambient' => 'dandelion', 'reveal' => 'fade-up', 'gallery' => 'polaroid'],

    ['slug' => 'cherry-love', 'name' => 'Cherry Love', 'category' => 'Romantic', 'dark' => false,
        'colors' => ['bg' => '#fff7f5', 'surface' => '#ffffff', 'primary' => '#a4161a', 'accent' => '#e5989b', 'text' => '#3b1214', 'muted' => '#8a5a5c'],
        'fonts' => ['script' => 'Great Vibes', 'heading' => 'DM Serif Display', 'body' => 'Lora'],
        'ornament' => 'hearts', 'cover' => 'circle', 'opening' => 'heart-wipe', 'ambient' => 'hearts', 'reveal' => 'zoom', 'gallery' => 'carousel'],

    ['slug' => 'bali-heritage', 'name' => 'Bali Heritage', 'category' => 'Adat', 'dark' => true,
        'colors' => ['bg' => '#1e2b1a', 'surface' => '#283a23', 'primary' => '#e2b13c', 'accent' => '#c2452d', 'text' => '#f5ecd9', 'muted' => '#b9b38f'],
        'fonts' => ['script' => 'Pinyon Script', 'heading' => 'Cinzel Decorative', 'body' => 'Marcellus'],
        'ornament' => 'batik', 'cover' => 'arch', 'opening' => 'temple-gate', 'ambient' => 'frangipani', 'reveal' => 'rise', 'gallery' => 'masonry'],

    ['slug' => 'celestial-moon', 'name' => 'Celestial Moon', 'category' => 'Celestial', 'dark' => true,
        'colors' => ['bg' => '#10132b', 'surface' => '#1a1e3d', 'primary' => '#e9e4c9', 'accent' => '#8e7cc3', 'text' => '#eceaf6', 'muted' => '#9d99bd'],
        'fonts' => ['script' => 'Tangerine', 'heading' => 'Cormorant Garamond', 'body' => 'Raleway'],
        'ornament' => 'moon', 'cover' => 'circle', 'opening' => 'eclipse', 'ambient' => 'constellation', 'reveal' => 'blur', 'gallery' => 'carousel'],

    ['slug' => 'watercolor-blue', 'name' => 'Watercolor Blue', 'category' => 'Artistic', 'dark' => false,
        'colors' => ['bg' => '#f5f9fc', 'surface' => '#ffffff', 'primary' => '#4a78a8', 'accent' => '#a9c6e3', 'text' => '#2a3b4f', 'muted' => '#6c8098'],
        'fonts' => ['script' => 'Alex Brush', 'heading' => 'Playfair Display', 'body' => 'Quicksand'],
        'ornament' => 'watercolor', 'cover' => 'full', 'opening' => 'ink-spread', 'ambient' => 'ink-ripples', 'reveal' => 'fade', 'gallery' => 'masonry'],

    ['slug' => 'sage-greenery', 'name' => 'Sage Greenery', 'category' => 'Botanical', 'dark' => false,
        'colors' => ['bg' => '#f3f5ef', 'surface' => '#ffffff', 'primary' => '#6f8160', 'accent' => '#c7d1b5', 'text' => '#33402b', 'muted' => '#76836b'],
        'fonts' => ['script' => 'Sacramento', 'heading' => 'Cormorant Garamond', 'body' => 'Montserrat'],
        'ornament' => 'leaves', 'cover' => 'split', 'opening' => 'skew-slide', 'ambient' => 'eucalyptus', 'reveal' => 'slide-left', 'gallery' => 'mosaic'],

    ['slug' => 'burgundy-velvet', 'name' => 'Burgundy Velvet', 'category' => 'Luxury', 'dark' => true,
        'colors' => ['bg' => '#2b0a12', 'surface' => '#3b0f1a', 'primary' => '#e3b5a4', 'accent' => '#8e2436', 'text' => '#f6e7e4', 'muted' => '#c99a9f'],
        'fonts' => ['script' => 'Great Vibes', 'heading' => 'Playfair Display', 'body' => 'EB Garamond'],
        'ornament' => 'baroque', 'cover' => 'frame', 'opening' => 'theater-rise', 'ambient' => 'rose-petals', 'reveal' => 'zoom-out', 'gallery' => 'carousel'],

    ['slug' => 'oriental-red', 'name' => 'Oriental Red', 'category' => 'Adat', 'dark' => true,
        'colors' => ['bg' => '#7a0a0a', 'surface' => '#8f1414', 'primary' => '#f5c242', 'accent' => '#ffdf8a', 'text' => '#fff6e0', 'muted' => '#f0c9a8'],
        'fonts' => ['script' => 'Italianno', 'heading' => 'Cinzel', 'body' => 'Philosopher'],
        'ornament' => 'cloud', 'cover' => 'circle', 'opening' => 'side-scroll', 'ambient' => 'fireworks', 'reveal' => 'rise', 'gallery' => 'mosaic'],

    ['slug' => 'neon-modern', 'name' => 'Neon Modern', 'category' => 'Modern', 'dark' => true,
        'colors' => ['bg' => '#0d0d14', 'surface' => '#161622', 'primary' => '#ff3cac', 'accent' => '#2bd2ff', 'text' => '#f0f0ff', 'muted' => '#9a9ab8'],
        'fonts' => ['script' => 'Sacramento', 'heading' => 'Syne', 'body' => 'Poppins'],
        'ornament' => 'grid', 'cover' => 'minimal', 'opening' => 'glitch', 'ambient' => 'neon-shapes', 'reveal' => 'skew', 'gallery' => 'filmstrip'],

    ['slug' => 'paper-craft', 'name' => 'Paper Craft', 'category' => 'Playful', 'dark' => false,
        'colors' => ['bg' => '#f7f3ec', 'surface' => '#ffffff', 'primary' => '#e76f51', 'accent' => '#2a9d8f', 'text' => '#264653', 'muted' => '#6b7f86'],
        'fonts' => ['script' => 'Dancing Script', 'heading' => 'Fraunces', 'body' => 'Nunito'],
        'ornament' => 'paper', 'cover' => 'split', 'opening' => 'tile-flip', 'ambient' => 'paper-planes', 'reveal' => 'flip', 'gallery' => 'polaroid'],

    ['slug' => 'aurora-north', 'name' => 'Aurora North', 'category' => 'Celestial', 'dark' => true,
        'colors' => ['bg' => '#061a23', 'surface' => '#0b2733', 'primary' => '#7cf5c8', 'accent' => '#b38cff', 'text' => '#e9fff8', 'muted' => '#8fb8ad'],
        'fonts' => ['script' => 'Allura', 'heading' => 'Josefin Sans', 'body' => 'Raleway'],
        'ornament' => 'stars', 'cover' => 'full', 'opening' => 'evaporate', 'ambient' => 'aurora', 'reveal' => 'blur', 'gallery' => 'masonry'],

    ['slug' => 'classic-white', 'name' => 'Classic White', 'category' => 'Klasik', 'dark' => false,
        'colors' => ['bg' => '#ffffff', 'surface' => '#faf8f4', 'primary' => '#b49b6b', 'accent' => '#ece3d1', 'text' => '#333333', 'muted' => '#888070'],
        'fonts' => ['script' => 'Pinyon Script', 'heading' => 'Cormorant Garamond', 'body' => 'Montserrat'],
        'ornament' => 'rings', 'cover' => 'arch', 'opening' => 'spiral', 'ambient' => 'twinkle', 'reveal' => 'fade-up', 'gallery' => 'mosaic'],

    // Template interaktif: tamu menjelajah desa pixel-art dengan tombol arah (views/invitation/game.blade.php)
    ['slug' => 'desa-bahagia', 'name' => 'Desa Bahagia', 'category' => 'Game', 'dark' => false, 'layout' => 'game',
        'colors' => ['bg' => '#7cc35a', 'surface' => '#fff6dc', 'primary' => '#d94848', 'accent' => '#f4c06a', 'text' => '#3b2412', 'muted' => '#7a5a3a'],
        'fonts' => ['script' => 'Dancing Script', 'heading' => 'Fraunces', 'body' => 'Nunito'],
        'ornament' => 'leaves', 'cover' => 'full', 'opening' => 'farm-sunrise', 'ambient' => 'farm-life', 'reveal' => 'fade-up', 'gallery' => 'polaroid'],
];

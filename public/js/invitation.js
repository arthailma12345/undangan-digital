/* =====================================================================
   Undangan Digital - mesin animasi
   - OPENERS : 30 animasi pembuka unik (satu per template)
   - AMBIENT : 30 efek partikel/latar unik berbasis canvas
   ===================================================================== */
(() => {
    'use strict';

    const CFG = window.INVITATION || {};
    const COL = Object.assign({ primary: '#b49b6b', accent: '#ece3d1', text: '#333', bg: '#fff', muted: '#888' }, CFG.colors);
    const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const rand = (a, b) => a + Math.random() * (b - a);
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const TAU = Math.PI * 2;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const anim = (el, frames, opt = {}) =>
        el.animate(frames, { duration: 1200, fill: 'forwards', easing: 'cubic-bezier(.7,0,.3,1)', ...opt }).finished;

    const tween = (dur, fn, ease = easeInOut) => new Promise((res) => {
        const start = performance.now();
        const step = (now) => {
            const t = Math.min(1, (now - start) / dur);
            fn(ease(t));
            t < 1 ? requestAnimationFrame(step) : res();
        };
        requestAnimationFrame(step);
    });

    const el = (tag, style = '', html = '') => {
        const e = document.createElement(tag);
        e.style.cssText = style;
        if (html) e.innerHTML = html;
        return e;
    };

    const rgba = (hex, a) => {
        const h = hex.replace('#', '');
        const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16);
        return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
    };

    /* ---------- Helper animasi pembuka ---------- */
    const layer = (style = '') => {
        const l = el('div', style);
        l.className = 'fx-layer';
        document.body.appendChild(l);
        return l;
    };

    /** Salin sampul menjadi beberapa kepingan dengan clip-path berbeda. */
    const shards = (cover, clips, layerStyle = '') => {
        const lyr = layer(layerStyle);
        const pieces = clips.map((clip) => {
            const p = cover.cloneNode(true);
            p.removeAttribute('id');
            $$('[id]', p).forEach((n) => n.removeAttribute('id'));
            p.classList.add('fx-piece');
            p.style.position = 'absolute';
            p.style.clipPath = clip;
            lyr.appendChild(p);
            return p;
        });
        cover.style.visibility = 'hidden';
        return { lyr, pieces };
    };

    const grid = (rows, cols) => {
        const out = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const top = (r * 100) / rows, left = (c * 100) / cols;
                out.push({ r, c, clip: `inset(${top}% ${100 - left - 100 / cols}% ${100 - top - 100 / rows}% ${left}%)` });
            }
        }
        return out;
    };

    const content = () => $('#content');

    /* =====================================================================
       30 ANIMASI PEMBUKA
       ===================================================================== */
    const OPENERS = {
        // 1. Pintu istana terbuka dengan cahaya emas dari tengah
        'royal-doors': async (c) => {
            const { lyr, pieces: [l, r] } = shards(c, ['inset(0 50% 0 0)', 'inset(0 0 0 50%)'], 'perspective:1400px');
            const light = el('div', `position:absolute;inset:0;background:radial-gradient(ellipse at center, ${rgba(COL.primary, .55)}, transparent 60%);opacity:0`);
            lyr.prepend(light);
            l.style.transformOrigin = 'left center';
            r.style.transformOrigin = 'right center';
            anim(light, [{ opacity: 0 }, { opacity: 1, offset: 0.4 }, { opacity: 0 }], { duration: 2000 });
            await Promise.all([
                anim(l, [{ transform: 'rotateY(0)' }, { transform: 'rotateY(-105deg)' }], { duration: 1900 }),
                anim(r, [{ transform: 'rotateY(0)' }, { transform: 'rotateY(105deg)' }], { duration: 1900 }),
            ]);
        },

        // 2. Ledakan kelopak bunga dari tengah layar
        'petal-burst': async (c) => {
            const lyr = layer();
            const jobs = [];
            for (let i = 0; i < 46; i++) {
                const size = rand(10, 22);
                const p = el('span', `position:absolute;left:50%;top:50%;width:${size}px;height:${size * 1.4}px;border-radius:80% 0 80% 0;background:${pick([COL.primary, COL.accent])};opacity:.95`);
                lyr.appendChild(p);
                const a = rand(0, TAU), d = rand(30, 75);
                jobs.push(anim(p, [
                    { transform: 'translate(-50%,-50%) scale(.2) rotate(0)', opacity: 1 },
                    { transform: `translate(calc(-50% + ${Math.cos(a) * d}vmax), calc(-50% + ${Math.sin(a) * d}vmax)) scale(1) rotate(${rand(-540, 540)}deg)`, opacity: 0 },
                ], { duration: rand(1300, 1900), easing: 'cubic-bezier(.1,.8,.3,1)' }));
            }
            jobs.push(anim(c, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.15)', opacity: 0 }], { duration: 1000, easing: 'ease-out' }));
            await Promise.all(jobs);
        },

        // 3. Sampul seperti sampul buku yang dibuka ke kiri
        'book-cover': async (c) => {
            c.style.transformOrigin = 'left center';
            c.style.boxShadow = '20px 0 60px rgba(0,0,0,.35)';
            await anim(c, [
                { transform: 'perspective(1600px) rotateY(0)', opacity: 1 },
                { transform: 'perspective(1600px) rotateY(-75deg)', opacity: 1, offset: 0.7 },
                { transform: 'perspective(1600px) rotateY(-110deg)', opacity: 0 },
            ], { duration: 1800 });
        },

        // 4. Tirai sutra tersibak ke kiri-kanan dengan lekukan kain
        'silk-curtain': async (c) => {
            const { pieces: [l, r] } = shards(c, ['inset(0 50% 0 0)', 'inset(0 0 0 50%)']);
            l.style.transformOrigin = 'left center';
            r.style.transformOrigin = 'right center';
            const kf = (s) => [
                { transform: 'translateX(0) scaleX(1) skewY(0)' },
                { transform: `translateX(${s * 25}%) scaleX(.75) skewY(${s * -3}deg)`, offset: 0.5 },
                { transform: `translateX(${s * 60}%) scaleX(.2) skewY(0)` },
            ];
            await Promise.all([anim(l, kf(-1), { duration: 1800 }), anim(r, kf(1), { duration: 1800 })]);
        },

        // 5. Gelombang ombak surut ke atas
        'tide-wave': async (c) => {
            await tween(1900, (t) => {
                const pts = ['0 0', '100% 0'];
                for (let i = 0; i <= 20; i++) {
                    const x = 100 - i * 5;
                    const y = (1 - t) * 112 - 6 + Math.sin(i * 0.7 + t * 14) * 6 * (1 - t * 0.5);
                    pts.push(`${x}% ${y}%`);
                }
                c.style.clipPath = `polygon(${pts.join(',')})`;
            });
        },

        // 6. Iris kamera menutup ke tengah
        'iris-close': async (c) => {
            const ring = el('div', `position:absolute;left:50%;top:50%;width:10px;height:10px;border-radius:50%;box-shadow:0 0 0 2px ${COL.primary},0 0 40px 10px ${rgba(COL.primary, .6)};translate:-50% -50%;opacity:0`);
            const lyr = layer();
            lyr.appendChild(ring);
            anim(ring, [{ opacity: 0, scale: 40 }, { opacity: 1, scale: 1 }, { opacity: 0, scale: 0 }], { duration: 1500 });
            await anim(c, [{ clipPath: 'circle(150% at 50% 50%)' }, { clipPath: 'circle(0% at 50% 50%)' }], { duration: 1400 });
        },

        // 7. Daun jendela gebyok berputar terbuka (bilah vertikal)
        'gebyok-shutters': async (c) => {
            const n = 6;
            const clips = Array.from({ length: n }, (_, i) => `inset(0 ${100 - (i + 1) * 100 / n}% 0 ${i * 100 / n}%)`);
            const { pieces } = shards(c, clips, 'perspective:1200px');
            await Promise.all(pieces.map((p, i) => {
                p.style.transformOrigin = `${(i + 0.5) * 100 / n}% 50%`;
                return anim(p, [{ transform: 'rotateY(0)', opacity: 1 }, { transform: 'rotateY(90deg)', opacity: 0.3 }],
                    { duration: 900, delay: Math.abs(i - (n - 1) / 2) * 160 });
            }));
        },

        // 8. Cahaya lentera membesar dari tengah melubangi sampul
        'lantern-glow': async (c) => {
            const lyr = layer();
            const glow = el('div', `position:absolute;left:50%;top:50%;width:30vmin;height:30vmin;translate:-50% -50%;border-radius:50%;background:radial-gradient(circle, ${rgba(COL.accent, .9)}, transparent 70%)`);
            lyr.appendChild(glow);
            await anim(glow, [{ scale: 0, opacity: 0 }, { scale: 1.2, opacity: 1, offset: 0.6 }, { scale: 1, opacity: 1 }], { duration: 700, easing: 'ease-out' });
            anim(glow, [{ opacity: 1, scale: 1 }, { opacity: 0, scale: 6 }], { duration: 1500 });
            await tween(1500, (t) => {
                const r = t * 120;
                const m = `radial-gradient(circle at 50% 50%, transparent ${r}vmax, #000 ${r + 10}vmax)`;
                c.style.webkitMaskImage = m;
                c.style.maskImage = m;
            });
        },

        // 9. Lipatan akordeon menutup bergantian
        'accordion-fold': async (c) => {
            const n = 5;
            const clips = Array.from({ length: n }, (_, i) => `inset(${i * 100 / n}% 0 ${100 - (i + 1) * 100 / n}% 0)`);
            const { pieces } = shards(c, clips, 'perspective:1000px');
            await Promise.all(pieces.map((p, i) => {
                const edge = i % 2 ? (i + 1) * 100 / n : i * 100 / n;
                p.style.transformOrigin = `50% ${edge}%`;
                return anim(p, [{ transform: 'rotateX(0)', filter: 'brightness(1)' }, { transform: `rotateX(${i % 2 ? 90 : -90}deg)`, filter: 'brightness(.4)' }],
                    { duration: 900, delay: (n - i) * 130 });
            }));
        },

        // 10. Kerai horizontal (venetian blinds) mengatup
        'venetian-blinds': async (c) => {
            const n = 12;
            const clips = Array.from({ length: n }, (_, i) => `inset(${i * 100 / n}% 0 ${100 - (i + 1) * 100 / n}% 0)`);
            const { pieces } = shards(c, clips);
            await Promise.all(pieces.map((p, i) => {
                p.style.transformOrigin = `50% ${(i + 0.5) * 100 / n}%`;
                return anim(p, [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }], { duration: 700, delay: i * 55, easing: 'ease-in' });
            }));
        },

        // 11. Sapuan diagonal dari sudut kanan bawah
        'diagonal-wipe': async (c) => {
            await anim(c, [{ clipPath: 'polygon(0 0, 200% 0, 0 200%)' }, { clipPath: 'polygon(0 0, 0 0, 0 0)' }], { duration: 1400 });
        },

        // 12. Ledakan cahaya putih lalu memudar
        'light-bloom': async (c) => {
            const flash = el('div', 'position:absolute;inset:0;background:#fff;opacity:0');
            layer().appendChild(flash);
            anim(flash, [{ opacity: 0 }, { opacity: 0.95, offset: 0.45 }, { opacity: 0 }], { duration: 1700, easing: 'ease-in-out' });
            await anim(c, [{ filter: 'brightness(1) blur(0)', opacity: 1 }, { filter: 'brightness(2.6) blur(10px)', opacity: 0 }], { duration: 900, easing: 'ease-in' });
            await wait(700);
        },

        // 13. Terbelah diagonal, dua segitiga terlempar
        'split-diagonal': async (c) => {
            const { pieces: [a, b] } = shards(c, ['polygon(0 0,100% 0,0 100%)', 'polygon(100% 0,100% 100%,0 100%)']);
            await Promise.all([
                anim(a, [{ transform: 'none' }, { transform: 'translate(-70%,-70%) rotate(-12deg)' }], { duration: 1500 }),
                anim(b, [{ transform: 'none' }, { transform: 'translate(70%,70%) rotate(12deg)' }], { duration: 1500 }),
            ]);
        },

        // 14. Gulungan surat kuno tergulung ke atas
        'scroll-roll': async (c) => {
            const rod = el('div', `position:absolute;left:0;right:0;top:0;height:22px;border-radius:11px;background:linear-gradient(${COL.primary},${COL.accent},${COL.primary});box-shadow:0 6px 16px rgba(0,0,0,.35)`);
            const lyr = layer();
            lyr.appendChild(rod);
            c.style.transformOrigin = 'top center';
            await anim(c, [
                { transform: 'perspective(1200px) rotateX(0) scaleY(1)' },
                { transform: 'perspective(1200px) rotateX(60deg) scaleY(.3)', offset: 0.7 },
                { transform: 'perspective(1200px) rotateX(90deg) scaleY(0)' },
            ], { duration: 1600 });
            await anim(rod, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-30px)' }], { duration: 500 });
        },

        // 15. Pecah seperti es, kepingan jatuh berguguran
        'ice-shatter': async (c) => {
            await anim(c, [{ transform: 'translate(0)' }, { transform: 'translate(-6px,3px)' }, { transform: 'translate(6px,-3px)' }, { transform: 'translate(0)' }], { duration: 260, fill: 'none' });
            const { pieces } = shards(c, grid(5, 4).map((g) => g.clip));
            await Promise.all(pieces.map((p) => anim(p, [
                { transform: 'none', opacity: 1 },
                { transform: `translate(${rand(-35, 35)}vw, ${rand(70, 130)}vh) rotate(${rand(-140, 140)}deg) scale(.7)`, opacity: 0 },
            ], { duration: rand(1100, 1600), delay: rand(0, 300), easing: 'cubic-bezier(.5,0,.9,.6)' })));
        },

        // 16. Berayun seperti papan tergantung lalu jatuh
        'swing-drop': async (c) => {
            c.style.transformOrigin = 'top left';
            await anim(c, [
                { transform: 'rotate(0)' },
                { transform: 'rotate(14deg)', offset: 0.25 },
                { transform: 'rotate(6deg)', offset: 0.45 },
                { transform: 'rotate(16deg)', offset: 0.6 },
                { transform: 'translateY(130vh) rotate(45deg)' },
            ], { duration: 2100, easing: 'ease-in' });
        },

        // 17. Kubus 3D berputar ke kiri
        'cube-turn': async (c) => {
            const main = content();
            anim(main, [
                { transform: 'perspective(1200px) translateX(100%) rotateY(90deg)', transformOrigin: '0 50%' },
                { transform: 'perspective(1200px) translateX(0) rotateY(0)', transformOrigin: '0 50%' },
            ], { duration: 1300, fill: 'none' });
            await anim(c, [
                { transform: 'perspective(1200px) translateX(0) rotateY(0)', transformOrigin: '100% 50%' },
                { transform: 'perspective(1200px) translateX(-100%) rotateY(-90deg)', transformOrigin: '100% 50%' },
            ], { duration: 1300 });
        },

        // 18. Menembus sampul (zoom melewati pintu)
        'zoom-through': async (c) => {
            anim(content(), [{ transform: 'scale(.7)' }, { transform: 'scale(1)' }], { duration: 1400, fill: 'none', easing: 'ease-out' });
            await anim(c, [{ transform: 'scale(1)', opacity: 1, filter: 'blur(0)' }, { transform: 'scale(5)', opacity: 0, filter: 'blur(12px)' }], { duration: 1300, easing: 'ease-in' });
        },

        // 19. Amplop terbuka dan surat keluar
        'envelope': async (c) => {
            const lyr = layer('display:grid;place-items:center;perspective:1200px');
            const w = Math.min(innerWidth * 0.82, 420), h = w * 0.62;
            const env = el('div', `position:relative;width:${w}px;height:${h}px`);
            const back = el('div', `position:absolute;inset:0;background:${COL.primary};border-radius:8px;box-shadow:0 30px 60px -20px rgba(0,0,0,.5)`);
            const letter = el('div', `position:absolute;left:6%;right:6%;top:8%;height:86%;background:${COL.bg};border-radius:6px;display:grid;place-items:center;font-family:var(--font-script);font-size:${w / 11}px;color:${COL.primary};text-align:center;padding:8px`,
                $('.cover-names')?.innerText.replace(/\n+/g, ' ') || '');
            const front = el('div', `position:absolute;inset:0;background:${rgba(COL.primary, 1)};filter:brightness(.92);clip-path:polygon(0 0,50% 55%,100% 0,100% 100%,0 100%);border-radius:8px`);
            const flap = el('div', `position:absolute;left:0;right:0;top:0;height:60%;background:${COL.primary};filter:brightness(1.08);clip-path:polygon(0 0,100% 0,50% 100%);transform-origin:top;z-index:4`);
            const seal = el('div', `position:absolute;left:50%;top:52%;width:${w / 7}px;height:${w / 7}px;translate:-50% -50%;border-radius:50%;background:${COL.accent};z-index:5;box-shadow:0 2px 6px rgba(0,0,0,.3)`);
            env.append(back, letter, front, flap, seal);
            lyr.appendChild(env);
            await anim(c, [{ opacity: 1 }, { opacity: 0 }], { duration: 400 });
            await anim(env, [{ transform: 'scale(.6)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 500, easing: 'ease-out' });
            await anim(seal, [{ scale: 1 }, { scale: 0 }], { duration: 300 });
            await anim(flap, [{ transform: 'rotateX(0)' }, { transform: 'rotateX(180deg)' }], { duration: 700 });
            flap.style.zIndex = 0;
            await anim(letter, [{ transform: 'translateY(0)' }, { transform: `translateY(-${h * 0.7}px)` }], { duration: 800 });
            await anim(env, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.6)', opacity: 0 }], { duration: 600, easing: 'ease-in' });
        },

        // 20. Hati membesar memenuhi layar lalu memudar
        'heart-wipe': async (c) => {
            const lyr = layer('display:grid;place-items:center');
            const heart = el('div', 'width:60px;height:60px', `<svg viewBox="0 0 24 24" width="60" height="60"><path fill="${COL.primary}" d="M12 21s-7-4.5-9.5-9A5 5 0 0112 6a5 5 0 019.5 6c-2.5 4.5-9.5 9-9.5 9z"/></svg>`);
            lyr.appendChild(heart);
            await anim(heart, [{ transform: 'scale(0)' }, { transform: 'scale(1.4)', offset: 0.2 }, { transform: 'scale(1)', offset: 0.35 }, { transform: 'scale(45)' }], { duration: 1300, easing: 'ease-in' });
            c.style.visibility = 'hidden';
            await anim(lyr, [{ opacity: 1 }, { opacity: 0 }], { duration: 700 });
        },

        // 21. Gerbang candi bentar terbelah dengan sinar di tengah
        'temple-gate': async (c) => {
            const { lyr, pieces: [l, r] } = shards(c, [
                'polygon(0 0,44% 0,44% 12%,47% 12%,47% 24%,50% 24%,50% 100%,0 100%)',
                'polygon(44% 0,100% 0,100% 100%,50% 100%,50% 24%,47% 24%,47% 12%,44% 12%)',
            ]);
            const beam = el('div', `position:absolute;top:0;bottom:0;left:50%;width:4px;translate:-50% 0;background:linear-gradient(transparent, ${COL.accent}, transparent);box-shadow:0 0 60px 20px ${rgba(COL.primary, .5)}`);
            lyr.prepend(beam);
            anim(beam, [{ width: '4px', opacity: 1 }, { width: '100vw', opacity: 0 }], { duration: 2100 });
            await Promise.all([
                anim(l, [{ transform: 'none' }, { transform: 'translateX(-55%)' }], { duration: 2000, easing: 'cubic-bezier(.6,0,.2,1)' }),
                anim(r, [{ transform: 'none' }, { transform: 'translateX(55%)' }], { duration: 2000, easing: 'cubic-bezier(.6,0,.2,1)' }),
            ]);
        },

        // 22. Gerhana: piringan gelap melintas lalu menelan layar
        'eclipse': async (c) => {
            const lyr = layer('display:grid;place-items:center');
            const disc = el('div', `width:50vmin;height:50vmin;border-radius:50%;background:#05060f;box-shadow:0 0 0 0 ${COL.accent}`);
            lyr.appendChild(disc);
            anim(c, [{ filter: 'brightness(1)' }, { filter: 'brightness(.35)' }], { duration: 1100 });
            await anim(disc, [{ transform: 'translateX(-120vmax)' }, { transform: 'translateX(0)' }], { duration: 1100, easing: 'cubic-bezier(.2,.8,.3,1)' });
            await anim(disc, [{ boxShadow: `0 0 0 0 ${COL.accent}` }, { boxShadow: `0 0 80px 18px ${COL.accent}` }], { duration: 500 });
            await anim(disc, [{ transform: 'scale(1)' }, { transform: 'scale(6)' }], { duration: 700, easing: 'ease-in' });
            c.style.visibility = 'hidden';
            await anim(disc, [{ opacity: 1, transform: 'scale(6)' }, { opacity: 0, transform: 'scale(6)' }], { duration: 700 });
        },

        // 23. Tinta menyebar dari beberapa titik
        'ink-spread': async (c) => {
            const blobs = [[30, 35, 1.3], [72, 60, 1.0], [50, 85, 0.8], [80, 20, 0.9]];
            c.style.webkitMaskComposite = 'source-in';
            c.style.maskComposite = 'intersect';
            await tween(1700, (t) => {
                const m = blobs.map(([x, y, k]) => {
                    const r = Math.max(0, t * 120 * k - 5);
                    return `radial-gradient(circle at ${x}% ${y}%, transparent ${r}vmax, #000 ${r + 6}vmax)`;
                }).join(',');
                c.style.webkitMaskImage = m;
                c.style.maskImage = m;
            }, (t) => t * t);
        },

        // 24. Bergeser miring ke kiri, konten masuk miring dari kanan
        'skew-slide': async (c) => {
            anim(content(), [{ transform: 'translateX(40%) skewX(-10deg)' }, { transform: 'none' }], { duration: 1300, fill: 'none', easing: 'cubic-bezier(.2,.8,.2,1)' });
            await anim(c, [{ transform: 'none' }, { transform: 'translateX(-120%) skewX(-25deg)' }], { duration: 1200, easing: 'cubic-bezier(.7,0,.3,1)' });
        },

        // 25. Tirai panggung beludru naik ke atas
        'theater-rise': async (c) => {
            const folds = el('div', 'position:absolute;inset:0;z-index:5;pointer-events:none;opacity:0;background:repeating-linear-gradient(90deg, rgba(0,0,0,.35) 0, rgba(255,255,255,.07) 2.5%, rgba(0,0,0,.35) 5%)');
            const fringe = el('div', `position:absolute;left:0;right:0;bottom:0;height:18px;z-index:6;background:radial-gradient(circle at 10px 0, ${COL.primary} 9px, transparent 10px) 0 0/20px 18px repeat-x`);
            c.append(folds, fringe);
            await anim(folds, [{ opacity: 0 }, { opacity: 1 }], { duration: 450 });
            await anim(c, [
                { transform: 'translateY(0) scaleY(1)' },
                { transform: 'translateY(2%) scaleY(1.01)', offset: 0.15 },
                { transform: 'translateY(-105%) scaleY(.95)' },
            ], { duration: 1900, easing: 'cubic-bezier(.6,0,.3,1)' });
        },

        // 26. Gulungan lukisan oriental tergulung ke kiri
        'side-scroll': async (c) => {
            const lyr = layer();
            const rod = el('div', `position:absolute;top:-2vh;bottom:-2vh;right:-12px;width:24px;border-radius:12px;background:linear-gradient(90deg, ${COL.primary}, ${COL.accent}, ${COL.primary});box-shadow:-6px 0 18px rgba(0,0,0,.35)`);
            lyr.appendChild(rod);
            await tween(1700, (t) => {
                c.style.clipPath = `inset(0 ${t * 100}% 0 0)`;
                rod.style.right = `calc(${t * 100}% - 12px)`;
            });
            await anim(rod, [{ opacity: 1 }, { opacity: 0, transform: 'translateX(-30px)' }], { duration: 400 });
        },

        // 27. Glitch digital lalu mati seperti layar TV
        'glitch': async (c) => {
            await anim(c, [
                { transform: 'none', clipPath: 'inset(0 0 0 0)', filter: 'none' },
                { transform: 'translate(-10px,2px)', clipPath: 'inset(10% 0 55% 0)', filter: 'hue-rotate(90deg)' },
                { transform: 'translate(10px,-3px)', clipPath: 'inset(45% 0 25% 0)', filter: 'hue-rotate(-90deg) saturate(3)' },
                { transform: 'translate(-5px,0)', clipPath: 'inset(0 0 0 0)', filter: 'invert(1)' },
                { transform: 'translate(8px,4px)', clipPath: 'inset(70% 0 4% 0)', filter: 'none' },
                { transform: 'translate(-3px,-2px)', clipPath: 'inset(20% 0 30% 0)', filter: 'hue-rotate(180deg)' },
                { transform: 'none', clipPath: 'inset(0 0 0 0)', filter: 'none' },
            ], { duration: 750, easing: 'steps(7)', fill: 'none' });
            await anim(c, [
                { transform: 'scale(1,1)', filter: 'brightness(1)' },
                { transform: 'scale(1,.006)', filter: 'brightness(3)', offset: 0.6 },
                { transform: 'scale(0,.006)', filter: 'brightness(6)' },
            ], { duration: 650, easing: 'ease-in' });
        },

        // 28. Ubin kertas berbalik satu per satu secara diagonal
        'tile-flip': async (c) => {
            const rows = 7, cols = 5;
            const tiles = grid(rows, cols);
            const { pieces } = shards(c, tiles.map((t) => t.clip), 'perspective:1000px');
            await Promise.all(pieces.map((p, i) => {
                const { r, c: col } = tiles[i];
                p.style.transformOrigin = `${(col + 0.5) * 100 / cols}% ${(r + 0.5) * 100 / rows}%`;
                p.style.backfaceVisibility = 'hidden';
                return anim(p, [{ transform: 'rotateY(0)', opacity: 1 }, { transform: 'rotateY(180deg)', opacity: 0 }],
                    { duration: 700, delay: (r + col) * 75, easing: 'ease-in-out' });
            }));
        },

        // 29. Menguap seperti kabut dengan partikel naik
        'evaporate': async (c) => {
            const lyr = layer();
            const jobs = [];
            for (let i = 0; i < 60; i++) {
                const s = rand(3, 8);
                const d = el('span', `position:absolute;left:${rand(0, 100)}%;top:${rand(30, 100)}%;width:${s}px;height:${s}px;border-radius:50%;background:${pick([COL.primary, COL.accent])};filter:blur(1px)`);
                lyr.appendChild(d);
                jobs.push(anim(d, [{ transform: 'translateY(0)', opacity: 0 }, { opacity: 1, offset: 0.2 }, { transform: `translateY(-${rand(30, 70)}vh)`, opacity: 0 }],
                    { duration: rand(1300, 2000), delay: rand(0, 400), easing: 'ease-out' }));
            }
            jobs.push(anim(c, [{ filter: 'blur(0)', transform: 'none', opacity: 1 }, { filter: 'blur(18px)', transform: 'translateY(-60px) scale(1.05)', opacity: 0 }], { duration: 1500, easing: 'ease-in' }));
            await Promise.all(jobs);
        },

        // 30. Pusaran spiral mengecil ke tengah
        'spiral': async (c) => {
            await anim(c, [
                { transform: 'rotate(0) scale(1)', borderRadius: '0%' },
                { transform: 'rotate(300deg) scale(.5)', borderRadius: '40%', offset: 0.6 },
                { transform: 'rotate(600deg) scale(0)', borderRadius: '50%' },
            ], { duration: 1600, easing: 'cubic-bezier(.6,0,.4,1)' });
        },

        // 31. Gunungan wayang (kayon) naik, digetarkan dalang, lalu terbang membuka layar
        'kayon': async (c) => {
            const lyr = layer('display:grid;place-items:center');
            const glow = el('div', `position:absolute;left:50%;top:50%;width:80vmin;height:80vmin;translate:-50% -50%;border-radius:50%;background:radial-gradient(circle, ${rgba(COL.accent, .55)}, transparent 65%);opacity:0`);
            const h = Math.min(innerHeight * 0.72, 520);
            const kayon = el('div', `position:relative;width:${h * 0.6}px;height:${h}px`, `
                <svg viewBox="0 0 200 340" width="100%" height="100%" fill="none" stroke="${COL.accent}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <defs><linearGradient id="kayonG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${COL.primary}"/><stop offset="1" stop-color="#2a140a"/></linearGradient></defs>
                    <path d="M100 330V292" stroke="#2a140a" stroke-width="6"/>
                    <path d="M100 6C130 60 190 120 190 200c0 50-30 85-90 92C40 285 10 250 10 200 10 120 70 60 100 6z" fill="url(#kayonG)"/>
                    <path d="M100 30c25 45 72 100 72 170 0 40-24 68-72 74-48-6-72-34-72-74 0-70 47-125 72-170z" stroke-dasharray="1 7"/>
                    <path d="M100 66v156M100 110c-20-10-30-25-32-40M100 110c20-10 30-25 32-40M100 150c-26-8-44-26-48-46M100 150c26-8 44-26 48-46M100 190c-30-6-52-22-60-40M100 190c30-6 52-22 60-40"/>
                    <g fill="${COL.accent}" stroke="none">
                        ${[[68, 70], [132, 70], [52, 104], [148, 104], [40, 150], [160, 150], [100, 60]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5"/>`).join('')}
                    </g>
                    <path d="M66 274v-50h68v50M60 224h80L100 196z" fill="#2a140a"/>
                    <path d="M90 274v-34h20v34M74 236h10M116 236h10"/>
                </svg>`);
            lyr.append(glow, kayon);
            kayon.style.transformOrigin = '50% 100%';
            anim(c, [{ filter: 'brightness(1)' }, { filter: 'brightness(.55) sepia(.4)' }], { duration: 900 });
            anim(glow, [{ opacity: 0, scale: .4 }, { opacity: 1, scale: 1 }], { duration: 1200, easing: 'ease-out' });
            await anim(kayon, [{ transform: 'translateY(110vh)' }, { transform: 'translateY(0)' }], { duration: 1000, easing: 'cubic-bezier(.2,.8,.3,1)' });
            await anim(kayon, [
                { transform: 'rotate(0)' }, { transform: 'rotate(-10deg)' }, { transform: 'rotate(8deg)' },
                { transform: 'rotate(-5deg)' }, { transform: 'rotate(3deg)' }, { transform: 'rotate(0)' },
            ], { duration: 1100, easing: 'ease-in-out' });
            anim(c, [{ opacity: 1 }, { opacity: 0 }], { duration: 700 });
            anim(glow, [{ opacity: 1, scale: 1 }, { opacity: 0, scale: 3 }], { duration: 900 });
            await anim(kayon, [{ transform: 'translateY(0) rotate(0) scale(1)', opacity: 1 }, { transform: 'translateY(-115vh) rotate(-14deg) scale(1.15)', opacity: .9 }], { duration: 900, easing: 'cubic-bezier(.6,0,.8,.4)' });
        },
    };

    /* =====================================================================
       30 EFEK AMBIENT (canvas)
       Tiap efek: { n, init(p, first), step(p, dt), draw(p) }  atau  { setup(), frame(t, dt) }
       ===================================================================== */
    const cvs = $('#ambient');
    const ctx = cvs.getContext('2d');
    let W = 0, H = 0;
    const resize = () => {
        const dpr = Math.min(devicePixelRatio || 1, 2);
        W = innerWidth; H = innerHeight;
        cvs.width = W * dpr; cvs.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    addEventListener('resize', resize);

    const INK = CFG.dark ? '#ffffff' : COL.muted;
    const small = () => (W < 600 ? 0.6 : 1); // kurangi partikel di layar kecil

    const fallInit = (p, first, extra = {}) => Object.assign(p, {
        x: rand(-0.1, 1.05) * W, y: first ? rand(0, H) : rand(-60, -15), rot: rand(0, TAU), vr: rand(-0.03, 0.03),
        flip: rand(0, TAU), vf: rand(0.02, 0.06), ph: rand(0, TAU),
    }, extra);
    const riseInit = (p, first, extra = {}) => Object.assign(p, {
        x: rand(0, W), y: first ? rand(0, H) : H + rand(15, 60), ph: rand(0, TAU), rot: rand(0, TAU),
    }, extra);
    const offscreen = (p, m = 60) => p.y > H + m || p.y < -m * 2 || p.x > W + m || p.x < -m;

    const heartPath = (s) => {
        ctx.beginPath();
        ctx.moveTo(0, s * 0.35);
        ctx.bezierCurveTo(-s * 1.1, -s * 0.4, -s * 0.5, -s * 1.1, 0, -s * 0.45);
        ctx.bezierCurveTo(s * 0.5, -s * 1.1, s * 1.1, -s * 0.4, 0, s * 0.35);
        ctx.closePath();
    };
    const star4 = (s) => {
        ctx.beginPath();
        ctx.moveTo(0, -s); ctx.quadraticCurveTo(0, 0, s, 0); ctx.quadraticCurveTo(0, 0, 0, s);
        ctx.quadraticCurveTo(0, 0, -s, 0); ctx.quadraticCurveTo(0, 0, 0, -s);
        ctx.fill();
    };
    const flower = (s, petals, rx, ry, fill, center) => {
        ctx.fillStyle = fill;
        for (let i = 0; i < petals; i++) {
            ctx.save(); ctx.rotate((i * TAU) / petals);
            ctx.beginPath(); ctx.ellipse(0, -s * ry, s * rx, s * ry, 0, 0, TAU); ctx.fill();
            ctx.restore();
        }
        ctx.fillStyle = center;
        ctx.beginPath(); ctx.arc(0, 0, s * 0.25, 0, TAU); ctx.fill();
    };

    const AMBIENT = {
        // 1. Debu emas berkilau naik perlahan
        'gold-dust': {
            n: 70,
            init: (p, f) => riseInit(p, f, { r: rand(0.6, 2.2), vx: rand(-0.2, 0.2), vy: rand(-0.15, -0.5) }),
            step: (p, dt) => { p.x += p.vx * dt; p.y += p.vy * dt; p.ph += 0.05 * dt; p.dead = p.y < -10; },
            draw: (p) => {
                ctx.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(p.ph));
                ctx.shadowBlur = 8; ctx.shadowColor = COL.primary; ctx.fillStyle = COL.primary;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.fill();
            },
        },
        // 2. Kelopak sakura berguguran dengan efek 3D
        'sakura': {
            n: 35,
            init: (p, f) => fallInit(p, f, { s: rand(6, 11), vy: rand(0.6, 1.4), vx: rand(0.3, 1) }),
            step: (p, dt) => { p.ph += 0.02 * dt; p.x += (p.vx + Math.sin(p.ph) * 0.6) * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.flip += p.vf * dt; p.dead = offscreen(p); },
            draw: (p) => {
                const s = p.s;
                ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.cos(p.flip));
                ctx.fillStyle = rgba(COL.accent, 0.95); ctx.strokeStyle = rgba(COL.primary, 0.4);
                ctx.beginPath(); ctx.moveTo(0, s);
                ctx.bezierCurveTo(s, s * 0.4, s * 0.8, -s * 0.8, s * 0.25, -s);
                ctx.lineTo(0, -s * 0.7); ctx.lineTo(-s * 0.25, -s);
                ctx.bezierCurveTo(-s * 0.8, -s * 0.8, -s, s * 0.4, 0, s);
                ctx.fill(); ctx.stroke();
            },
        },
        // 3. Daun musim gugur berjatuhan berputar
        'autumn-leaves': {
            n: 18,
            init: (p, f) => fallInit(p, f, { s: rand(8, 15), vy: rand(0.7, 1.5), vx: rand(-0.4, 0.6), c: pick(['#c9622c', '#d98c3a', '#a8432a', COL.primary, '#b5772f']), vr: rand(-0.05, 0.05) }),
            step: (p, dt) => { p.ph += 0.03 * dt; p.x += (p.vx + Math.sin(p.ph)) * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.flip += p.vf * dt; p.dead = offscreen(p); },
            draw: (p) => {
                const s = p.s;
                ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(Math.cos(p.flip), 1);
                ctx.fillStyle = p.c;
                ctx.beginPath(); ctx.moveTo(0, -s);
                ctx.lineTo(s * 0.3, -s * 0.4); ctx.lineTo(s, -s * 0.5); ctx.lineTo(s * 0.6, 0); ctx.lineTo(s * 0.9, s * 0.4);
                ctx.lineTo(s * 0.2, s * 0.3); ctx.lineTo(0, s); ctx.lineTo(-s * 0.2, s * 0.3); ctx.lineTo(-s * 0.9, s * 0.4);
                ctx.lineTo(-s * 0.6, 0); ctx.lineTo(-s, -s * 0.5); ctx.lineTo(-s * 0.3, -s * 0.4); ctx.closePath(); ctx.fill();
                ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.moveTo(0, -s * 0.8); ctx.lineTo(0, s * 1.3); ctx.stroke();
            },
        },
        // 4. Kunang-kunang berkedip mengembara
        'fireflies': {
            n: 30,
            init: (p) => Object.assign(p, { x: rand(0, W), y: rand(0, H), vx: rand(-0.3, 0.3), vy: rand(-0.3, 0.3), ph: rand(0, TAU), r: rand(1.5, 3) }),
            step: (p, dt) => {
                p.vx = Math.max(-0.6, Math.min(0.6, p.vx + rand(-0.05, 0.05))); p.vy = Math.max(-0.6, Math.min(0.6, p.vy + rand(-0.05, 0.05)));
                p.x = (p.x + p.vx * dt + W) % W; p.y = (p.y + p.vy * dt + H) % H; p.ph += 0.04 * dt;
            },
            draw: (p) => {
                const a = Math.max(0, Math.sin(p.ph));
                ctx.globalAlpha = a; ctx.shadowBlur = 18; ctx.shadowColor = '#f9f871'; ctx.fillStyle = '#fbf8a8';
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.fill();
            },
        },
        // 5. Gelembung air naik bergoyang
        'bubbles': {
            n: 26,
            init: (p, f) => riseInit(p, f, { r: rand(4, 16), vy: rand(-0.4, -1.2), top: rand(-20, H * 0.3) }),
            step: (p, dt) => { p.ph += 0.03 * dt; p.x += Math.sin(p.ph) * 0.5 * dt; p.y += p.vy * dt; p.dead = p.y < p.top; },
            draw: (p) => {
                ctx.strokeStyle = rgba(COL.primary, 0.5); ctx.lineWidth = 1.2; ctx.fillStyle = rgba(COL.accent, 0.15);
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.fill(); ctx.stroke();
                ctx.strokeStyle = 'rgba(255,255,255,.85)';
                ctx.beginPath(); ctx.arc(p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.45, Math.PI * 1.1, Math.PI * 1.6); ctx.stroke();
            },
        },
        // 6. Langit berbintang dengan bintang jatuh
        'shooting-stars': {
            setup() {
                this.stars = Array.from({ length: Math.round(90 * small()) }, () => ({ x: rand(0, 1), y: rand(0, 1), r: rand(0.4, 1.5), ph: rand(0, TAU) }));
                this.meteors = [];
            },
            frame(t, dt) {
                for (const s of this.stars) {
                    s.ph += 0.03 * dt;
                    ctx.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(s.ph)); ctx.fillStyle = COL.primary;
                    ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, TAU); ctx.fill();
                }
                if (Math.random() < 0.012 * dt) this.meteors.push({ x: rand(W * 0.3, W * 1.1), y: rand(-20, H * 0.4), v: rand(8, 14), life: 1 });
                ctx.globalAlpha = 1;
                this.meteors = this.meteors.filter((m) => {
                    m.x -= m.v * dt; m.y += m.v * 0.55 * dt; m.life -= 0.015 * dt;
                    const g = ctx.createLinearGradient(m.x, m.y, m.x + 120, m.y - 66);
                    g.addColorStop(0, rgba(COL.accent, m.life)); g.addColorStop(1, 'transparent');
                    ctx.strokeStyle = g; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x + 120, m.y - 66); ctx.stroke();
                    return m.life > 0;
                });
            },
        },
        // 7. Bunga melati putih berguguran
        'jasmine': {
            n: 24,
            init: (p, f) => fallInit(p, f, { s: rand(5, 9), vy: rand(0.4, 0.9), vx: rand(-0.2, 0.2), vr: rand(-0.02, 0.02) }),
            step: (p, dt) => { p.ph += 0.02 * dt; p.x += (p.vx + Math.sin(p.ph) * 0.3) * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.flip += p.vf * 0.5 * dt; p.dead = offscreen(p); },
            draw: (p) => {
                ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, 0.6 + 0.4 * Math.abs(Math.cos(p.flip)));
                ctx.shadowBlur = 4; ctx.shadowColor = 'rgba(0,0,0,.25)';
                flower(p.s, 5, 0.32, 0.55, '#fffdf3', '#f3d36b');
            },
        },
        // 8. Lampion terbang naik bercahaya
        'sky-lanterns': {
            n: 14,
            init: (p, f) => riseInit(p, f, { w: rand(10, 22), vy: rand(-0.3, -0.7) }),
            step: (p, dt) => { p.ph += 0.015 * dt; p.x += Math.sin(p.ph) * 0.35 * dt; p.y += p.vy * dt * (p.w / 16); p.dead = p.y < -60; },
            draw: (p) => {
                const w = p.w, h = w * 1.3;
                ctx.globalAlpha = 0.5 + w / 44;
                const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, w * 2.2);
                glow.addColorStop(0, 'rgba(255,190,90,.45)'); glow.addColorStop(1, 'rgba(255,190,90,0)');
                ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(p.x, p.y, w * 2.2, 0, TAU); ctx.fill();
                const g = ctx.createLinearGradient(p.x, p.y - h / 2, p.x, p.y + h / 2);
                g.addColorStop(0, '#ffe1a0'); g.addColorStop(1, '#ff8a3d');
                ctx.fillStyle = g;
                ctx.beginPath(); ctx.moveTo(p.x - w * 0.5, p.y - h / 2); ctx.lineTo(p.x + w * 0.5, p.y - h / 2);
                ctx.lineTo(p.x + w * 0.38, p.y + h / 2); ctx.lineTo(p.x - w * 0.38, p.y + h / 2); ctx.closePath(); ctx.fill();
            },
        },
        // 9. Kupu-kupu terbang mengepakkan sayap
        'butterflies': {
            n: 10,
            init: (p) => Object.assign(p, { x: rand(0, W), y: rand(0, H), a: rand(0, TAU), v: rand(0.6, 1.2), ph: rand(0, TAU), s: rand(7, 12), c: pick([COL.primary, COL.accent]) }),
            step: (p, dt) => {
                p.a += rand(-0.08, 0.08) * dt; p.x += Math.cos(p.a) * p.v * dt; p.y += Math.sin(p.a) * p.v * dt; p.ph += 0.35 * dt;
                p.x = (p.x + W + 40) % (W + 40) - 20; p.y = (p.y + H + 40) % (H + 40) - 20;
            },
            draw: (p) => {
                ctx.translate(p.x, p.y); ctx.rotate(p.a + Math.PI / 2);
                const k = 0.25 + 0.75 * Math.abs(Math.sin(p.ph)), s = p.s;
                ctx.fillStyle = p.c; ctx.globalAlpha = 0.85;
                for (const side of [-1, 1]) {
                    ctx.save(); ctx.scale(side * k, 1);
                    ctx.beginPath(); ctx.ellipse(s * 0.6, -s * 0.35, s * 0.6, s * 0.45, 0.5, 0, TAU); ctx.fill();
                    ctx.beginPath(); ctx.ellipse(s * 0.45, s * 0.35, s * 0.4, s * 0.3, -0.5, 0, TAU); ctx.fill();
                    ctx.restore();
                }
                ctx.fillStyle = COL.text; ctx.fillRect(-0.8, -s * 0.6, 1.6, s * 1.2);
            },
        },
        // 10. Cincin tipis mengembang dan memudar
        'floating-rings': {
            n: 16,
            init: (p, f) => Object.assign(p, { x: rand(0, W), y: rand(0, H), r: rand(4, 20), a: f ? rand(0, 0.6) : 0.6, vy: rand(-0.1, -0.35) }),
            step: (p, dt) => { p.r += 0.12 * dt; p.y += p.vy * dt; p.a -= 0.0025 * dt; p.dead = p.a <= 0; },
            draw: (p) => { ctx.globalAlpha = p.a; ctx.strokeStyle = COL.primary; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.stroke(); },
        },
        // 11. Bulu-bulu melayang bergoyang seperti bandul
        'feathers': {
            n: 12,
            init: (p, f) => fallInit(p, f, { L: rand(12, 22), vy: rand(0.35, 0.75), x0: rand(0, W) }),
            step: (p, dt) => { p.ph += 0.025 * dt; p.y += p.vy * dt; p.x = p.x0 + Math.sin(p.ph) * 40; p.dead = p.y > H + 40; },
            draw: (p) => {
                const L = p.L;
                ctx.translate(p.x, p.y); ctx.rotate(Math.sin(p.ph) * 0.7);
                ctx.fillStyle = rgba(COL.accent, 0.75); ctx.strokeStyle = rgba(COL.primary, 0.8); ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(0, -L);
                ctx.bezierCurveTo(L * 0.45, -L * 0.6, L * 0.4, L * 0.4, 0, L * 0.7);
                ctx.bezierCurveTo(-L * 0.4, L * 0.4, -L * 0.45, -L * 0.6, 0, -L); ctx.fill();
                ctx.beginPath(); ctx.moveTo(0, -L); ctx.lineTo(0, L); ctx.stroke();
            },
        },
        // 12. Bokeh lembut bernapas
        'bokeh': {
            n: 20,
            init: (p) => Object.assign(p, { x: rand(0, W), y: rand(0, H), r: rand(15, 60), vx: rand(-0.15, 0.15), vy: rand(-0.15, 0.15), ph: rand(0, TAU), c: pick([COL.primary, COL.accent]) }),
            step: (p, dt) => { p.x = (p.x + p.vx * dt + W) % W; p.y = (p.y + p.vy * dt + H) % H; p.ph += 0.01 * dt; },
            draw: (p) => {
                const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
                g.addColorStop(0, rgba(p.c, 0.22 + 0.12 * Math.sin(p.ph))); g.addColorStop(0.7, rgba(p.c, 0.08)); g.addColorStop(1, rgba(p.c, 0));
                ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.fill();
            },
        },
        // 13. Konfeti warna-warni berkibar
        'confetti': {
            n: 60,
            init: (p, f) => fallInit(p, f, { w: rand(6, 10), h: rand(3, 5), vy: rand(1, 2.4), vx: rand(-0.5, 0.5), vr: rand(-0.1, 0.1), vf: rand(0.08, 0.2), c: pick([COL.primary, COL.accent, '#ffd166', '#06d6a0', '#ef476f', '#118ab2']) }),
            step: (p, dt) => { p.ph += 0.05 * dt; p.x += (p.vx + Math.sin(p.ph)) * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.flip += p.vf * dt; p.dead = offscreen(p); },
            draw: (p) => { ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.cos(p.flip)); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); },
        },
        // 14. Debu & goresan film tua (sepia flicker)
        'film-dust': {
            setup() { this.scratch = 0; },
            frame(t, dt) {
                ctx.fillStyle = `rgba(60,40,20,${rand(0, 0.05)})`; ctx.fillRect(0, 0, W, H);
                ctx.fillStyle = rgba(COL.text, 0.35);
                for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(rand(0, W), rand(0, H), rand(0.5, 2), 0, TAU); ctx.fill(); }
                if (Math.random() < 0.08) {
                    ctx.strokeStyle = rgba(COL.text, 0.25); ctx.lineWidth = 0.8;
                    const x = rand(0, W), y = rand(0, H);
                    ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x + rand(-30, 30), y + rand(-30, 30), x + rand(-30, 30), y + rand(-30, 30), x + rand(-40, 40), y + rand(-40, 40)); ctx.stroke();
                }
                if (this.scratch <= 0 && Math.random() < 0.01) this.scratch = { x: rand(0, W), life: rand(10, 30) };
                if (this.scratch) {
                    ctx.strokeStyle = rgba(COL.text, 0.25); ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.moveTo(this.scratch.x, 0); ctx.lineTo(this.scratch.x + rand(-2, 2), H); ctx.stroke();
                    this.scratch.life -= dt; if (this.scratch.life <= 0) this.scratch = 0;
                }
            },
        },
        // 15. Salju turun berlapis kedalaman
        'snow': {
            n: 110,
            init: (p, f) => fallInit(p, f, { r: rand(1, 3.5) }),
            step: (p, dt) => { p.ph += 0.01 * dt; p.y += (0.3 + p.r * 0.35) * dt; p.x += Math.sin(p.ph) * 0.4 * dt; p.dead = p.y > H + 10; },
            draw: (p) => {
                ctx.globalAlpha = 0.5 + p.r / 7; ctx.fillStyle = '#fff'; ctx.shadowBlur = 4; ctx.shadowColor = COL.primary;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.fill();
            },
        },
        // 16. Sinar matahari berputar dari sudut + debu cahaya
        'sun-rays': {
            setup() { this.motes = Array.from({ length: 30 }, () => ({ x: rand(0, 1), y: rand(0, 1), ph: rand(0, TAU) })); },
            frame(t, dt) {
                const ox = -W * 0.1, oy = -H * 0.1, len = Math.hypot(W, H) * 1.3;
                ctx.globalCompositeOperation = 'lighter';
                for (let i = 0; i < 9; i++) {
                    const a = t * 0.00006 + i * 0.19;
                    const g = ctx.createLinearGradient(ox, oy, ox + Math.cos(a) * len, oy + Math.sin(a) * len);
                    g.addColorStop(0, rgba(COL.primary, 0.22)); g.addColorStop(1, rgba(COL.primary, 0));
                    ctx.fillStyle = g;
                    ctx.beginPath(); ctx.moveTo(ox, oy);
                    ctx.lineTo(ox + Math.cos(a - 0.04) * len, oy + Math.sin(a - 0.04) * len);
                    ctx.lineTo(ox + Math.cos(a + 0.04) * len, oy + Math.sin(a + 0.04) * len); ctx.fill();
                }
                for (const m of this.motes) {
                    m.ph += 0.01 * dt; m.y -= 0.0003 * dt; if (m.y < 0) m.y = 1;
                    ctx.fillStyle = rgba(COL.accent, 0.5 + 0.5 * Math.sin(m.ph));
                    ctx.beginPath(); ctx.arc(m.x * W + Math.sin(m.ph) * 10, m.y * H, 1.8, 0, TAU); ctx.fill();
                }
            },
        },
        // 17. Berlian art-deco naik berputar
        'rising-diamonds': {
            n: 18,
            init: (p, f) => riseInit(p, f, { s: rand(5, 14), vy: rand(-0.3, -0.8), vr: rand(-0.01, 0.01), fill: Math.random() < 0.3 }),
            step: (p, dt) => { p.y += p.vy * dt; p.rot += p.vr * dt; p.dead = p.y < -30; },
            draw: (p) => {
                ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = 0.65;
                ctx.strokeStyle = COL.primary; ctx.fillStyle = rgba(COL.primary, 0.4); ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(0, -p.s); ctx.lineTo(p.s * 0.6, 0); ctx.lineTo(0, p.s); ctx.lineTo(-p.s * 0.6, 0); ctx.closePath();
                p.fill ? ctx.fill() : ctx.stroke();
                ctx.beginPath(); ctx.moveTo(-p.s * 0.6, 0); ctx.lineTo(p.s * 0.6, 0); ctx.stroke();
            },
        },
        // 18. Payet berkilau (glint) berjatuhan
        'sequins': {
            n: 60,
            init: (p, f) => fallInit(p, f, { r: rand(1.5, 3.5), vy: rand(0.3, 0.8), c: pick([COL.primary, '#ffffff', COL.primary]) }),
            step: (p, dt) => { p.ph += 0.06 * dt; p.y += p.vy * dt; p.x += Math.sin(p.ph * 0.3) * 0.2 * dt; p.dead = p.y > H + 10; },
            draw: (p) => {
                const glint = Math.pow(Math.max(0, Math.sin(p.ph)), 8);
                ctx.globalAlpha = 0.35 + 0.65 * glint; ctx.fillStyle = p.c;
                ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r, p.r * Math.abs(Math.cos(p.ph * 0.5)) + 0.4, 0, 0, TAU); ctx.fill();
                if (glint > 0.6) { ctx.translate(p.x, p.y); ctx.fillStyle = '#fff'; star4(p.r * 3); }
            },
        },
        // 19. Biji dandelion melayang tertiup angin
        'dandelion': {
            n: 14,
            init: (p, f) => Object.assign(p, { x: f ? rand(0, W) : -20, y: rand(H * 0.2, H), vx: rand(0.3, 0.8), vy: rand(-0.1, -0.4), ph: rand(0, TAU), s: rand(6, 10) }),
            step: (p, dt) => { p.ph += 0.02 * dt; p.x += p.vx * dt; p.y += (p.vy + Math.sin(p.ph) * 0.3) * dt; p.dead = p.x > W + 20 || p.y < -20; },
            draw: (p) => {
                ctx.translate(p.x, p.y); ctx.rotate(Math.sin(p.ph) * 0.3 - 0.3);
                ctx.strokeStyle = rgba(INK, 0.7); ctx.lineWidth = 0.7;
                ctx.beginPath(); ctx.moveTo(0, p.s * 1.6); ctx.lineTo(0, 0); ctx.stroke();
                for (let i = 0; i < 12; i++) {
                    const a = -Math.PI / 2 + (i - 5.5) * 0.25;
                    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * p.s, Math.sin(a) * p.s); ctx.stroke();
                }
                ctx.fillStyle = COL.primary; ctx.beginPath(); ctx.ellipse(0, p.s * 1.7, 1.2, 2.5, 0, 0, TAU); ctx.fill();
            },
        },
        // 20. Hati melayang naik
        'hearts': {
            n: 22,
            init: (p, f) => riseInit(p, f, { s: rand(6, 14), vy: rand(-0.5, -1.2), c: pick([COL.primary, COL.accent]) }),
            step: (p, dt) => { p.ph += 0.04 * dt; p.x += Math.sin(p.ph) * 0.5 * dt; p.y += p.vy * dt; p.dead = p.y < -20; },
            draw: (p) => {
                ctx.globalAlpha = Math.min(1, p.y / (H * 0.4)) * 0.85;
                ctx.translate(p.x, p.y); ctx.rotate(Math.sin(p.ph) * 0.25); ctx.fillStyle = p.c;
                heartPath(p.s); ctx.fill();
            },
        },
        // 21. Bunga kamboja (frangipani) berputar jatuh
        'frangipani': {
            n: 12,
            init: (p, f) => fallInit(p, f, { s: rand(9, 15), vy: rand(0.4, 0.9), vx: rand(-0.3, 0.3), vr: rand(-0.015, 0.015) }),
            step: (p, dt) => { p.ph += 0.015 * dt; p.x += (p.vx + Math.sin(p.ph) * 0.4) * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.dead = offscreen(p); },
            draw: (p) => {
                ctx.translate(p.x, p.y); ctx.rotate(p.rot);
                const s = p.s;
                for (let i = 0; i < 5; i++) {
                    ctx.save(); ctx.rotate((i * TAU) / 5);
                    const g = ctx.createLinearGradient(0, 0, 0, -s * 1.1);
                    g.addColorStop(0, '#ffd23f'); g.addColorStop(0.45, '#fff8e7'); g.addColorStop(1, '#ffffff');
                    ctx.fillStyle = g;
                    ctx.beginPath(); ctx.ellipse(s * 0.18, -s * 0.55, s * 0.32, s * 0.6, 0.35, 0, TAU); ctx.fill();
                    ctx.restore();
                }
            },
        },
        // 22. Rasi bintang - titik terhubung garis
        'constellation': {
            setup() { this.pts = Array.from({ length: Math.round(48 * small()) }, () => ({ x: rand(0, W), y: rand(0, H), vx: rand(-0.2, 0.2), vy: rand(-0.2, 0.2), ph: rand(0, TAU) })); },
            frame(t, dt) {
                const pts = this.pts;
                for (const p of pts) { p.x = (p.x + p.vx * dt + W) % W; p.y = (p.y + p.vy * dt + H) % H; p.ph += 0.03 * dt; }
                ctx.lineWidth = 0.7;
                for (let i = 0; i < pts.length; i++) {
                    for (let j = i + 1; j < pts.length; j++) {
                        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
                        if (d < 120) { ctx.strokeStyle = rgba(COL.primary, (1 - d / 120) * 0.45); ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke(); }
                    }
                }
                for (const p of pts) { ctx.fillStyle = rgba(COL.primary, 0.5 + 0.5 * Math.sin(p.ph)); ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, TAU); ctx.fill(); }
            },
        },
        // 23. Tetesan tinta membentuk riak
        'ink-ripples': {
            setup() { this.drops = []; this.timer = 0; },
            frame(t, dt) {
                this.timer -= dt;
                if (this.timer <= 0) { this.drops.push({ x: rand(0, W), y: rand(0, H), r: 0, max: rand(50, 110) }); this.timer = rand(25, 55); }
                ctx.lineWidth = 1.2;
                this.drops = this.drops.filter((d) => {
                    d.r += 0.7 * dt;
                    const a = 1 - d.r / d.max;
                    for (let k = 0; k < 3; k++) {
                        const rr = d.r - k * 14;
                        if (rr > 0) { ctx.strokeStyle = rgba(COL.primary, a * (0.5 - k * 0.12)); ctx.beginPath(); ctx.ellipse(d.x, d.y, rr, rr * 0.55, 0, 0, TAU); ctx.stroke(); }
                    }
                    return d.r < d.max;
                });
            },
        },
        // 24. Daun eukaliptus bulat berayun jatuh
        'eucalyptus': {
            n: 16,
            init: (p, f) => fallInit(p, f, { s: rand(6, 10), vy: rand(0.4, 0.8), x0: rand(0, W), c: pick([COL.primary, COL.accent, '#9bb08a']) }),
            step: (p, dt) => { p.ph += 0.02 * dt; p.y += p.vy * dt; p.x = p.x0 + Math.sin(p.ph) * 30; p.dead = p.y > H + 30; },
            draw: (p) => {
                ctx.translate(p.x, p.y); ctx.rotate(Math.sin(p.ph) * 0.9);
                ctx.globalAlpha = 0.85; ctx.fillStyle = p.c;
                ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * 0.85, 0, 0, TAU); ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 0.8;
                ctx.beginPath(); ctx.moveTo(0, -p.s * 1.4); ctx.lineTo(0, p.s * 0.8); ctx.stroke();
            },
        },
        // 25. Kelopak mawar merah berjatuhan
        'rose-petals': {
            n: 22,
            init: (p, f) => fallInit(p, f, { s: rand(7, 13), vy: rand(0.7, 1.4), vx: rand(-0.3, 0.5), vf: rand(0.03, 0.07) }),
            step: (p, dt) => { p.ph += 0.025 * dt; p.x += (p.vx + Math.sin(p.ph) * 0.7) * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.flip += p.vf * dt; p.dead = offscreen(p); },
            draw: (p) => {
                const s = p.s;
                ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(Math.cos(p.flip), 1);
                const g = ctx.createRadialGradient(0, s * 0.3, 0, 0, 0, s * 1.2);
                g.addColorStop(0, '#5c0f1c'); g.addColorStop(0.6, COL.accent); g.addColorStop(1, '#c23a52');
                ctx.fillStyle = g;
                ctx.beginPath(); ctx.moveTo(0, -s * 0.8);
                ctx.bezierCurveTo(s * 1.1, -s * 1.2, s * 1.1, s * 0.6, 0, s);
                ctx.bezierCurveTo(-s * 1.1, s * 0.6, -s * 1.1, -s * 1.2, 0, -s * 0.8); ctx.fill();
            },
        },
        // 26. Kembang api meledak warna-warni
        'fireworks': {
            setup() { this.rockets = []; this.sparks = []; this.timer = 20; },
            frame(t, dt) {
                this.timer -= dt;
                if (this.timer <= 0) { this.rockets.push({ x: rand(W * 0.15, W * 0.85), y: H, vy: -rand(7, 10) * (H / 800), c: pick([COL.primary, COL.accent, '#ffffff', '#ff6b6b']) }); this.timer = rand(50, 110); }
                this.rockets = this.rockets.filter((r) => {
                    r.y += r.vy * dt; r.vy += 0.12 * dt;
                    ctx.fillStyle = r.c; ctx.beginPath(); ctx.arc(r.x, r.y, 2, 0, TAU); ctx.fill();
                    if (r.vy >= -0.5) {
                        for (let i = 0; i < 46; i++) {
                            const a = (i / 46) * TAU, v = rand(1.2, 3.6);
                            this.sparks.push({ x: r.x, y: r.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, c: r.c });
                        }
                        return false;
                    }
                    return true;
                });
                ctx.lineWidth = 1.6;
                this.sparks = this.sparks.filter((s) => {
                    const px = s.x, py = s.y;
                    s.vx *= 0.98; s.vy = s.vy * 0.98 + 0.04 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.life -= 0.014 * dt;
                    ctx.strokeStyle = rgba(s.c, Math.max(0, s.life)); ctx.beginPath(); ctx.moveTo(px - s.vx * 2, py - s.vy * 2); ctx.lineTo(s.x, s.y); ctx.stroke();
                    return s.life > 0;
                });
            },
        },
        // 27. Bentuk geometri neon bercahaya
        'neon-shapes': {
            n: 14,
            init: (p, f) => Object.assign(p, { x: rand(0, W), y: f ? rand(0, H) : H + 40, s: rand(10, 26), vy: rand(-0.2, -0.6), vx: rand(-0.2, 0.2), rot: rand(0, TAU), vr: rand(-0.01, 0.01), k: pick([3, 4, 0]), c: pick([COL.primary, COL.accent]) }),
            step: (p, dt) => { p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.dead = p.y < -50; },
            draw: (p) => {
                ctx.translate(p.x, p.y); ctx.rotate(p.rot);
                ctx.strokeStyle = p.c; ctx.lineWidth = 2; ctx.shadowBlur = 14; ctx.shadowColor = p.c; ctx.globalAlpha = 0.75;
                ctx.beginPath();
                if (p.k === 0) ctx.arc(0, 0, p.s * 0.6, 0, TAU);
                else for (let i = 0; i <= p.k; i++) { const a = (i / p.k) * TAU; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * p.s * 0.7, Math.sin(a) * p.s * 0.7); }
                ctx.stroke();
            },
        },
        // 28. Pesawat kertas terbang dengan jejak putus-putus
        'paper-planes': {
            n: 5,
            init: (p, f) => Object.assign(p, { x: f ? rand(0, W) : -40, base: rand(H * 0.1, H * 0.9), v: rand(0.9, 1.6), amp: rand(15, 45), fq: rand(0.006, 0.012), s: rand(9, 14) }),
            step: (p, dt) => { p.x += p.v * dt; p.y = p.base + Math.sin(p.x * p.fq) * p.amp; p.dead = p.x > W + 40; },
            draw: (p) => {
                ctx.strokeStyle = rgba(COL.primary, 0.45); ctx.setLineDash([3, 6]); ctx.lineWidth = 1;
                ctx.beginPath();
                for (let x = Math.max(-40, p.x - 140); x <= p.x - p.s; x += 4) ctx.lineTo(x, p.base + Math.sin(x * p.fq) * p.amp);
                ctx.stroke(); ctx.setLineDash([]);
                const ang = Math.atan(Math.cos(p.x * p.fq) * p.amp * p.fq);
                ctx.translate(p.x, p.y); ctx.rotate(ang);
                ctx.fillStyle = '#ffffff'; ctx.strokeStyle = COL.primary; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(p.s, 0); ctx.lineTo(-p.s, -p.s * 0.6); ctx.lineTo(-p.s * 0.4, 0); ctx.lineTo(-p.s, p.s * 0.6); ctx.closePath(); ctx.fill(); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(p.s, 0); ctx.lineTo(-p.s * 0.4, 0); ctx.stroke();
            },
        },
        // 29. Aurora borealis berombak + bintang
        'aurora': {
            setup() { this.stars = Array.from({ length: 60 }, () => ({ x: rand(0, 1), y: rand(0, 1), ph: rand(0, TAU) })); },
            frame(t) {
                for (const s of this.stars) { s.ph += 0.02; ctx.fillStyle = `rgba(255,255,255,${0.2 + 0.5 * Math.abs(Math.sin(s.ph))})`; ctx.fillRect(s.x * W, s.y * H, 1.3, 1.3); }
                ctx.globalCompositeOperation = 'lighter';
                [COL.primary, COL.accent, COL.primary].forEach((c, i) => {
                    const baseY = H * (0.12 + i * 0.09);
                    const g = ctx.createLinearGradient(0, baseY - 60, 0, baseY + 160);
                    g.addColorStop(0, rgba(c, 0)); g.addColorStop(0.3, rgba(c, 0.22)); g.addColorStop(1, rgba(c, 0));
                    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, H * 0.7);
                    for (let x = 0; x <= W; x += 12) {
                        ctx.lineTo(x, baseY + Math.sin(x * 0.004 + t * 0.0005 * (i + 1)) * 40 + Math.sin(x * 0.011 + t * 0.0008) * 18);
                    }
                    ctx.lineTo(W, H * 0.7); ctx.closePath(); ctx.fill();
                });
            },
        },
        // 30. Kilau bintang 4 sudut muncul-hilang
        'twinkle': {
            n: 26,
            init: (p) => Object.assign(p, { x: rand(0, W), y: rand(0, H), s: rand(4, 10), ph: rand(-2, 0), sp: rand(0.02, 0.04) }),
            step: (p, dt) => { p.ph += p.sp * dt; p.dead = p.ph > Math.PI; },
            draw: (p) => {
                if (p.ph < 0) return;
                const k = Math.sin(p.ph);
                ctx.translate(p.x, p.y); ctx.rotate(p.ph * 0.4); ctx.globalAlpha = k;
                ctx.fillStyle = COL.primary; ctx.shadowBlur = 10; ctx.shadowColor = COL.primary;
                star4(p.s * k);
            },
        },
        // 31. Kembang setaman: melati, kantil & kelopak mawar ditabur
        'kembang-setaman': {
            n: 30,
            init: (p, f) => fallInit(p, f, { k: pick(['melati', 'melati', 'kantil', 'mawar', 'mawar']), s: rand(5, 10), vy: rand(0.45, 1), vx: rand(-0.25, 0.35), vr: rand(-0.03, 0.03) }),
            step: (p, dt) => { p.ph += 0.02 * dt; p.x += (p.vx + Math.sin(p.ph) * 0.45) * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.flip += p.vf * 0.6 * dt; p.dead = offscreen(p); },
            draw: (p) => {
                const s = p.s;
                ctx.translate(p.x, p.y); ctx.rotate(p.rot);
                if (p.k === 'melati') {
                    ctx.scale(1, 0.6 + 0.4 * Math.abs(Math.cos(p.flip)));
                    ctx.shadowBlur = 3; ctx.shadowColor = 'rgba(0,0,0,.2)';
                    flower(s, 6, 0.28, 0.5, '#fffdf5', '#f1d27a');
                } else if (p.k === 'kantil') {
                    ctx.scale(Math.cos(p.flip), 1);
                    const g = ctx.createLinearGradient(0, -s * 1.6, 0, s * 1.6);
                    g.addColorStop(0, '#fffbea'); g.addColorStop(1, '#efdca0');
                    ctx.fillStyle = g;
                    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.38, s * 1.6, 0, 0, TAU); ctx.fill();
                } else {
                    ctx.scale(Math.cos(p.flip), 1);
                    const g = ctx.createRadialGradient(0, s * 0.3, 0, 0, 0, s * 1.2);
                    g.addColorStop(0, '#6b0f1a'); g.addColorStop(1, '#c8283c');
                    ctx.fillStyle = g;
                    ctx.beginPath(); ctx.moveTo(0, -s * 0.8);
                    ctx.bezierCurveTo(s * 1.1, -s * 1.2, s * 1.1, s * 0.6, 0, s);
                    ctx.bezierCurveTo(-s * 1.1, s * 0.6, -s * 1.1, -s * 1.2, 0, -s * 0.8); ctx.fill();
                }
            },
        },
    };

    const startAmbient = (name) => {
        const fx = AMBIENT[name];
        if (!fx || REDUCED) return;
        const parts = [];
        if (fx.setup) fx.setup.call(fx);
        if (fx.init) {
            const n = Math.round(fx.n * small());
            for (let i = 0; i < n; i++) parts.push(fx.init({}, true));
        }
        let last = performance.now();
        const loop = (now) => {
            const dt = Math.min(3, (now - last) / 16.67);
            last = now;
            ctx.clearRect(0, 0, W, H);
            if (fx.frame) {
                ctx.save(); fx.frame.call(fx, now, dt); ctx.restore();
            } else {
                for (const p of parts) {
                    fx.step(p, dt);
                    if (p.dead) { for (const k in p) delete p[k]; fx.init(p, false); }
                    ctx.save(); fx.draw(p); ctx.restore();
                }
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    };

    /* =====================================================================
       Interaksi halaman
       ===================================================================== */
    const cover = $('#cover');
    const audio = $('#bgm');
    const musicBtn = $('#musicBtn');

    const playMusic = () => {
        if (!audio) return;
        audio.play().then(() => musicBtn.classList.add('playing')).catch(() => {});
    };
    musicBtn?.addEventListener('click', () => {
        if (audio.paused) playMusic();
        else { audio.pause(); musicBtn.classList.remove('playing'); }
    });

    const startReveal = () => {
        const io = new IntersectionObserver((entries) => entries.forEach((e) => {
            if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        }), { threshold: 0.15 });
        $$('.rv').forEach((n) => io.observe(n));

        // Scroll-spy dock: section aktif = section terakhir yang bagian atasnya sudah melewati 35% layar.
        // (IntersectionObserver ber-threshold gagal untuk section yang lebih tinggi dari layar.)
        const links = $$('.dock a');
        const targets = links.map((a) => $(a.getAttribute('href')));
        let locked = false, unlockTimer, ticking = false;
        const setActive = (i) => links.forEach((a, k) => a.classList.toggle('active', k === i));
        const spy = () => {
            ticking = false;
            if (locked) return;
            const line = innerHeight * 0.35;
            let cur = 0;
            targets.forEach((s, k) => { if (s && s.getBoundingClientRect().top <= line) cur = k; });
            if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) cur = targets.length - 1;
            setActive(cur);
        };
        addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
        addEventListener('resize', spy);

        // Klik dock: langsung tandai aktif & kunci spy selama smooth scroll agar ikon tidak berkedip
        const unlock = () => { clearTimeout(unlockTimer); locked = false; spy(); };
        links.forEach((a, k) => a.addEventListener('click', (e) => {
            if (!targets[k]) return;
            e.preventDefault();
            setActive(k);
            locked = true;
            clearTimeout(unlockTimer);
            unlockTimer = setTimeout(unlock, 1500);
            addEventListener('scrollend', unlock, { once: true });
            targets[k].scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
            a.blur();
        }));
        spy();
    };

    let opening = false;
    $('#openBtn')?.addEventListener('click', async () => {
        if (opening) return;
        opening = true;
        scrollTo(0, 0);
        document.body.classList.add('opened');
        playMusic();
        const opener = OPENERS[CFG.opening] || OPENERS['iris-close'];
        try {
            if (!REDUCED) await opener(cover);
        } finally {
            cover.style.display = 'none';
            $$('.fx-layer').forEach((l) => l.remove());
            document.body.classList.remove('locked');
            startReveal();
        }
    });

    // Countdown
    const cd = $('.countdown');
    if (cd) {
        const target = new Date(cd.dataset.date).getTime();
        const set = (k, v) => { const n = cd.querySelector(`[data-cd="${k}"]`); if (n) n.textContent = String(v).padStart(2, '0'); };
        const tick = () => {
            const diff = Math.max(0, target - Date.now());
            set('d', Math.floor(diff / 864e5)); set('h', Math.floor((diff / 36e5) % 24));
            set('m', Math.floor((diff / 6e4) % 60)); set('s', Math.floor((diff / 1e3) % 60));
        };
        tick();
        setInterval(tick, 1000);
    }

    // Toast & salin teks
    const toast = (msg) => {
        const t = $('#toast');
        t.textContent = msg; t.hidden = false;
        clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), 2200);
    };
    $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(b.dataset.copy); }
        catch {
            const ta = el('textarea'); ta.value = b.dataset.copy; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
        }
        toast('Berhasil disalin');
    }));

    // Lightbox galeri: prev/next, keyboard, swipe
    const lb = $('#lightbox');
    const lbImg = $('img', lb);
    const photos = $$('[data-lightbox]:not([data-dup])').map((a) => a.href);
    let cur = 0;
    const showPhoto = (i) => {
        cur = (i + photos.length) % photos.length;
        lbImg.classList.remove('swap'); void lbImg.offsetWidth; lbImg.classList.add('swap');
        lbImg.src = photos[cur];
        $('.lb-count', lb).textContent = `${cur + 1} / ${photos.length}`;
    };
    const closeLb = () => { lb.hidden = true; document.body.style.overflow = ''; };
    $$('[data-lightbox]').forEach((a) => a.addEventListener('click', (e) => {
        e.preventDefault();
        lb.hidden = false; document.body.style.overflow = 'hidden';
        showPhoto(Number(a.dataset.index || 0));
    }));
    $('.lb-prev', lb)?.addEventListener('click', (e) => { e.stopPropagation(); showPhoto(cur - 1); });
    $('.lb-next', lb)?.addEventListener('click', (e) => { e.stopPropagation(); showPhoto(cur + 1); });
    lbImg?.addEventListener('click', (e) => e.stopPropagation());
    lb?.addEventListener('click', closeLb);
    addEventListener('keydown', (e) => {
        if (!lb || lb.hidden) return;
        if (e.key === 'Escape') closeLb();
        if (e.key === 'ArrowLeft') showPhoto(cur - 1);
        if (e.key === 'ArrowRight') showPhoto(cur + 1);
    });
    let touchX = null;
    lb?.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    lb?.addEventListener('touchend', (e) => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 40) showPhoto(cur + (dx < 0 ? 1 : -1));
        touchX = null;
    });

    // Carousel galeri: item aktif, titik indikator, tombol, autoplay
    $$('[data-carousel]').forEach((car) => {
        const track = $('.g-track', car), items = $$('.g-item', car), dots = $$('.g-dots i', car);
        let active = 0, timer;
        const setActive = (i) => {
            active = i;
            items.forEach((it, k) => it.classList.toggle('active', k === i));
            dots.forEach((d, k) => d.classList.toggle('on', k === i));
        };
        const go = (i) => {
            const it = items[(i + items.length) % items.length];
            track.scrollTo({ left: it.offsetLeft - (track.clientWidth - it.clientWidth) / 2, behavior: 'smooth' });
        };
        const io = new IntersectionObserver((entries) => entries.forEach((e) => {
            if (e.isIntersecting) setActive(items.indexOf(e.target));
        }), { root: track, threshold: 0.6 });
        items.forEach((it) => io.observe(it));
        setActive(0);
        $('.prev', car).addEventListener('click', () => go(active - 1));
        $('.next', car).addEventListener('click', () => go(active + 1));
        dots.forEach((d, k) => d.addEventListener('click', () => go(k)));
        const auto = () => { clearInterval(timer); if (!REDUCED) timer = setInterval(() => document.body.classList.contains('opened') && go(active + 1), 4000); };
        ['pointerdown', 'touchstart', 'wheel'].forEach((ev) => track.addEventListener(ev, () => { clearInterval(timer); setTimeout(auto, 6000); }, { passive: true }));
        auto();
    });

    // RSVP & ucapan (AJAX)
    const form = $('#wishForm');
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = $('button', form), msg = $('.form-msg', form);
        const data = Object.fromEntries(new FormData(form));
        const render = (w) => {
            const d = el('div');
            d.className = 'wish new';
            d.innerHTML = `<b></b> <span class="badge"></span><p></p><small></small>`;
            d.querySelector('b').textContent = w.name;
            d.querySelector('.badge').textContent = w.attendance;
            d.querySelector('p').textContent = w.message;
            d.querySelector('small').textContent = w.time;
            $('#wishList').prepend(d);
        };
        btn.disabled = true;
        try {
            if (!form.dataset.url) {
                render({ name: data.name, attendance: form.attendance.selectedOptions[0].text, message: data.message, time: 'baru saja (preview)' });
            } else {
                const res = await fetch(form.dataset.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').content },
                    body: JSON.stringify(data),
                });
                if (!res.ok) throw new Error(res.status === 429 ? 'Terlalu banyak percobaan, coba lagi nanti.' : 'Gagal mengirim, periksa isian Anda.');
                render(await res.json());
            }
            form.message.value = '';
            msg.hidden = false; msg.textContent = 'Terima kasih atas ucapan & konfirmasinya!';
        } catch (err) {
            msg.hidden = false; msg.textContent = err.message;
        } finally {
            btn.disabled = false;
        }
    });

    // Gambar sampul untuk panel samping desktop
    const coverImg = getComputedStyle(cover).getPropertyValue('--cover-img');
    if (coverImg) $('.side-panel')?.style.setProperty('--side-img', coverImg);

    startAmbient(CFG.ambient);
})();

/* =====================================================================
   Template "Desa Bahagia" - undangan pernikahan berupa desa pixel-art.
   Tamu berjalan dengan tombol arah / WASD / D-pad / ketuk layar, lalu
   membuka isi undangan dengan mengunjungi rumah, balai, lumbung, dsb.
   Semua grafis digambar prosedural di canvas (tanpa aset gambar).
   ===================================================================== */
(() => {
    'use strict';

    const CFG = window.FARM || {};
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];

    const TS = 16, W = 30, H = 22, MW = W * TS, MH = H * TS;
    const canvas = $('#world');
    const ctx = canvas.getContext('2d');
    let c = ctx; // konteks gambar aktif (dipakai helper R)

    const hash = (x, y, s = 0) => {
        let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0;
        h = Math.imul(h ^ (h >>> 13), 1274126177);
        return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    };
    const rand = (a, b) => a + Math.random() * (b - a);
    const R = (col, x, y, w, h) => { c.fillStyle = col; c.fillRect(x, y, w, h); };

    /* =====================================================================
       Peta
       ===================================================================== */
    const GRASS = 0, FLOWER = 1, PATH = 2, WATER = 3, SOIL = 4, CARPET = 5;
    const tile = new Uint8Array(W * H);
    const solid = new Uint8Array(W * H);
    const fence = new Uint8Array(W * H);
    const id = (x, y) => y * W + x;
    const inMap = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
    const tileAt = (x, y) => (inMap(x, y) ? tile[id(x, y)] : -1);
    const fill = (x, y, w, h, v) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (inMap(i, j)) tile[id(i, j)] = v; };
    const block = (x, y, w = 1, h = 1) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (inMap(i, j)) solid[id(i, j)] = 1; };
    const isSolid = (x, y) => !inMap(x, y) || solid[id(x, y)] === 1;

    // Desa dibuat ringkas: semua tempat informasi mengelilingi jalan utama (x 14-15)
    const POND = { x: 23, y: 9, w: 5, h: 5 };
    const FIELD = { x: 3, y: 10, w: 5, h: 3 };
    fill(1, 7, 28, 2, PATH);    // jalan atas
    fill(14, 5, 2, 17, PATH);   // jalan utama
    fill(1, 19, 28, 2, PATH);   // jalan bawah
    fill(13, 21, 4, 1, PATH);   // gerbang
    fill(14, 5, 2, 2, CARPET);  // karpet pelaminan
    fill(POND.x, POND.y, POND.w, POND.h, WATER);
    [[0, 0], [POND.w - 1, 0], [0, POND.h - 1], [POND.w - 1, POND.h - 1]].forEach(([a, b]) => (tile[id(POND.x + a, POND.y + b)] = GRASS));
    fill(FIELD.x, FIELD.y, FIELD.w, FIELD.h, SOIL);
    for (let x = FIELD.x - 1; x <= FIELD.x + FIELD.w; x++) { fence[id(x, FIELD.y - 1)] = 1; fence[id(x, FIELD.y + FIELD.h)] = 1; }
    for (let y = FIELD.y - 1; y <= FIELD.y + FIELD.h; y++) { fence[id(FIELD.x - 1, y)] = 1; fence[id(FIELD.x + FIELD.w, y)] = 1; }
    for (let i = 0; i < W * H; i++) {
        if (tile[i] === WATER || fence[i]) solid[i] = 1;
        if (tile[i] === GRASS && hash(i % W, (i / W) | 0, 3) < 0.08) tile[i] = FLOWER;
    }
    block(13, 21, 4, 1); // ujung jalan keluar desa

    /* ---------- Objek (digambar urut y) ---------- */
    const objs = [];      // { y, draw(t) }
    const spots = [];     // tempat yang bisa dikunjungi
    const lights = [];    // sumber cahaya malam { x, y, r, col }
    const trees = [];

    const addTree = (x, y, kind) => {
        if (!inMap(x, y) || solid[id(x, y)] || ![GRASS, FLOWER].includes(tile[id(x, y)])) return;
        block(x, y);
        trees.push([x, y]);
        const k = kind || (hash(x, y, 9) < 0.18 ? 'fruit' : hash(x, y, 5) < 0.25 ? 'pine' : 'oak');
        objs.push({ y: (y + 1) * TS, draw: () => drawTree(x * TS, y * TS, k) });
    };

    const page = (name) => document.querySelector(`[data-page="${name}"]`);
    const addSpot = (o) => {
        // hit: area pemicu (piksel), area: area klik (piksel)
        o.page = o.page && page(o.page) ? o.page : null;
        if (!o.page && !o.line) return;
        o.counted = !!o.page && o.counted !== false;
        o.area = o.area || o.hit;
        spots.push(o);
    };
    const rectT = (x, y, w = 1, h = 1) => ({ x: x * TS, y: y * TS, w: w * TS, h: h * TS });

    /* =====================================================================
       Gambar: medan (pre-render sekali)
       ===================================================================== */
    const terrain = document.createElement('canvas');
    terrain.width = MW; terrain.height = MH;

    const drawTerrain = () => {
        c = terrain.getContext('2d');
        for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
                const t = tile[id(x, y)], X = x * TS, Y = y * TS;
                grass(X, Y, x, y);
                if (t === FLOWER) flowers(X, Y, x, y);
                else if (t === PATH) pathTile(X, Y, x, y, PATH);
                else if (t === CARPET) carpet(X, Y, x, y);
                else if (t === SOIL) soil(X, Y, x, y);
                else if (t === WATER) water(X, Y, x, y);
            }
        }
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (fence[id(x, y)]) fenceTile(x * TS, y * TS, x, y);
        c = ctx;
    };

    function grass(X, Y, x, y) {
        R('#7cc35a', X, Y, TS, TS);
        for (let k = 0; k < 6; k++) R('#6aae49', X + ((hash(x, y, k) * 16) | 0), Y + ((hash(x, y, k + 20) * 16) | 0), 1, 1);
        for (let k = 0; k < 3; k++) {
            const bx = X + ((hash(x, y, k + 40) * 14) | 0), by = Y + ((hash(x, y, k + 60) * 13) | 0);
            R('#96d872', bx, by, 1, 2); R('#96d872', bx + 2, by + 1, 1, 2);
        }
    }
    function flowers(X, Y, x, y) {
        const cols = ['#ff6b8a', '#ffffff', '#ffd34d', '#b48cff', '#ff9f43'];
        for (let k = 0; k < 3; k++) {
            const fx = X + 2 + ((hash(x, y, k + 80) * 11) | 0), fy = Y + 2 + ((hash(x, y, k + 90) * 11) | 0);
            const col = cols[(hash(x, y, k + 99) * cols.length) | 0];
            R('#4f9d3a', fx + 1, fy + 2, 1, 2);
            R(col, fx, fy, 3, 1); R(col, fx + 1, fy - 1, 1, 3); R('#fff3b0', fx + 1, fy, 1, 1);
        }
    }
    function pathTile(X, Y, x, y, kind) {
        R('#e2c48e', X, Y, TS, TS);
        for (let k = 0; k < 5; k++) R(k % 2 ? '#c9a46b' : '#f2dcae', X + ((hash(x, y, k + 7) * 15) | 0), Y + ((hash(x, y, k + 17) * 15) | 0), 2, 1);
        const edge = (nx, ny) => { const t = tileAt(nx, ny); return t !== PATH && t !== CARPET && t !== -1; };
        // tepian rumput yang tidak rata
        if (edge(x, y - 1)) for (let i = 0; i < 16; i += 2) R('#7cc35a', X + i, Y, 2, 1 + ((hash(x, y, i) * 2.5) | 0));
        if (edge(x, y + 1)) for (let i = 0; i < 16; i += 2) { const h = 1 + ((hash(x, y, i + 3) * 2.5) | 0); R('#7cc35a', X + i, Y + 16 - h, 2, h); }
        if (edge(x - 1, y)) for (let i = 0; i < 16; i += 2) R('#7cc35a', X, Y + i, 1 + ((hash(x, y, i + 5) * 2.5) | 0), 2);
        if (edge(x + 1, y)) for (let i = 0; i < 16; i += 2) { const w = 1 + ((hash(x, y, i + 9) * 2.5) | 0); R('#7cc35a', X + 16 - w, Y + i, w, 2); }
    }
    function carpet(X, Y, x, y) {
        R('#c8323c', X, Y, TS, TS);
        R('#a82630', X, Y + 7, TS, 1);
        if (tileAt(x - 1, y) !== CARPET) R('#f2c14e', X, Y, 2, TS);
        if (tileAt(x + 1, y) !== CARPET) R('#f2c14e', X + 14, Y, 2, TS);
        if ((x + y) % 2) { R('#f48fb1', X + 6, Y + 3, 2, 2); R('#fff', X + 10, Y + 11, 1, 1); }
    }
    function soil(X, Y, x, y) {
        R('#8a5a33', X, Y, TS, TS);
        for (let i = 2; i < 16; i += 5) R('#74492a', X, Y + i, TS, 2);
        const row = (y - FIELD.y) * 2;
        if (row === 0) { // tomat
            for (const ox of [2, 9]) { R('#3f8f35', X + ox, Y + 4, 5, 6); R('#5bb34a', X + ox + 1, Y + 3, 3, 3); R('#e53935', X + ox + 1, Y + 6, 2, 2); R('#e53935', X + ox + 3, Y + 8, 1, 1); }
        } else if (row === 2) { // kubis
            for (const ox of [1, 9]) { R('#4e9a3e', X + ox, Y + 5, 6, 6); R('#9fdc7c', X + ox + 1, Y + 6, 4, 4); R('#c8f0a8', X + ox + 2, Y + 7, 2, 2); }
        } else if (row === 4) { // tunas
            for (const ox of [3, 11]) { R('#5bb34a', X + ox, Y + 6, 1, 4); R('#7fd35f', X + ox - 2, Y + 5, 2, 2); R('#7fd35f', X + ox + 1, Y + 4, 2, 2); }
        }
    }
    function water(X, Y, x, y) {
        R('#4ba3e3', X, Y, TS, TS);
        const shore = (nx, ny) => tileAt(nx, ny) !== WATER;
        if (shore(x, y - 1)) { R('#e8d29a', X, Y, TS, 3); R('#3a86c4', X, Y + 3, TS, 2); }
        if (shore(x, y + 1)) R('#e8d29a', X, Y + 13, TS, 3);
        if (shore(x - 1, y)) R('#e8d29a', X, Y, 3, TS);
        if (shore(x + 1, y)) R('#e8d29a', X + 13, Y, 3, TS);
    }
    function fenceTile(X, Y, x, y) {
        const f = (nx, ny) => inMap(nx, ny) && fence[id(nx, ny)];
        if (f(x + 1, y)) { R('#8d5b33', X + 8, Y + 6, 16, 2); R('#8d5b33', X + 8, Y + 11, 16, 2); R('#6b4226', X + 8, Y + 13, 16, 1); }
        if (f(x, y + 1)) { R('#8d5b33', X + 7, Y + 8, 2, 16); }
        R('#6b4226', X + 6, Y + 3, 4, 12);
        R('#b07a4a', X + 6, Y + 3, 3, 2);
        R('rgba(0,0,0,.15)', X + 6, Y + 15, 5, 1);
    }

    /* =====================================================================
       Gambar: objek
       ===================================================================== */
    function shadow(x, y, w) { R('rgba(0,0,0,.18)', x - w / 2 + 1, y - 2, w - 2, 3); R('rgba(0,0,0,.18)', x - w / 2, y - 1, w, 1); }

    function drawTree(X, Y, kind) {
        shadow(X + 8, Y + 16, 16);
        R('#7a4b2a', X + 6, Y + 6, 4, 10); R('#5e3920', X + 9, Y + 6, 1, 10); R('#5e3920', X + 5, Y + 14, 6, 2);
        if (kind === 'pine') {
            for (let i = 0; i < 4; i++) {
                const w = 6 + i * 4, y0 = Y - 14 + i * 5;
                R('#1f6b3a', X + 8 - w / 2, y0, w, 6); R('#2e8b4e', X + 8 - w / 2 + 1, y0, w - 4, 3);
            }
            R('#56b36f', X + 6, Y - 12, 2, 2);
            return;
        }
        R('#2e7d32', X + 2, Y - 14, 12, 2);
        R('#2e7d32', X, Y - 12, 16, 15);
        R('#2e7d32', X - 2, Y - 9, 20, 10);
        R('#2e7d32', X + 1, Y + 3, 14, 2);
        R('#43a047', X + 1, Y - 12, 12, 11);
        R('#43a047', X - 1, Y - 8, 9, 7);
        R('#66bb6a', X + 3, Y - 11, 5, 3); R('#66bb6a', X, Y - 6, 3, 2); R('#66bb6a', X + 10, Y - 8, 3, 2);
        R('#1b5e20', X + 2, Y + 4, 12, 1);
        if (kind === 'fruit') [[3, -5], [10, -2], [6, -9], [12, -10], [1, 0]].forEach(([a, b]) => { R('#e53935', X + a, Y + b, 2, 2); R('#ff8a80', X + a, Y + b, 1, 1); });
    }

    // [baris, x, lebar]
    const HEART_S = [[0, 1, 1], [0, 3, 1], [1, 0, 5], [2, 1, 3], [3, 2, 1]];
    const HEART_B = [[0, 1, 2], [0, 4, 2], [1, 0, 7], [2, 0, 7], [3, 1, 5], [4, 2, 3], [5, 3, 1]];
    function heart(x, y, col, big) {
        (big ? HEART_B : HEART_S).forEach(([r, a, w]) => R(col, x + a, y + r, w, 1));
    }

    /* --- Rumah --- */
    function drawHouse(o, t, night) {
        const { X, Y, Wp, Hp } = o, roofH = 34;
        shadow(X + Wp / 2, Y + Hp + 2, Wp + 4);
        // dinding
        R(o.wallD, X + 2, Y + roofH - 6, Wp - 4, Hp - roofH + 6);
        R(o.wall, X + 3, Y + roofH - 6, Wp - 6, Hp - roofH + 3);
        for (let yy = Y + roofH - 1; yy < Y + Hp - 4; yy += 5) R(o.wallD, X + 3, yy, Wp - 6, 1);
        R(o.trim, X + 2, Y + roofH - 6, 3, Hp - roofH + 6); R(o.trim, X + Wp - 5, Y + roofH - 6, 3, Hp - roofH + 6);
        R('#9e9e9e', X + 1, Y + Hp - 3, Wp - 2, 3); R('#bdbdbd', X + 1, Y + Hp - 3, Wp - 2, 1);
        // atap
        R(o.roofD, X - 3, Y + 2, Wp + 6, roofH - 2);
        R(o.roof, X - 2, Y + 2, Wp + 4, roofH - 6);
        for (let i = 0, yy = Y + 7; yy < Y + roofH - 4; yy += 5, i++) {
            R(o.roofD, X - 2, yy, Wp + 4, 1);
            for (let xx = X - 2 + (i % 2) * 4; xx < X + Wp + 2; xx += 8) R(o.roofD, xx, yy - 4, 1, 4);
        }
        R(o.roofL, X + 1, Y, Wp - 2, 3);
        R(o.roofL, X - 2, Y + 3, Wp + 4, 1);
        R('rgba(0,0,0,.22)', X + 3, Y + roofH - 4, Wp - 6, 3);
        // cerobong
        if (o.chimney) {
            const cx = X + Wp - 22;
            R('#8d6e63', cx, Y - 8, 8, 14); R('#6d4c41', cx + 6, Y - 8, 2, 14); R('#5d4037', cx - 1, Y - 10, 10, 3);
        }
        // jendela
        o.windows.forEach((wx) => {
            const wy = Y + roofH + 3;
            R(o.trim, wx - 1, wy - 1, 14, 12);
            R(night ? '#ffe28a' : '#9ad7ff', wx, wy, 12, 10);
            if (!night) R('#d8f1ff', wx + 1, wy + 1, 3, 2);
            R(o.trim, wx + 5, wy, 2, 10); R(o.trim, wx, wy + 4, 12, 2);
            R('#8d5524', wx - 1, wy + 11, 14, 3);
            for (let k = 0; k < 4; k++) R(['#ff6b8a', '#ffd34d', '#ff6b8a', '#fff'][k], wx + 1 + k * 3, wy + 9, 2, 2);
        });
        // pintu
        o.doors.forEach((dx) => {
            const dy = Y + Hp - 22;
            R(o.trim, dx + 1, dy - 1, 14, 21);
            R('#7b4a26', dx + 2, dy, 12, 19);
            R('#9a6234', dx + 3, dy + 1, 4, 17); R('#9a6234', dx + 9, dy + 1, 4, 17);
            R('#ffd54f', dx + 11, dy + 10, 1, 2);
            if (o.heart) heart(dx + 5, dy - 7, '#e63946');
        });
        if (o.extra) o.extra(t, night);
    }

    /* --- Lumbung foto --- */
    function drawBarn(o, t, night) {
        const { X, Y, Wp, Hp } = o;
        shadow(X + Wp / 2, Y + Hp + 2, Wp + 4);
        R('#8e2424', X + 1, Y + 26, Wp - 2, Hp - 26);
        R('#c62828', X + 3, Y + 26, Wp - 6, Hp - 29);
        for (let xx = X + 7; xx < X + Wp - 4; xx += 6) R('#a52222', xx, Y + 26, 1, Hp - 29);
        R('#fff3e0', X + 1, Y + 26, 3, Hp - 26); R('#fff3e0', X + Wp - 4, Y + 26, 3, Hp - 26);
        R('#9e9e9e', X, Y + Hp - 3, Wp, 3);
        // atap
        R('#5d2a1a', X - 3, Y + 2, Wp + 6, 28);
        R('#7b3a24', X - 2, Y + 2, Wp + 4, 24);
        for (let yy = Y + 6; yy < Y + 26; yy += 5) R('#5d2a1a', X - 2, yy, Wp + 4, 1);
        R('#9c4a30', X + 2, Y, Wp - 4, 3);
        // jendela loteng bundar dengan bingkai foto
        const cx = X + Wp / 2;
        R('#fff3e0', cx - 9, Y + 9, 18, 14); R(night ? '#ffe28a' : '#ffd8a8', cx - 7, Y + 11, 14, 10);
        heart(cx - 3, Y + 14, '#e63946', true);
        // pintu besar
        const dx = o.doors[0], dw = 48, dy = Y + Hp - 30;
        R('#fff3e0', dx, dy, dw, 27);
        R('#a52222', dx + 3, dy + 3, dw / 2 - 4, 24); R('#a52222', dx + dw / 2 + 1, dy + 3, dw / 2 - 4, 24);
        for (let i = 0; i < 20; i++) {
            R('#fff3e0', dx + 3 + i, dy + 3 + i * 1.2 | 0, 2, 2); R('#fff3e0', dx + dw / 2 - 3 - i, dy + 3 + i * 1.2 | 0, 2, 2);
            R('#fff3e0', dx + dw / 2 + 1 + i, dy + 3 + i * 1.2 | 0, 2, 2); R('#fff3e0', dx + dw - 3 - i, dy + 3 + i * 1.2 | 0, 2, 2);
        }
        // jerami
        [[X - 10, Y + Hp - 10], [X + Wp + 2, Y + Hp - 10], [X + Wp + 2, Y + Hp - 20]].forEach(([hx, hy]) => {
            R('#c99a2e', hx, hy, 12, 10); R('#e9c46a', hx + 1, hy + 1, 10, 6); R('#b0841f', hx, hy + 4, 12, 1);
        });
    }

    /* --- Pelaminan (gapura bunga) --- */
    function drawArch(X, Y, t, night) {
        // pagar tanaman di belakang
        R('#2e7d32', X, Y + 14, 128, 34);
        for (let i = 0; i < 128; i += 8) { R('#2e7d32', X + i + 1, Y + 11, 6, 3); R('#43a047', X + i + 2, Y + 13, 4, 3); }
        for (let i = 0; i < 128; i += 11) R(['#f48fb1', '#fff', '#ffd34d'][i % 3], X + i + 3, Y + 22 + (i % 7), 2, 2);
        // panggung
        R('#d4a24c', X + 18, Y + 38, 92, 26);
        R('#f5e6c8', X + 20, Y + 38, 88, 22);
        for (let i = 0; i < 88; i += 8) R('#ead6ae', X + 20 + i, Y + 38, 1, 22);
        // tiang
        [X + 20, X + 102].forEach((px) => {
            R('#e8e0d0', px, Y + 4, 6, 56); R('#ffffff', px + 1, Y + 4, 3, 56);
            for (let k = 0; k < 56; k += 6) { R('#43a047', px + (k % 12 ? 4 : -1), Y + 6 + k, 3, 3); R('#f06292', px + (k % 12 ? -1 : 4), Y + 9 + k, 3, 3); }
        });
        // lengkung bunga
        const cx = X + 64, cy = Y + 8, rx = 41, ry = 22;
        for (let i = 0; i <= 26; i++) {
            const a = Math.PI * (i / 26);
            const fx = Math.round(cx - Math.cos(a) * rx), fy = Math.round(cy - Math.sin(a) * ry) + 4;
            R('#388e3c', fx - 2, fy, 6, 4);
            R(['#f06292', '#ffffff', '#f8bbd0', '#ff8a65'][i % 4], fx - 1, fy - 1, 4, 4);
            R('#fff59d', fx, fy, 2, 2);
            if (night && i % 3 === 0) R('#fff8c4', fx + 1, fy + 4, 1, 1);
        }
        heart(cx - 3, cy - 16 + Math.round(Math.sin(t * 3)), '#e63946', true);
        // vas bunga
        [X + 32, X + 86].forEach((vx) => {
            R('#b0855a', vx, Y + 50, 10, 10); R('#d4a77a', vx + 1, Y + 50, 3, 10);
            R('#43a047', vx - 2, Y + 42, 14, 9);
            for (let k = 0; k < 5; k++) R(['#f06292', '#fff', '#ffd34d', '#f8bbd0', '#ff8a65'][k], vx - 1 + k * 3, Y + 40 + (k % 2) * 4, 3, 3);
        });
    }

    /* --- Benda kecil --- */
    function drawBoard(X, Y) {
        shadow(X + 16, Y + 16, 30);
        R('#5d4037', X + 3, Y - 6, 3, 22); R('#5d4037', X + 26, Y - 6, 3, 22);
        R('#5d4037', X, Y - 14, 32, 19); R('#8d6e63', X + 1, Y - 13, 30, 16);
        R('#a1887f', X - 2, Y - 17, 36, 4); R('#6d4c41', X - 2, Y - 14, 36, 1);
        R('#fff8e1', X + 4, Y - 11, 10, 12); for (let i = 0; i < 4; i++) R('#bcaaa4', X + 6, Y - 8 + i * 2, 6, 1);
        R('#f8bbd0', X + 16, Y - 11, 12, 9); heart(X + 19, Y - 9, '#e63946');
        R('#e53935', X + 8, Y - 12, 2, 2); R('#43a047', X + 21, Y - 12, 2, 2);
        R('#fff59d', X + 17, Y - 1, 10, 2);
    }
    function drawChest(X, Y, t, open) {
        shadow(X + 8, Y + 15, 14);
        R('#5d3a1a', X + 1, Y + 4, 14, 11);
        R('#8d5524', X + 2, Y + 7, 12, 7);
        R(open ? '#5d3a1a' : '#a0522d', X + 1, Y + (open ? 0 : 2), 14, 5);
        R('#ffca28', X + 1, Y + 7, 14, 1); R('#ffca28', X + 7, Y + 6, 2, 4); R('#ffca28', X + 1, Y + 4, 1, 11); R('#ffca28', X + 14, Y + 4, 1, 11);
    }
    function drawMailbox(X, Y, t, flagUp) {
        shadow(X + 8, Y + 16, 10);
        R('#6d4c41', X + 7, Y + 3, 2, 13);
        R('#b71c1c', X + 2, Y - 3, 12, 8); R('#e53935', X + 3, Y - 4, 10, 8); R('#ef5350', X + 4, Y - 4, 8, 1);
        R('#7f0000', X + 4, Y, 7, 1);
        const fy = flagUp ? Y - 9 + Math.round(Math.sin(t * 6)) : Y - 1;
        R('#5d4037', X + 13, fy, 1, 7); R('#ffd54f', X + 14, fy, 3, 3);
    }
    function drawSign(X, Y) {
        shadow(X + 8, Y + 16, 10);
        R('#6d4c41', X + 7, Y + 4, 2, 12);
        R('#5d4037', X, Y - 4, 16, 10); R('#a1887f', X + 1, Y - 3, 14, 8);
        R('#6d4c41', X + 3, Y - 1, 7, 1); R('#6d4c41', X + 3, Y + 2, 9, 1);
        heart(X + 10, Y - 2, '#e63946');
    }
    function drawWell(X, Y) {
        shadow(X + 8, Y + 16, 16);
        R('#6d4c41', X + 1, Y - 12, 2, 20); R('#6d4c41', X + 13, Y - 12, 2, 20);
        R('#8d3b2a', X - 2, Y - 16, 20, 5); R('#b5523a', X - 1, Y - 16, 18, 2);
        R('#5d4037', X + 3, Y - 9, 10, 1); R('#bcaaa4', X + 7, Y - 8, 1, 6); R('#795548', X + 6, Y - 3, 3, 3);
        R('#757575', X, Y + 4, 16, 11); R('#9e9e9e', X + 1, Y + 4, 14, 9);
        for (let i = 0; i < 16; i += 5) R('#616161', X + i, Y + 8, 1, 4);
        R('#3a86c4', X + 2, Y + 3, 12, 3); R('#616161', X, Y + 2, 16, 1);
    }
    function drawLamp(X, Y, night) {
        shadow(X + 8, Y + 16, 8);
        R('#37474f', X + 7, Y - 10, 2, 26); R('#263238', X + 5, Y + 13, 6, 3);
        R('#263238', X + 4, Y - 16, 8, 2); R(night ? '#ffe28a' : '#fff3c4', X + 5, Y - 14, 6, 5); R('#263238', X + 5, Y - 9, 6, 1);
    }
    function drawCoop(X, Y) {
        shadow(X + 24, Y + 32, 46);
        R('#6d4c41', X + 2, Y + 14, 44, 18); R('#a1887f', X + 3, Y + 14, 42, 15);
        for (let xx = X + 6; xx < X + 44; xx += 5) R('#8d6e63', xx, Y + 14, 1, 15);
        R('#4e342e', X + 18, Y + 20, 12, 12); R('#3e2723', X + 19, Y + 21, 10, 11);
        R('#bf6a2a', X - 2, Y + 2, 52, 14); R('#d9853b', X - 1, Y + 2, 50, 10); R('#bf6a2a', X - 1, Y + 7, 50, 1);
        R('#e9a35a', X + 2, Y, 44, 3);
        R('#e9c46a', X + 34, Y + 26, 9, 4);
    }
    function drawScarecrow(X, Y, t) {
        const sw = Math.round(Math.sin(t * 1.5));
        R('#6d4c41', X + 7, Y - 6, 2, 22);
        R('#6d4c41', X - 1, Y - 4, 18, 2);
        R('#5c8dd6', X + 3, Y - 6, 10, 10); R('#e9c46a', X - 2 + sw, Y - 4, 3, 3); R('#e9c46a', X + 15 + sw, Y - 4, 3, 3);
        R('#f5deb3', X + 4, Y - 14, 8, 8); R('#222', X + 6, Y - 11, 1, 1); R('#222', X + 9, Y - 11, 1, 1);
        R('#c99a2e', X + 1, Y - 15, 14, 2); R('#e9c46a', X + 4, Y - 19, 8, 4);
    }
    function drawGate(X, Y, t) {
        const w = 64;
        [X + 4, X + w - 10].forEach((px) => { R('#5d4037', px, Y - 26, 6, 40); R('#8d6e63', px + 1, Y - 26, 2, 40); });
        R('#5d4037', X, Y - 32, w, 8); R('#a1887f', X + 1, Y - 31, w - 2, 5);
        for (let i = 0; i < w; i += 6) { R('#43a047', X + i, Y - 35, 5, 4); R(['#f06292', '#fff', '#ffd34d'][(i / 6) % 3], X + i + 1, Y - 36, 2, 2); }
        heart(X + w / 2 - 4, Y - 30, '#e63946', true);
    }
    function drawBench(X, Y) {
        shadow(X + 12, Y + 14, 22);
        R('#6d4c41', X + 2, Y + 6, 2, 8); R('#6d4c41', X + 20, Y + 6, 2, 8);
        R('#8d5b33', X, Y + 4, 24, 3); R('#a9713f', X, Y + 4, 24, 1);
        R('#8d5b33', X, Y - 3, 24, 3); R('#6d4c41', X + 2, Y - 3, 2, 8); R('#6d4c41', X + 20, Y - 3, 2, 8);
    }

    /* --- Pohon kenangan (sakura) --- */
    function drawBlossom(X, Y, t) {
        shadow(X + 24, Y + 48, 44);
        R('#6d4126', X + 19, Y + 22, 10, 26); R('#4e2e1a', X + 26, Y + 22, 3, 26);
        R('#6d4126', X + 14, Y + 44, 20, 4); R('#6d4126', X + 12, Y + 26, 8, 3); R('#6d4126', X + 28, Y + 24, 8, 3);
        heart(X + 21, Y + 32, '#f48fb1');
        const blobs = [[-6, -2, 60, 26], [-2, -10, 52, 10], [4, -16, 40, 8], [-8, 6, 64, 14], [0, 18, 48, 6]];
        blobs.forEach(([a, b, w, h]) => R('#e46a9a', X + a, Y + b, w, h));
        blobs.forEach(([a, b, w, h]) => R('#f48fb1', X + a + 2, Y + b, w - 4, h - 3));
        for (let k = 0; k < 24; k++) {
            const px = X - 4 + ((hash(k, 1, 77) * 54) | 0), py = Y - 14 + ((hash(k, 2, 77) * 34) | 0);
            R(k % 3 ? '#f8bbd0' : '#ffffff', px, py, 2, 2);
        }
        [[6, 20], [38, 22], [24, 26]].forEach(([a, b], i) => heart(X + a, Y + b + Math.round(Math.sin(t * 2 + i)), '#e63946'));
    }

    /* --- Karakter --- */
    const LOOK = {
        player: { skin: '#f5c9a0', hair: '#6b3f22', shirt: '#e85a4f', pants: '#3f6fd8', shoes: '#5d4037', hat: true, overall: true },
        groom: { skin: '#e8b88f', hair: '#1f1a17', shirt: '#2b3440', pants: '#232a33', shoes: '#111', peci: true, collar: true },
        bride: { skin: '#f1c6a4', hair: '#3e2723', dress: '#fffaf2', veil: true },
    };

    function drawPerson(x, y, dir, step, L) {
        x = Math.round(x); y = Math.round(y);
        const o = x - 6, t = y - 21;
        const P = (col, a, b, w, h) => R(col, o + a, t + b, w, h);
        const side = dir === 'left' || dir === 'right';
        const walk = step % 2 === 1, alt = step === 3;
        shadow(x, y + 1, 11);

        if (L.veil && dir !== 'up') P('rgba(255,255,255,.7)', 0, 2, 12, 14);
        if (L.veil && dir === 'up') P('rgba(255,255,255,.8)', 1, 1, 10, 17);

        if (L.dress) {
            const widths = [8, 8, 9, 10, 10, 11, 12, 12];
            widths.forEach((w, r) => P(r === 7 ? '#e9dfd0' : L.dress, 6 - Math.floor(w / 2) + (walk && r > 4 ? (alt ? -1 : 1) : 0), 13 + r, w, 1));
            P(L.dress, 3, 9, 6, 4);
            P('#efe6d8', 3, 12, 6, 1);
            P(L.skin, 2, 10, 1, 3); P(L.skin, 9, 10, 1, 3);
            if (dir === 'down') { P('#43a047', 4, 13, 4, 2); P('#f06292', 4, 12, 2, 2); P('#e53935', 6, 12, 2, 2); P('#fff', 5, 11, 2, 1); }
        } else {
            // kaki
            if (side) {
                const a = walk ? 3 : 4, b = walk ? 7 : 6;
                P(L.pants, a, 16, 2, 3); P(L.pants, b, 16, 2, 3);
                P(L.shoes, a + (dir === 'right' ? 0 : -1), 19, 3, 2); P(L.shoes, b + (dir === 'right' ? 0 : -1), 19, 3, 2);
            } else {
                const la = walk && !alt ? 1 : 0, lb = walk && alt ? 1 : 0;
                P(L.pants, 3, 16, 2, 3 - la); P(L.pants, 7, 16, 2, 3 - lb);
                P(L.shoes, 3, 19 - la, 2, 2); P(L.shoes, 7, 19 - lb, 2, 2);
            }
            // badan
            P(L.shirt, 2, 9, 8, 7);
            if (L.overall) {
                P(L.pants, 3, 12, 6, 5);
                if (dir === 'down') { P(L.pants, 3, 9, 1, 3); P(L.pants, 8, 9, 1, 3); P('#ffd54f', 3, 12, 1, 1); P('#ffd54f', 8, 12, 1, 1); P('#2c55b0', 5, 13, 2, 2); }
                if (dir === 'up') { P(L.pants, 3, 9, 1, 3); P(L.pants, 8, 9, 1, 3); }
            }
            if (L.collar && dir === 'down') { P('#ffffff', 5, 9, 2, 4); P('#b71c1c', 5, 10, 2, 3); P('#d4af37', 3, 11, 1, 1); }
            // lengan
            const sw = walk ? (alt ? 1 : -1) : 0;
            if (side) {
                P(L.shirt, 5 + sw, 10, 2, 4); P(L.skin, 5 + sw, 14, 2, 1);
            } else {
                P(L.shirt, 1, 9 + sw, 1, 5); P(L.shirt, 10, 9 - sw, 1, 5);
                P(L.skin, 1, 14 + sw, 1, 1); P(L.skin, 10, 14 - sw, 1, 1);
            }
        }

        // kepala
        P(L.skin, 2, 1, 8, 8);
        const longHair = !!L.dress;
        if (dir === 'down') {
            P(L.hair, 2, 0, 8, 3); P(L.hair, 1, 1, 1, longHair ? 9 : 5); P(L.hair, 10, 1, 1, longHair ? 9 : 5); P(L.hair, 3, 3, 2, 1);
            P('#2b1b12', 4, 5, 1, 2); P('#2b1b12', 7, 5, 1, 2);
            P('rgba(255,110,110,.45)', 3, 7, 1, 1); P('rgba(255,110,110,.45)', 8, 7, 1, 1);
        } else if (dir === 'up') {
            P(L.hair, 1, 0, 10, longHair ? 12 : 8);
        } else {
            const back = dir === 'left' ? 6 : 1, eye = dir === 'left' ? 3 : 8;
            P(L.hair, 2, 0, 8, 3); P(L.hair, back, 1, 5, longHair ? 10 : 6);
            P('#2b1b12', eye, 5, 1, 2); P('rgba(255,110,110,.45)', eye, 7, 1, 1);
        }
        if (L.hat) {
            P('#c99a3a', 0, 4, 12, 1); P('#e9c46a', 0, 3, 12, 1);
            P('#e9c46a', 3, -1, 6, 4); P('#f3d98a', 4, -1, 2, 1); P('#e63946', 3, 2, 6, 1);
        }
        if (L.peci) { P('#151515', 2, -1, 8, 3); P('#2a2a2a', 3, -1, 6, 1); }
        if (L.veil) { P('#ffffff', 2, 0, 8, 1); P('#f48fb1', 3, -1, 1, 1); P('#fff59d', 6, -1, 1, 1); P('#f48fb1', 8, -1, 1, 1); }
    }

    function drawChicken(ch, t) {
        const x = Math.round(ch.x), y = Math.round(ch.y);
        shadow(x, y + 1, 8);
        c.save(); c.translate(x, y); c.scale(ch.dir, 1);
        const pk = ch.peck > 0 ? 3 : 0, bob = ch.moving ? Math.round(Math.sin(t * 18)) : 0;
        R('#ffa000', -2, -2, 1, 2); R('#ffa000', 1, -2, 1, 2);
        R('#f5f5f5', -4, -7 + bob, 8, 5); R('#e0e0e0', -2, -6 + bob, 4, 2);
        R('#f5f5f5', -6, -9 + bob, 2, 4);
        R('#f5f5f5', 2, -10 + pk + bob, 4, 4); R('#e53935', 3, -11 + pk + bob, 2, 1); R('#e53935', 5, -7 + pk + bob, 1, 1);
        R('#222', 4, -9 + pk + bob, 1, 1); R('#ffb300', 6, -9 + pk + bob, 1, 1);
        c.restore();
    }
    function drawDuck(d, t) {
        const x = Math.round(d.x), y = Math.round(d.y);
        R('rgba(255,255,255,.35)', x - 6, y, 12, 1);
        c.save(); c.translate(x, y); c.scale(d.dir, 1);
        R('#fff8e1', -5, -5, 9, 5); R('#f5e6c0', -3, -4, 4, 2);
        R('#fff8e1', 2, -9, 4, 5); R('#ff9800', 6, -7, 2, 1); R('#222', 4, -8, 1, 1);
        c.restore();
    }

    /* =====================================================================
       Penataan desa
       ===================================================================== */
    const groomName = CFG.groom || 'Mempelai Pria';
    const brideName = CFG.bride || 'Mempelai Wanita';

    const house = (tx, ty, w, h, opt) => {
        block(tx, ty, w, h);
        const o = { X: tx * TS, Y: ty * TS, Wp: w * TS, Hp: h * TS, chimney: true, trim: '#fff3e0', ...opt };
        o.doors = opt.doors.map((d) => d * TS);
        o.windows = opt.windows.map((wx) => Math.round(wx * TS) + 2);
        objs.push({ y: (ty + h) * TS, draw: (t, n) => (opt.barn ? drawBarn : drawHouse)(o, t, n) });
        o.windows.forEach((wx) => lights.push({ x: wx + 6, y: o.Y + 39, r: 26 }));
        if (o.chimney && !opt.barn) smokers.push({ x: o.X + o.Wp - 18, y: o.Y - 10 });
        return o;
    };
    const smokers = [];

    // Rumah mempelai pria & wanita
    house(3, 2, 6, 5, { doors: [5], windows: [3.6, 6.9], heart: true, wall: '#f3e2c0', wallD: '#d9c39a', roof: '#3f7fd8', roofD: '#2c5aa0', roofL: '#6fa3ec' });
    addSpot({ id: 'groom', page: 'groom', name: `Rumah ${groomName}`, icon: '🏡', hit: rectT(5, 6), area: rectT(3, 2, 6, 5) });
    house(21, 2, 6, 5, { doors: [24], windows: [21.6, 25], heart: true, wall: '#fbe7ec', wallD: '#e8c3cd', roof: '#e0607e', roofD: '#b03f5c', roofL: '#f28fa6' });
    addSpot({ id: 'bride', page: 'bride', name: `Rumah ${brideName}`, icon: '🏠', hit: rectT(24, 6), area: rectT(21, 2, 6, 5) });

    // Pelaminan & pasangan pengantin (di antara kedua rumah)
    block(11, 1, 8, 4);
    objs.push({ y: 4 * TS, draw: (t, n) => drawArch(11 * TS, 1 * TS, t, n) });
    [[12, 2], [17, 2], [14.5, 0.6]].forEach(([lx, ly]) => lights.push({ x: lx * TS + 4, y: ly * TS + 8, r: 30, col: '255,190,220' }));
    const couple = [
        { x: 14 * TS + 8, y: 5 * TS - 2, look: LOOK.groom },
        { x: 15 * TS + 8, y: 5 * TS - 2, look: LOOK.bride },
    ];
    couple.forEach((p, i) => objs.push({ y: p.y, draw: (t) => drawPerson(p.x, p.y - (Math.sin(t * 2 + i) > 0.6 ? 1 : 0), p.dir || 'down', 0, p.look) }));
    addSpot({ id: 'couple', page: 'couple', name: 'Pelaminan', icon: '💐', hit: rectT(14, 4, 2, 1), area: rectT(11, 1, 8, 4) });

    // Papan pengumuman (tepat di sisi jalan utama)
    block(16, 9, 2, 1);
    objs.push({ y: 10 * TS, draw: () => drawBoard(16 * TS, 9 * TS) });
    addSpot({ id: 'board', page: 'board', name: 'Papan Pengumuman', icon: '📌', hit: rectT(16, 9, 2, 1), area: { x: 16 * TS, y: 9 * TS - 18, w: 32, h: 34 } });

    // Pohon kenangan + bangku
    block(19, 12, 3, 1);
    objs.push({ y: 13 * TS, draw: (t) => drawBlossom(19 * TS, 10 * TS, t) });
    addSpot({ id: 'tree', page: 'tree', name: 'Pohon Kenangan', icon: '🌸', hit: rectT(20, 12), area: { x: 19 * TS - 8, y: 9 * TS, w: 64, h: 64 } });
    block(17, 12, 2, 1);
    objs.push({ y: 13 * TS, draw: () => drawBench(17 * TS + 4, 12 * TS) });

    // Peti hadiah
    block(11, 10);
    const chest = { open: false };
    objs.push({ y: 11 * TS, draw: (t) => drawChest(11 * TS, 10 * TS, t, chest.open) });
    addSpot({ id: 'chest', page: 'chest', name: 'Peti Hadiah', icon: '🎁', hit: rectT(11, 10), onOpen: () => (chest.open = true) });

    // Ladang & orang-orangan sawah
    objs.push({ y: (FIELD.y + 2) * TS, draw: (t) => drawScarecrow((FIELD.x + 2) * TS, (FIELD.y + 1) * TS, t) });
    addSpot({ id: 'field', name: 'Ladang', hit: rectT(FIELD.x - 1, FIELD.y - 1, FIELD.w + 2, FIELD.h + 2), line: 'Tomat dan kubisnya tumbuh subur, seperti cinta yang dirawat setiap hari. 🌱' });

    // Balai desa (acara)
    house(2, 14, 8, 5, {
        doors: [5, 6], windows: [3, 7.6], wall: '#efe1c6', wallD: '#d2bf98', roof: '#2e9e88', roofD: '#1f7364', roofL: '#5cc6ad', chimney: false,
        extra: (t) => {
            const fx = 2 * TS + 64;
            R('#5d4037', fx, 14 * TS - 18, 1, 22);
            const wv = Math.round(Math.sin(t * 4));
            R('#e53935', fx + 1, 14 * TS - 18 + wv, 10, 3); R('#ffffff', fx + 1, 14 * TS - 15 + wv, 10, 3);
        },
    });
    addSpot({ id: 'hall', page: 'hall', name: 'Balai Desa', icon: '🏛️', hit: rectT(5, 18, 2, 1), area: rectT(2, 14, 8, 5) });

    // Lumbung foto (galeri)
    house(21, 14, 7, 5, { barn: true, doors: [23], windows: [] });
    addSpot({ id: 'barn', page: 'barn', name: 'Lumbung Foto', icon: '📷', hit: rectT(23, 18, 3, 1), area: rectT(21, 14, 7, 5) });

    // Kandang ayam & sumur
    block(17, 15, 3, 2);
    objs.push({ y: 17 * TS, draw: () => drawCoop(17 * TS, 14 * TS + 8) });
    addSpot({ id: 'coop', name: 'Kandang Ayam', hit: rectT(17, 16, 3, 1), area: rectT(17, 14, 3, 3), line: 'Petok petok! Ayam-ayam ikut berbahagia menyambut hari besar ini. 🐔' });
    block(11, 16);
    objs.push({ y: 17 * TS, draw: () => drawWell(11 * TS, 16 * TS) });
    addSpot({ id: 'well', name: 'Sumur', hit: rectT(11, 16), area: { x: 11 * TS, y: 15 * TS, w: 16, h: 32 }, line: 'Airnya jernih sekali... semoga cinta mereka juga sejernih ini. 💧' });

    // Gerbang, papan selamat datang, kotak surat (mengapit jalan utama)
    objs.push({ y: 22 * TS, draw: () => drawGate(13 * TS, 21 * TS + 14) });
    block(13, 18);
    objs.push({ y: 19 * TS, draw: () => drawSign(13 * TS, 18 * TS) });
    addSpot({ id: 'welcome', page: 'welcome', counted: false, name: 'Papan Selamat Datang', icon: '🪧', hit: rectT(13, 18) });
    block(16, 18);
    objs.push({ y: 19 * TS, draw: (t) => drawMailbox(16 * TS, 18 * TS, t, !visited.has('mail')) });
    addSpot({ id: 'mail', page: 'mail', name: 'Kotak Surat', icon: '💌', hit: rectT(16, 18), area: { x: 16 * TS, y: 17 * TS + 4, w: 16, h: 28 } });

    // Kolam
    addSpot({ id: 'pond', name: 'Kolam', hit: rectT(POND.x, POND.y, POND.w, POND.h), line: 'Bebek-bebek berenang berpasangan. Manis sekali! 🦆' });

    // Lampu jalan
    [[10, 6], [19, 6], [13, 13], [16, 13]].forEach(([x, y]) => {
        block(x, y);
        objs.push({ y: (y + 1) * TS, draw: (t, n) => drawLamp(x * TS, y * TS, n) });
        lights.push({ x: x * TS + 8, y: y * TS - 12, r: 46 });
    });

    // Pohon: tepi desa & penghias
    for (let x = 0; x < W; x++) { addTree(x, 0); addTree(x, H - 1); }
    for (let y = 1; y < H - 1; y++) { addTree(0, y); addTree(W - 1, y); }
    for (let x = 1; x < W - 1; x++) if (hash(x, 1, 2) > 0.35) addTree(x, 1);
    for (let y = 2; y < H - 2; y++) { if (hash(1, y, 4) > 0.55) addTree(1, y); if (hash(W - 2, y, 4) > 0.55) addTree(W - 2, y); }
    [[9, 2], [20, 3], [27, 4], [12, 9], [10, 12], [12, 14], [20, 14], [10, 18]].forEach(([x, y]) => addTree(x, y));

    /* =====================================================================
       Makhluk hidup & partikel
       ===================================================================== */
    const player = { x: 15 * TS, y: 19 * TS + 12, dir: 'up', step: 0, walkT: 0, moving: false, stuckT: 0 };
    objs.push({ y: 0, player: true, draw: () => drawPerson(player.x, player.y, player.dir, player.moving ? player.step : 0, LOOK.player) });

    const COOP_YARD = { x0: 16.6, x1: 20.6, y0: 17.4, y1: 18.8 }; // area ayam (tile)
    const chickens = Array.from({ length: 4 }, () => ({ x: rand(17, 20) * TS, y: rand(17.6, 18.6) * TS, dir: 1, tx: 0, ty: 0, wait: rand(0, 2), peck: 0, moving: false }));
    chickens.forEach((ch) => objs.push({ y: 0, ref: ch, draw: (t) => drawChicken(ch, t) }));
    const ducks = [{ x: (POND.x + 1.5) * TS, y: (POND.y + 2) * TS, dir: 1, a: 0 }, { x: (POND.x + 3) * TS, y: (POND.y + 3.3) * TS, dir: -1, a: 2 }];

    const butterflies = Array.from({ length: 6 }, (_, i) => ({ x: rand(3, W - 3) * TS, y: rand(3, H - 3) * TS, a: rand(0, 6), col: ['#fff', '#ffd34d', '#ff8ab3', '#9ad7ff'][i % 4] }));
    const fireflies = Array.from({ length: 18 }, () => ({ x: rand(1, W - 1) * TS, y: rand(1, H - 1) * TS, a: rand(0, 6) }));
    const clouds = Array.from({ length: 3 }, (_, i) => ({ x: i * 200 - 100, y: rand(40, MH - 60), r: rand(50, 80) }));
    let particles = []; // { x, y, vx, vy, life, max, kind }

    const addParticle = (p) => { if (particles.length < 220) particles.push(p); };

    function updateLife(dt, t) {
        chickens.forEach((ch) => {
            ch.peck = Math.max(0, ch.peck - dt);
            if (ch.wait > 0) {
                ch.wait -= dt; ch.moving = false;
                if (Math.random() < dt * 0.8) ch.peck = 0.35;
                if (ch.wait <= 0) { ch.tx = rand(COOP_YARD.x0, COOP_YARD.x1) * TS; ch.ty = rand(COOP_YARD.y0, COOP_YARD.y1) * TS; }
                return;
            }
            const dx = ch.tx - ch.x, dy = ch.ty - ch.y, d = Math.hypot(dx, dy);
            if (d < 2) { ch.wait = rand(1, 3.5); return; }
            const nx = ch.x + (dx / d) * 18 * dt, ny = ch.y + (dy / d) * 18 * dt;
            if (blocked(nx, ny, 3)) { ch.wait = rand(0.5, 1.5); return; }
            ch.x = nx; ch.y = ny; ch.dir = dx < 0 ? -1 : 1; ch.moving = true;
        });
        ducks.forEach((d) => {
            d.a += dt * 0.4;
            const nx = d.x + d.dir * 7 * dt;
            if (tileAt(Math.floor((nx + d.dir * 8) / TS), Math.floor(d.y / TS)) !== WATER) d.dir *= -1;
            else d.x = nx;
            d.y += Math.sin(d.a * 2) * 0.05;
        });
        butterflies.forEach((b) => { b.a += dt; b.x += Math.cos(b.a * 0.7) * 14 * dt; b.y += Math.sin(b.a * 1.3) * 9 * dt; });
        fireflies.forEach((f) => { f.a += dt; f.x += Math.cos(f.a * 0.5) * 6 * dt; f.y += Math.sin(f.a * 0.8) * 5 * dt; });
        clouds.forEach((cl) => { cl.x += 6 * dt; if (cl.x - cl.r > MW + 40) cl.x = -cl.r - 40; });

        if (Math.random() < dt * 2.2) smokers.forEach((s) => addParticle({ x: s.x + rand(-1, 1), y: s.y, vx: rand(2, 6), vy: -9, life: 0, max: 2.4, kind: 'smoke' }));
        if (Math.random() < dt * 1.6) addParticle({ x: 19 * TS + rand(-4, 52), y: 10 * TS + rand(-14, 14), vx: rand(4, 10), vy: rand(6, 10), life: 0, max: 4, kind: 'petal' });
        if (Math.random() < dt * 0.7) addParticle({ x: 15 * TS + rand(-6, 6), y: 4 * TS, vx: rand(-3, 3), vy: -12, life: 0, max: 2.2, kind: 'heart' });
        particles.forEach((p) => { p.life += dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.kind === 'petal') p.vx = Math.sin(p.life * 3) * 8; });
        particles = particles.filter((p) => p.life < p.max);
    }

    function drawParticles() {
        particles.forEach((p) => {
            const k = 1 - p.life / p.max;
            if (p.kind === 'smoke') { c.globalAlpha = k * 0.55; const s = 3 + Math.round((1 - k) * 4); R('#eceff1', Math.round(p.x) - s / 2, Math.round(p.y), s, s); }
            else if (p.kind === 'petal') { c.globalAlpha = Math.min(1, k * 2); R('#f8bbd0', Math.round(p.x), Math.round(p.y), 2, 1); }
            else if (p.kind === 'heart') { c.globalAlpha = k; heart(Math.round(p.x) - 2, Math.round(p.y), '#ff4d6d'); }
            else if (p.kind === 'spark') { c.globalAlpha = k; R(p.col || '#fff59d', Math.round(p.x), Math.round(p.y), 2, 2); }
        });
        c.globalAlpha = 1;
    }

    /* =====================================================================
       Waktu (siang / sore / malam mengikuti jam tamu)
       ===================================================================== */
    const forced = { pagi: 6, siang: 12, sore: 17.4, malam: 21 }[new URLSearchParams(location.search).get('waktu')];
    function dayLight() {
        const d = new Date();
        const h = forced ?? d.getHours() + d.getMinutes() / 60;
        if (h >= 7 && h < 16.5) return { dark: 0, warm: 0 };
        if (h >= 16.5 && h < 18.5) return { dark: ((h - 16.5) / 2) * 0.42, warm: 0.2 };
        if (h >= 5 && h < 7) return { dark: (1 - (h - 5) / 2) * 0.45, warm: 0.14 };
        return { dark: 0.55, warm: 0 };
    }
    let light = dayLight();
    setInterval(() => (light = dayLight()), 60000);

    /* =====================================================================
       Tabrakan & pencarian jalan
       ===================================================================== */
    function blocked(x, y, hw = 5) {
        const x0 = Math.floor((x - hw) / TS), x1 = Math.floor((x + hw - 1) / TS);
        const y0 = Math.floor((y - 5) / TS), y1 = Math.floor((y - 1) / TS);
        for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (isSolid(tx, ty)) return true;
        return false;
    }
    const distToRect = (x, y, r) => Math.hypot(x - Math.max(r.x, Math.min(x, r.x + r.w)), y - Math.max(r.y, Math.min(y, r.y + r.h)));
    const REACH = 14;

    function findPath(goals) {
        const sx = Math.floor(player.x / TS), sy = Math.floor((player.y - 3) / TS);
        const goal = new Set(goals.map(([x, y]) => id(x, y)));
        if (!goal.size) return null;
        if (goal.has(id(sx, sy))) return [];
        const prev = new Int32Array(W * H).fill(-1);
        const q = [id(sx, sy)];
        prev[q[0]] = q[0];
        for (let qi = 0; qi < q.length; qi++) {
            const cur = q[qi], cx = cur % W, cy = (cur / W) | 0;
            for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                const nx = cx + dx, ny = cy + dy;
                if (!inMap(nx, ny) || isSolid(nx, ny) || prev[id(nx, ny)] !== -1) continue;
                prev[id(nx, ny)] = cur;
                if (goal.has(id(nx, ny))) {
                    const path = [];
                    for (let n = id(nx, ny); n !== q[0]; n = prev[n]) path.unshift([n % W, (n / W) | 0]);
                    return path;
                }
                q.push(id(nx, ny));
            }
        }
        return null;
    }
    const goalsFor = (r) => {
        const out = [];
        for (let y = Math.floor(r.y / TS) - 1; y <= Math.floor((r.y + r.h) / TS) + 1; y++)
            for (let x = Math.floor(r.x / TS) - 1; x <= Math.floor((r.x + r.w) / TS) + 1; x++)
                if (inMap(x, y) && !isSolid(x, y) && distToRect(x * TS + 8, y * TS + 9, r) <= REACH) out.push([x, y]);
        return out;
    };

    /* =====================================================================
       Status permainan & UI
       ===================================================================== */
    const storeKey = `desa-bahagia:${CFG.slug || ''}`;
    const visited = new Set();
    try { JSON.parse(localStorage.getItem(storeKey) || '[]').forEach((v) => visited.add(v)); } catch { /* penyimpanan tidak tersedia */ }
    const saveVisited = () => { try { localStorage.setItem(storeKey, JSON.stringify([...visited])); } catch { /* abaikan */ } };

    const counted = spots.filter((s) => s.counted);
    let mode = 'title';      // title | play | dialog
    let near = null;         // tempat yang bisa diajak interaksi
    let path = null, pendingSpot = null, tapMark = null;
    let finished = counted.every((s) => visited.has(s.id)) && counted.length > 0;
    const keys = { up: false, down: false, left: false, right: false };

    const hud = $('#hud'), promptEl = $('#prompt'), sayEl = $('#say'), dialog = $('#dialog'), shade = $('#shade');
    const menu = $('#menu'), lightbox = $('#lightbox'), audio = $('#bgm'), soundBtn = $('#soundBtn');
    if (CFG.preview) document.body.classList.add('has-preview');

    function updateQuest() {
        const n = counted.filter((s) => visited.has(s.id)).length;
        $('#questCount').textContent = `${n}/${counted.length}`;
        $('#questFill').style.width = `${counted.length ? (n / counted.length) * 100 : 0}%`;
        buildMenu();
    }
    function buildMenu() {
        const ul = $('#menuList');
        ul.innerHTML = '';
        spots.filter((s) => s.page).concat(finished ? [{ id: 'finish', page: 'finish', name: 'Terima Kasih', icon: '💖' }] : []).forEach((s) => {
            const li = document.createElement('li');
            li.innerHTML = '<button type="button"><span class="ic"></span><span class="nm"></span><span class="ck"></span></button>';
            li.querySelector('.ic').textContent = s.icon || '•';
            li.querySelector('.nm').textContent = s.name;
            li.querySelector('.ck').textContent = visited.has(s.id) ? '✓' : '';
            li.querySelector('button').addEventListener('click', () => { closeMenu(); openSpot(s); });
            ul.appendChild(li);
        });
    }

    let sayTimer;
    function say(text, ms = 3200) {
        sayEl.textContent = text; sayEl.hidden = false;
        sayEl.style.animation = 'none'; void sayEl.offsetWidth; sayEl.style.animation = '';
        clearTimeout(sayTimer); sayTimer = setTimeout(() => (sayEl.hidden = true), ms);
    }

    /* ---------- Suara ---------- */
    let actx = null, muted = false;
    try { muted = localStorage.getItem('desa-bahagia:muted') === '1'; } catch { /* abaikan */ }
    function blip(freqs, dur = 0.07, type = 'square') {
        if (muted) return;
        try {
            actx = actx || new (window.AudioContext || window.webkitAudioContext)();
            freqs.forEach((f, i) => {
                const o = actx.createOscillator(), g = actx.createGain(), at = actx.currentTime + i * dur;
                o.type = type; o.frequency.value = f;
                g.gain.setValueAtTime(0.05, at); g.gain.exponentialRampToValueAtTime(0.001, at + dur * 1.6);
                o.connect(g).connect(actx.destination); o.start(at); o.stop(at + dur * 1.7);
            });
        } catch { /* audio tidak didukung */ }
    }
    function setMuted(v) {
        muted = v;
        soundBtn.classList.toggle('muted', muted);
        try { localStorage.setItem('desa-bahagia:muted', muted ? '1' : '0'); } catch { /* abaikan */ }
        if (audio) { if (muted) audio.pause(); else audio.play().catch(() => {}); }
    }
    soundBtn.addEventListener('click', () => { setMuted(!muted); soundBtn.blur(); });
    soundBtn.classList.toggle('muted', muted);

    /* ---------- Dialog ---------- */
    let openPage = null;
    function openSpot(s) {
        if (s.line && !s.page) { say(s.line); blip([660, 880]); return; }
        visited.add(s.id); saveVisited();
        s.onOpen?.();
        showPage(s.page);
        updateQuest();
    }
    function showPage(name) {
        const sec = page(name);
        if (!sec) return;
        $$('[data-page]', dialog).forEach((p) => (p.hidden = p !== sec));
        $('#dlgTitle').textContent = sec.dataset.title;
        $('#dlgIcon').textContent = sec.dataset.icon || '';
        $$('iframe[data-src]', sec).forEach((f) => { f.src = f.dataset.src; f.removeAttribute('data-src'); });
        dialog.hidden = false; shade.hidden = false;
        dialog.style.animation = 'none'; void dialog.offsetWidth; dialog.style.animation = '';
        $('#dlgBody').scrollTop = 0;
        dialog.focus({ preventScroll: true });
        openPage = name; mode = 'dialog';
        clearKeys(); path = null; pendingSpot = null; hideHelp();
        promptEl.hidden = true; promptEl.dataset.id = '';
        blip([523, 659, 784]);
    }
    function closeDialog() {
        if (!openPage) return;
        dialog.hidden = true; shade.hidden = true;
        const was = openPage;
        openPage = null; mode = 'play';
        document.activeElement?.blur?.(); // supaya Spasi kembali dipakai untuk bicara
        blip([784, 523]);
        if (!finished && counted.length && counted.every((s) => visited.has(s.id))) {
            finished = true; updateQuest();
            setTimeout(() => { celebrate(); showPage('finish'); }, 350);
        } else if (was === 'finish') {
            say('Sampai jumpa di hari bahagia kami! 💖');
        }
    }
    $$('[data-close]').forEach((b) => b.addEventListener('click', closeDialog));
    shade.addEventListener('click', closeDialog);

    function openMenu() { menu.hidden = false; buildMenu(); clearKeys(); $('button', menu)?.focus(); }
    function closeMenu() { menu.hidden = true; }
    $('#mapBtn').addEventListener('click', () => (menu.hidden ? openMenu() : closeMenu()));
    $('[data-close-menu]').addEventListener('click', closeMenu);

    function celebrate() {
        blip([523, 659, 784, 1046, 784, 1046], 0.09);
        const cols = ['#e63946', '#ff8ab3', '#f4c06a', '#ffffff'];
        for (let i = 0; i < 40; i++) {
            const s = document.createElement('div');
            s.className = 'confetti';
            s.innerHTML = `<svg viewBox="0 0 7 6" shape-rendering="crispEdges"><path fill="${cols[i % 4]}" d="M1 0h2v1h1V0h2v1h1v2H6v1H5v1H4v1H3V5H2V4H1V3H0V1h1z"/></svg>`;
            s.style.left = `${Math.random() * 100}vw`;
            s.style.width = `${10 + Math.random() * 14}px`;
            s.style.animationDuration = `${2.5 + Math.random() * 2.5}s`;
            s.style.animationDelay = `${Math.random() * 0.8}s`;
            s.style.setProperty('--r', `${Math.random() * 720 - 360}deg`);
            document.body.appendChild(s);
            setTimeout(() => s.remove(), 6000);
        }
    }

    /* ---------- Isi dialog: galeri, salin, RSVP, hitung mundur ---------- */
    $$('[data-lightbox]').forEach((b) => b.addEventListener('click', () => { $('img', lightbox).src = b.dataset.lightbox; lightbox.hidden = false; }));
    lightbox.addEventListener('click', () => (lightbox.hidden = true));

    $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(b.dataset.copy); }
        catch {
            const ta = document.createElement('textarea'); ta.value = b.dataset.copy; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
        }
        say('Berhasil disalin! ✓', 1800);
    }));

    const form = $('#wishForm');
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = $('button', form), msg = $('.form-msg', form);
        const data = Object.fromEntries(new FormData(form));
        const render = (w) => {
            const d = document.createElement('div');
            d.className = 'wish new';
            d.innerHTML = '<b></b> <span class="badge"></span><p></p><small></small>';
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
            msg.hidden = false; msg.textContent = 'Surat terkirim! Terima kasih atas ucapan & konfirmasinya.';
            blip([660, 880, 1046]);
        } catch (err) {
            msg.hidden = false; msg.textContent = err.message;
        } finally {
            btn.disabled = false;
        }
    });

    const cd = $('.countdown');
    const tickCountdown = () => {
        if (!cd) return;
        let s = Math.max(0, Math.floor((new Date(cd.dataset.date) - Date.now()) / 1000));
        const v = { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
        Object.entries(v).forEach(([k, n]) => { const el = $(`[data-cd="${k}"]`, cd); if (el) el.textContent = n; });
    };
    tickCountdown(); setInterval(tickCountdown, 1000);

    /* =====================================================================
       Input
       ===================================================================== */
    const KEYMAP = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };
    const clearKeys = () => { Object.keys(keys).forEach((k) => (keys[k] = false)); $$('.dpad button').forEach((b) => b.classList.remove('on')); };
    const typing = () => /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!lightbox.hidden) lightbox.hidden = true;
            else if (!menu.hidden) closeMenu();
            else closeDialog();
            return;
        }
        if (mode === 'title') {
            if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); start(); }
            return;
        }
        if (mode !== 'play' || typing() || !menu.hidden) return;
        const k = KEYMAP[e.code];
        if (k) { e.preventDefault(); keys[k] = true; path = null; pendingSpot = null; hideHelp(); return; }
        if ((e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') && !e.repeat) {
            if (document.activeElement?.tagName === 'BUTTON' && document.activeElement !== document.body) return;
            e.preventDefault(); interact();
        }
    });
    window.addEventListener('keyup', (e) => { const k = KEYMAP[e.code]; if (k) keys[k] = false; });
    window.addEventListener('blur', clearKeys);

    // D-pad: arah dihitung dari posisi jari, jadi jari bisa digeser antar tombol
    const dpad = $('.dpad');
    const padDir = (e) => {
        clearKeys();
        if (mode !== 'play') return;
        const r = dpad.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        if (Math.hypot(dx, dy) < 10) return;
        const dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
        keys[dir] = true;
        $(`[data-dir="${dir}"]`, dpad).classList.add('on');
        path = null; pendingSpot = null; hideHelp();
    };
    dpad.addEventListener('pointerdown', (e) => { e.preventDefault(); dpad.setPointerCapture(e.pointerId); padDir(e); });
    dpad.addEventListener('pointermove', (e) => { if (dpad.hasPointerCapture(e.pointerId)) padDir(e); });
    ['pointerup', 'pointercancel'].forEach((ev) => dpad.addEventListener(ev, clearKeys));
    dpad.addEventListener('contextmenu', (e) => e.preventDefault());
    const aBtn = $('#aBtn');
    aBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); aBtn.classList.add('on'); if (mode === 'play') interact(); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => aBtn.addEventListener(ev, () => aBtn.classList.remove('on')));

    function interact() {
        if (near) { faceTo(near.hit); openSpot(near); return; }
        // ayam di dekat pemain
        const ch = chickens.find((k) => Math.hypot(k.x - player.x, k.y - player.y) < 20);
        if (ch) { ch.peck = 0.4; say('Petok! 🐔', 1400); blip([880, 990], 0.05); }
    }
    function faceTo(r) {
        const cx = r.x + r.w / 2, cy = r.y + r.h / 2, dx = cx - player.x, dy = cy - (player.y - 6);
        player.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
    }

    // Ketuk / klik untuk berjalan
    canvas.addEventListener('pointerdown', (e) => {
        if (mode !== 'play') return;
        if (!menu.hidden) { closeMenu(); return; }
        hideHelp();
        const wx = (e.clientX * dpr + cam.px) / Z, wy = (e.clientY * dpr + cam.py) / Z;
        const s = spots.find((sp) => wx >= sp.area.x && wx <= sp.area.x + sp.area.w && wy >= sp.area.y - 8 && wy <= sp.area.y + sp.area.h);
        if (s) {
            if (distToRect(player.x, player.y - 3, s.hit) <= REACH) { faceTo(s.hit); openSpot(s); return; }
            const p = findPath(goalsFor(s.hit));
            if (p) { path = p; pendingSpot = s; tapMark = null; }
            return;
        }
        const ch = chickens.find((k) => Math.abs(k.x - wx) < 8 && wy > k.y - 12 && wy < k.y + 2);
        if (ch) { ch.peck = 0.4; say('Petok! 🐔', 1400); blip([880, 990], 0.05); return; }
        const tx = Math.floor(wx / TS), ty = Math.floor(wy / TS);
        if (isSolid(tx, ty)) return;
        const p = findPath([[tx, ty]]);
        if (p) { path = p; pendingSpot = null; tapMark = { x: tx * TS + 8, y: ty * TS + 12, t: 0 }; }
    });

    /* =====================================================================
       Mulai
       ===================================================================== */
    let helpTimer;
    const hideHelp = () => { const h = $('#help'); if (h && !h.classList.contains('gone')) { h.classList.add('gone'); setTimeout(() => h.remove(), 400); } };
    function start() {
        if (mode !== 'title') return;
        mode = 'starting';
        blip([392, 523, 659, 784], 0.08);
        if (audio && !muted) audio.play().catch(() => {});
        const iris = $('#iris');
        $('#title').classList.add('out');
        iris.classList.add('shut');
        setTimeout(() => {
            $('#title').remove();
            hud.hidden = false;
            snapCamera();
            iris.classList.remove('shut');
            mode = 'play';
            updateQuest();
            helpTimer = setTimeout(hideHelp, 7000);
            canvas.focus?.();
        }, 650);
    }
    $('#startBtn').addEventListener('click', start);

    /* =====================================================================
       Kamera & ukuran layar
       ===================================================================== */
    let dpr = 1, Z = 3, vw = 0, vh = 0;
    const cam = { x: MW / 2, y: MH / 2, px: 0, py: 0 };
    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 3);
        vw = window.innerWidth; vh = window.innerHeight;
        canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr);
        const cssZoom = Math.max(2, Math.min(4, Math.min(vw / (TS * 13), vh / (TS * 9))));
        // peta ringkas: zoom minimal agar peta selalu memenuhi layar (tanpa tepi kosong)
        Z = Math.max(2, Math.round(cssZoom * dpr), Math.ceil(canvas.width / MW), Math.ceil(canvas.height / MH));
        ctx.imageSmoothingEnabled = false;
    }
    window.addEventListener('resize', resize);
    resize();

    const touchUI = matchMedia('(hover: none), (pointer: coarse)');
    const viewW = () => canvas.width / Z, viewH = () => canvas.height / Z;
    const clampCam = (v, size, map) => (size >= map ? (map - size) / 2 : Math.max(0, Math.min(map - size, v)));
    function snapCamera() { cam.x = player.x - viewW() / 2; cam.y = player.y - 10 - viewH() / 2; }

    /* =====================================================================
       Update
       ===================================================================== */
    function update(dt, t) {
        if (mode === 'play') {
            let dx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
            let dy = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
            if (!dx && !dy && path) {
                if (!path.length) {
                    path = null;
                    if (pendingSpot) { const s = pendingSpot; pendingSpot = null; faceTo(s.hit); openSpot(s); }
                } else {
                    const [tx, ty] = path[0], gx = tx * TS + 8, gy = ty * TS + 12;
                    const ddx = gx - player.x, ddy = gy - player.y;
                    if (Math.hypot(ddx, ddy) < 1.5) { player.x = gx; player.y = gy; path.shift(); }
                    else { dx = Math.abs(ddx) > 0.5 ? Math.sign(ddx) : 0; dy = Math.abs(ddy) > 0.5 ? Math.sign(ddy) : 0; }
                }
            }
            player.moving = !!(dx || dy);
            const ox = player.x, oy = player.y;
            if (player.moving) {
                const len = Math.hypot(dx, dy), sp = 70 * dt;
                let mx = (dx / len) * sp, my = (dy / len) * sp;
                if (path && path.length) { // jangan melewati titik tujuan
                    const [tx, ty] = path[0];
                    mx = Math.sign(mx) * Math.min(Math.abs(mx), Math.abs(tx * TS + 8 - player.x));
                    my = Math.sign(my) * Math.min(Math.abs(my), Math.abs(ty * TS + 12 - player.y));
                }
                if (!blocked(player.x + mx, player.y)) player.x += mx;
                else if (!path) nudge('x', mx);
                if (!blocked(player.x, player.y + my)) player.y += my;
                else if (!path) nudge('y', my);
                player.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : dy > 0 ? 'down' : player.dir);
                player.walkT += dt;
                player.step = Math.floor(player.walkT * 8) % 4;
            } else {
                player.walkT = 0;
            }
            // jalur otomatis tersangkut: batalkan
            player.stuckT = path && player.x === ox && player.y === oy ? player.stuckT + dt : 0;
            if (player.stuckT > 0.6) { path = null; pendingSpot = null; tapMark = null; }

            // tempat terdekat yang terjangkau
            near = null;
            let best = REACH + 0.01;
            spots.forEach((s) => { const d = distToRect(player.x, player.y - 3, s.hit); if (d < best) { best = d; near = s; } });
            const pid = near ? near.id : '';
            if (promptEl.dataset.id !== pid) {
                promptEl.dataset.id = pid;
                promptEl.hidden = !near;
                if (near) {
                    promptEl.innerHTML = '<span class="key"></span><span class="txt"></span>';
                    $('.key', promptEl).textContent = touchUI.matches ? 'A' : 'SPASI';
                    $('.txt', promptEl).textContent = near.page ? `Lihat ${near.name}` : `Periksa ${near.name}`;
                }
            }

            cam.x += (player.x - viewW() / 2 - cam.x) * Math.min(1, dt * 6);
            cam.y += (player.y - 10 - viewH() / 2 - cam.y) * Math.min(1, dt * 6);
            if (tapMark) { tapMark.t += dt; if (!path) tapMark = null; }
        } else if (mode === 'title' || mode === 'starting') {
            cam.x = MW / 2 - viewW() / 2 + Math.sin(t * 0.08) * MW * 0.28;
            cam.y = MH / 2 - viewH() / 2 + Math.cos(t * 0.06) * MH * 0.25;
        }
        updateLife(dt, t);
    }

    // Bantu pemain "meluncur" melewati sudut saat menabrak sedikit
    function nudge(axis, amount) {
        for (const off of [1, 2, 3, 4, 5, 6]) {
            for (const s of [-1, 1]) {
                if (axis === 'x' && !blocked(player.x + amount, player.y + s * off)) { player.y += s * Math.min(1, off); return; }
                if (axis === 'y' && !blocked(player.x + s * off, player.y + amount)) { player.x += s * Math.min(1, off); return; }
            }
        }
    }

    /* =====================================================================
       Render
       ===================================================================== */
    function render(t) {
        const night = light.dark > 0.3;
        cam.px = Math.round(clampCam(cam.x, viewW(), MW) * Z);
        cam.py = Math.round(clampCam(cam.y, viewH(), MH) * Z);

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = '#2d5a27';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(Z, 0, 0, Z, -cam.px, -cam.py);
        ctx.imageSmoothingEnabled = false;
        c = ctx;

        ctx.drawImage(terrain, 0, 0);

        // kilau air
        for (let y = POND.y; y < POND.y + POND.h; y++) for (let x = POND.x; x < POND.x + POND.w; x++) {
            if (tileAt(x, y) !== WATER) continue;
            const ph = Math.floor(t * 2 + hash(x, y, 1) * 4) % 4;
            R('#8fd0f5', x * TS + 3 + ph * 2, y * TS + 6 + (ph % 2) * 4, 4, 1);
            if (hash(x, y, 2) > 0.6) { R('#4f9d3a', x * TS + 9, y * TS + 9, 5, 3); R('#ff8ab3', x * TS + 11, y * TS + 8, 2, 1); }
        }
        ducks.forEach((d) => drawDuck(d, t));

        // tanda tujuan ketuk
        if (tapMark) {
            const s = 3 + Math.round(Math.sin(tapMark.t * 8));
            R('rgba(255,255,255,.8)', tapMark.x - s, tapMark.y - 1, s * 2, 1); R('rgba(255,255,255,.8)', tapMark.x - 1, tapMark.y - s, 1, s * 2);
        }

        // objek urut y
        objs.forEach((o) => { if (o.player) o.y = player.y; else if (o.ref) o.y = o.ref.y; });
        objs.sort((a, b) => a.y - b.y).forEach((o) => o.draw(t, night));

        drawParticles();

        // kupu-kupu (siang)
        if (!night) butterflies.forEach((b) => {
            const open = Math.floor(b.a * 10) % 2, x = Math.round(b.x), y = Math.round(b.y);
            R('#3e2723', x, y, 1, 2);
            if (open) { R(b.col, x - 2, y - 1, 2, 2); R(b.col, x + 1, y - 1, 2, 2); } else { R(b.col, x - 1, y - 1, 1, 2); R(b.col, x + 1, y - 1, 1, 2); }
        });

        // bayangan awan
        ctx.fillStyle = 'rgba(20,40,60,.07)';
        clouds.forEach((cl) => { ctx.beginPath(); ctx.ellipse(cl.x, cl.y, cl.r, cl.r * 0.5, 0, 0, Math.PI * 2); ctx.ellipse(cl.x + cl.r * 0.6, cl.y + 8, cl.r * 0.6, cl.r * 0.35, 0, 0, Math.PI * 2); ctx.fill(); });

        // tanda "!" di tempat yang belum dikunjungi
        if (mode !== 'title' && mode !== 'starting') {
            spots.forEach((s) => {
                if (!s.counted || visited.has(s.id)) return;
                const bx = Math.round(s.hit.x + s.hit.w / 2 - 4), by = Math.round(s.area.y - 14 + Math.sin(t * 4) * 2);
                R('#3e2723', bx - 1, by - 1, 10, 13); R('#ffffff', bx, by, 8, 11); R('#3e2723', bx + 3, by + 12, 2, 2);
                R('#e53935', bx + 3, by + 2, 2, 5); R('#e53935', bx + 3, by + 8, 2, 2);
            });
        }

        // malam / senja
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (light.warm) { ctx.fillStyle = `rgba(255,120,50,${light.warm})`; ctx.fillRect(0, 0, canvas.width, canvas.height); }
        if (light.dark) {
            ctx.fillStyle = `rgba(14,20,64,${light.dark})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'lighter';
            const k = light.dark / 0.55;
            const glow = (wx, wy, r, col = '255,200,110', a = 0.32) => {
                const sx = wx * Z - cam.px, sy = wy * Z - cam.py, sr = r * Z;
                if (sx < -sr || sy < -sr || sx > canvas.width + sr || sy > canvas.height + sr) return;
                const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
                g.addColorStop(0, `rgba(${col},${a * k})`); g.addColorStop(1, `rgba(${col},0)`);
                ctx.fillStyle = g; ctx.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
            };
            lights.forEach((l) => glow(l.x, l.y, l.r, l.col));
            fireflies.forEach((f) => { const tw = 0.5 + Math.sin(f.a * 3) * 0.5; glow(f.x, f.y, 6, '200,255,120', 0.7 * tw); });
            glow(player.x, player.y - 10, 34, '255,230,170', 0.18);
            ctx.globalCompositeOperation = 'source-over';
        }

        // label nama tempat di dekat pemain
        if (mode === 'play' || mode === 'dialog') {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.font = "600 13px 'Pixelify Sans', sans-serif";
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            spots.forEach((s) => {
                if (!s.page) return;
                const cx = s.area.x + s.area.w / 2, d = Math.hypot(cx - player.x, s.hit.y + s.hit.h - player.y);
                if (d > 90) return;
                const a = Math.max(0, Math.min(1, (90 - d) / 30));
                const sx = (cx * Z - cam.px) / dpr, sy = Math.max(48, ((s.area.y - 20) * Z - cam.py) / dpr);
                const w = ctx.measureText(s.name).width + 16;
                ctx.globalAlpha = a;
                ctx.fillStyle = '#4a2c14'; ctx.fillRect(Math.round(sx - w / 2) - 2, Math.round(sy - 11) - 2, Math.round(w) + 4, 26);
                ctx.fillStyle = '#fff6dc'; ctx.fillRect(Math.round(sx - w / 2), Math.round(sy - 11), Math.round(w), 22);
                ctx.fillStyle = '#3b2412'; ctx.fillText(s.name, Math.round(sx), Math.round(sy) + 1);
            });
            ctx.globalAlpha = 1;
        }
    }

    /* =====================================================================
       Loop utama
       ===================================================================== */
    drawTerrain();
    updateQuest();
    let last = performance.now(), T = 0;
    function frame(now) {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now; T += dt;
        update(dt, T);
        render(T);
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
})();

/* ================= IMAGE CONVERSION ================= */

function convert(img) {
    SIZE = parseInt(document.getElementById('sizeInput').value) || 64;
    const mode = document.getElementById('scaleMode').value;

    const src = document.createElement('canvas');
    src.width = img.width;
    src.height = img.height;
    const sctx = src.getContext('2d');
    sctx.drawImage(img, 0, 0);

    const srcData = sctx.getImageData(0, 0, img.width, img.height).data;

    const t = document.createElement('canvas');
    t.width = SIZE;
    t.height = SIZE;
    const tctx = t.getContext('2d');

    const dstImg = tctx.createImageData(SIZE, SIZE);
    const dst = dstImg.data;

    const sx = img.width / SIZE;
    const sy = img.height / SIZE;

    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
            const di = (y * SIZE + x) * 4;

            if (mode === 'nearest') {
                const px = Math.floor(x * sx);
                const py = Math.floor(y * sy);
                const si = (py * img.width + px) * 4;
                dst.set(srcData.slice(si, si + 4), di);
                continue;
            }

            const x0 = Math.floor(x * sx), x1 = Math.floor((x + 1) * sx);
            const y0 = Math.floor(y * sy), y1 = Math.floor((y + 1) * sy);

            const map = new Map();
            for (let yy = y0; yy < y1; yy++) {
                for (let xx = x0; xx < x1; xx++) {
                    const si = (yy * img.width + xx) * 4;
                    if (srcData[si + 3] < ALPHA_CUTOFF) continue;
                    const r = srcData[si] >> 3;
                    const g = srcData[si + 1] >> 3;
                    const b = srcData[si + 2] >> 3;
                    const key = (r << 10) | (g << 5) | b;
                    map.set(key, (map.get(key) || 0) + 1);
                }
            }

            if (map.size === 0) {
                dst[di + 3] = 0;
                continue;
            }

            let bestKey = 0, max = 0;
            for (const [k, v] of map) {
                if (v > max) {
                    max = v;
                    bestKey = k;
                }
            }

            dst[di] = ((bestKey >> 10) & 31) << 3;
            dst[di + 1] = ((bestKey >> 5) & 31) << 3;
            dst[di + 2] = (bestKey & 31) << 3;
            dst[di + 3] = 255;
        }
    }

    tctx.putImageData(dstImg, 0, 0);
    updateCanvasSize();
    ctx.drawImage(t, 0, 0, canvas.width, canvas.height);

    readPixels(tctx);
    regroup();
    draw();
}

function readPixels(tctx) {
    pixels = [];
    const d = tctx.getImageData(0, 0, SIZE, SIZE).data;
    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
            const i = (y * SIZE + x) * 4;
            if (d[i + 3] < ALPHA_CUTOFF) continue;
            pixels.push({
                x, y,
                r: d[i],
                g: d[i + 1],
                b: d[i + 2],
                group: 0,
                colorGroup: -1,
                colorType: 0
            });
        }
    }
}

function regroup() {
    groups = palette.map((p, i) => ({ index: i, color: hexToRgb(p.value), pixels: [] }));
    pixels.forEach(px => {
        let best = 0, min = colorDistance(px, groups[0].color);
        for (let i = 1; i < groups.length; i++) {
            const d = colorDistance(px, groups[i].color);
            if (d < min) {
                min = d;
                best = i;
            }
        }
        px.colorGroup = best;
        groups[best].pixels.push(px);
    });
    renderColorGroups();
    renderDataGroups();
    renderColorTypeGroups();
}

// Size and mode change handlers
document.getElementById('sizeInput').onchange =
    document.getElementById('scaleMode').onchange = () => {
        if (originalImage) convert(originalImage);
    };

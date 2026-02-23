/* ================= CANVAS DRAWING ================= */

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const s = canvas.width / SIZE;

    pixels.forEach(p => {
        ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
        ctx.fillRect(p.x * s, p.y * s, s, s);

        // Green highlight for selected pixels in paint mode
        const pixelKey = `${p.x},${p.y}`;
        if (selectedPixels.has(pixelKey)) {
            ctx.strokeStyle = 'rgba(0,255,0,0.9)';
            ctx.lineWidth = 2;
            ctx.strokeRect(p.x * s + 1, p.y * s + 1, s - 2, s - 2);
        }

        // Blue highlight for color group selection
        if (activeColorGroup >= 0 && p.colorGroup === activeColorGroup) {
            ctx.strokeStyle = 'rgba(0,120,255,0.9)';
            ctx.strokeRect(p.x * s + 1.5, p.y * s + 1.5, s - 3, s - 3);
        }

        // Purple highlight for color type
        if (activeColorTypeId !== 0 && p.colorType === activeColorTypeId) {
            ctx.strokeStyle = 'rgba(147,51,234,0.9)';
            ctx.lineWidth = 2;
            ctx.strokeRect(p.x * s + 1, p.y * s + 1, s - 2, s - 2);
        }

        // Red highlight for data group
        if (activeDataGroupId !== 0 && activeDataGroupId !== -1 && p.group === activeDataGroupId) {
            ctx.strokeStyle = 'red';
            ctx.strokeRect(p.x * s + 0.5, p.y * s + 0.5, s - 1, s - 1);
        }

        // Orange highlight for ungrouped pixels (when Show Ungrouped is active)
        if (activeDataGroupId === -1 && p.group === 0) {
            ctx.strokeStyle = 'rgba(255,165,0,0.9)';
            ctx.lineWidth = 2;
            ctx.strokeRect(p.x * s + 1, p.y * s + 1, s - 2, s - 2);
        }
    });

    // Draw pixel grid
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= SIZE; x++) {
        ctx.beginPath();
        ctx.moveTo(x * s, 0);
        ctx.lineTo(x * s, canvas.height);
        ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= SIZE; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * s);
        ctx.lineTo(canvas.width, y * s);
        ctx.stroke();
    }

    // Draw selection rectangle
    if (isDragging && dragStart && dragEnd) {
        const x = Math.min(dragStart.x, dragEnd.x);
        const y = Math.min(dragStart.y, dragEnd.y);
        const w = Math.abs(dragStart.x - dragEnd.x);
        const h = Math.abs(dragStart.y - dragEnd.y);
        ctx.save();
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = 'rgba(0,120,255,0.8)';
        ctx.strokeRect(x, y, w, h);
        ctx.restore();
    }
}

// Zoom slider
document.getElementById('zoomSlider').oninput = (e) => {
    ZOOM_SCALE = parseFloat(e.target.value);
    const percentage = Math.round((ZOOM_SCALE / 10) * 100);
    document.getElementById('zoomDisplay').textContent = percentage + '%';

    updateCanvasSize();

    // Redraw the image at new size if we have pixels
    if (pixels.length > 0) {
        const t = document.createElement('canvas');
        t.width = SIZE;
        t.height = SIZE;
        const tctx = t.getContext('2d');
        const imgData = tctx.createImageData(SIZE, SIZE);
        const data = imgData.data;

        // Fill with transparent background
        for (let i = 0; i < data.length; i += 4) {
            data[i + 3] = 0;
        }

        // Draw pixels
        pixels.forEach(p => {
            const i = (p.y * SIZE + p.x) * 4;
            data[i] = p.r;
            data[i + 1] = p.g;
            data[i + 2] = p.b;
            data[i + 3] = 255;
        });

        tctx.putImageData(imgData, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(t, 0, 0, canvas.width, canvas.height);
    }

    draw();
};

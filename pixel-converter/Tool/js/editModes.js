/* ================= EDIT MODES (Paint, Erase, Group, Color Type) ================= */

function togglePixelGroup(p) {
    if (!p) return;
    p.group = (p.group === activeDataGroupId) ? 0 : activeDataGroupId;
}

function togglePixelColorType(p) {
    if (!p) return;
    p.colorType = (p.colorType === activeColorTypeId) ? 0 : activeColorTypeId;
}

function selectPixelsInRect(x0, y0, x1, y1) {
    const minX = Math.min(x0, x1);
    const minY = Math.min(y0, y1);
    const maxX = Math.max(x0, x1);
    const maxY = Math.max(y0, y1);

    for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
            const p = getPixel(x, y);
            if (!p) continue;

            // Apply color filter if a color is selected
            if (activeColorGroup >= 0 && p.colorGroup !== activeColorGroup) continue;

            const key = `${x},${y}`;
            if (!selectedPixels.has(key)) {
                selectedPixels.add(key);
                // Update color picker to show the first pixel's color
                if (selectedPixels.size === 1) {
                    currentPaintColor = rgbToHex(p.r, p.g, p.b);
                    updateColorPicker();
                }
            }
        }
    }
}

// Show/hide controls based on mode
document.getElementById('editMode').onchange = (e) => {
    const mode = e.target.value;
    document.getElementById('paintControls').style.display = mode === 'paint' ? 'block' : 'none';
    document.getElementById('eraseControls').style.display = mode === 'erase' ? 'block' : 'none';
    selectedPixels.clear();

    // Deselect groups when switching modes
    if (mode !== 'group') {
        activeDataGroupId = 0;
        renderDataGroups();
    }
    if (mode !== 'colorType') {
        activeColorTypeId = 0;
        renderColorTypeGroups();
    }

    draw();
};

// Deselect buttons
document.getElementById('deselectPaint').onclick = () => {
    selectedPixels.clear();
    draw();
};

document.getElementById('deselectErase').onclick = () => {
    selectedPixels.clear();
    draw();
};

// Apply paint color to selected pixels
document.getElementById('applyPaint').onclick = () => {
    const count = selectedPixels.size;
    if (count === 0) {
        alert('No pixels selected. Drag a rectangle on the canvas to select pixels first.');
        return;
    }

    saveState();

    const colorHex = currentPaintColor;
    const rgb = hexToRgb(colorHex);

    // Find or create color group for this color
    let colorGroupIndex = -1;
    for (let i = 0; i < palette.length; i++) {
        if (palette[i].value.toLowerCase() === colorHex.toLowerCase()) {
            colorGroupIndex = i;
            break;
        }
    }

    // If color not in palette, add it
    if (colorGroupIndex === -1) {
        addColor(colorHex);
        colorGroupIndex = palette.length - 1;
    }

    // Apply color to selected pixels
    selectedPixels.forEach(key => {
        const [x, y] = key.split(',').map(Number);
        const p = getPixel(x, y);
        if (p) {
            p.r = rgb.r;
            p.g = rgb.g;
            p.b = rgb.b;
            p.colorGroup = colorGroupIndex;
        }
    });

    selectedPixels.clear();

    groups = palette.map((p, i) => ({
        index: i,
        color: hexToRgb(p.value),
        pixels: pixels.filter(px => px.colorGroup === i)
    }));

    renderColorGroups();
    renderColorTypeGroups();
    draw();
};

// Erase selected pixels
document.getElementById('applyErase').onclick = () => {
    const count = selectedPixels.size;
    if (count === 0) {
        alert('No pixels selected. Drag a rectangle on the canvas to select pixels first.');
        return;
    }

    saveState();

    // Remove selected pixels
    selectedPixels.forEach(key => {
        const [x, y] = key.split(',').map(Number);
        const index = pixels.findIndex(p => p.x === x && p.y === y);
        if (index >= 0) {
            pixels.splice(index, 1);
        }
    });

    selectedPixels.clear();

    groups = palette.map((p, i) => ({
        index: i,
        color: hexToRgb(p.value),
        pixels: pixels.filter(px => px.colorGroup === i)
    }));

    renderColorGroups();
    renderColorTypeGroups();
    draw();
};

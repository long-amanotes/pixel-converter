/* ================= MOUSE INTERACTIONS ================= */

canvas.onmousedown = e => {
    const mode = document.getElementById('editMode').value;
    const pt = canvasPoint(e);

    if (mode === 'paint') {
        isDragging = true;
        dragStart = pt;
        dragEnd = pt;
    } else if (mode === 'erase') {
        isDragging = true;
        dragStart = pt;
        dragEnd = pt;
    } else if (mode === 'colorType') {
        if (activeColorTypeId === 0) return;
        isDragging = true;
        dragStart = pt;
        dragEnd = pt;
    } else if (mode === 'group') {
        if (activeDataGroupId === 0 || activeDataGroupId === -1) return; // Prevent editing in ungrouped view
        isDragging = true;
        dragStart = pt;
        dragEnd = pt;
    }
};

canvas.onmousemove = e => {
    if (!isDragging) return;

    const pt = canvasPoint(e);
    dragEnd = pt;
    draw();
};

canvas.onmouseup = () => {
    if (!isDragging) return;

    const mode = document.getElementById('editMode').value;
    const s = canvas.width / SIZE;

    const xStart = Math.floor(dragStart.x / s);
    const yStart = Math.floor(dragStart.y / s);
    const xEnd = Math.floor(dragEnd.x / s);
    const yEnd = Math.floor(dragEnd.y / s);

    const x0 = Math.min(xStart, xEnd);
    const y0 = Math.min(yStart, yEnd);
    const x1 = Math.max(xStart, xEnd);
    const y1 = Math.max(yStart, yEnd);

    if (mode === 'paint') {
        selectPixelsInRect(x0, y0, x1, y1);
    } else if (mode === 'erase') {
        selectPixelsInRect(x0, y0, x1, y1);
    } else if (mode === 'colorType') {
        saveState();
        for (let y = y0; y <= y1; y++) {
            for (let x = x0; x <= x1; x++) {
                const p = getPixel(x, y);
                if (!p) continue;

                // Apply color filter if a color is selected
                if (activeColorGroup >= 0 && p.colorGroup !== activeColorGroup) continue;

                togglePixelColorType(p);
            }
        }
        renderColorTypeGroups();
    } else if (mode === 'group') {
        for (let y = y0; y <= y1; y++) {
            for (let x = x0; x <= x1; x++) {
                const p = getPixel(x, y);
                if (!p) continue;

                // Apply color filter if a color is selected
                if (activeColorGroup >= 0 && p.colorGroup !== activeColorGroup) continue;

                togglePixelGroup(p);
            }
        }
    }

    isDragging = false;
    dragStart = dragEnd = null;
    draw();
};

canvas.onmouseleave = () => {
    if (!isDragging) return;
    isDragging = false;
    dragStart = dragEnd = null;
    draw();
};

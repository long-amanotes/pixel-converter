/* ================= UNDO SYSTEM ================= */

function saveState() {
    const state = {
        pixels: pixels.map(p => ({ ...p })),
        palette: palette.map(p => p.value),
        dataGroups: dataGroups.map(g => ({ ...g })),
        colorTypeGroups: colorTypeGroups.map(ct => ({ ...ct }))
    };
    undoStack.push(state);
    if (undoStack.length > MAX_UNDO) {
        undoStack.shift();
    }
}

function undo() {
    if (undoStack.length === 0) {
        alert('Nothing to undo');
        return;
    }

    const state = undoStack.pop();

    // Restore pixels
    pixels = state.pixels.map(p => ({ ...p }));

    // Restore palette
    palette = [];
    document.getElementById('palette').innerHTML = '';
    state.palette.forEach(colorHex => {
        addColor(colorHex);
    });

    // Restore data groups
    dataGroups = state.dataGroups.map(g => ({ ...g }));

    // Restore color type groups
    colorTypeGroups = state.colorTypeGroups.map(ct => ({ ...ct }));

    // Update everything
    groups = palette.map((p, i) => ({
        index: i,
        color: hexToRgb(p.value),
        pixels: pixels.filter(px => px.colorGroup === i)
    }));

    renderColorGroups();
    renderColorTypeGroups();
    renderDataGroups();
    draw();
}

// Undo button
document.getElementById('undoBtn').onclick = undo;

// Keyboard shortcut for undo
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
    }
});

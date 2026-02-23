/* ================= UTILITY FUNCTIONS ================= */

function hexToRgb(h) {
    const n = parseInt(h.slice(1), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function colorDistance(p, c) {
    return (p.r - c.r) ** 2 + (p.g - c.g) ** 2 + (p.b - c.b) ** 2;
}

function canvasPoint(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
}

function getPixel(x, y) {
    return pixels.find(p => p.x === x && p.y === y) || null;
}

function updateCanvasSize() {
    const disp = SIZE * ZOOM_SCALE;
    canvas.width = disp;
    canvas.height = disp;
}

function nextGroupId() {
    const used = new Set(dataGroups.map(g => g.id));
    let i = 1;
    while (used.has(i)) i++;
    return i;
}

// Toggle hint function
function toggleHint() {
    const hint = document.querySelector('.hint');
    const content = document.getElementById('hintContent');
    const toggle = document.getElementById('hintToggle');

    if (content.classList.contains('collapsed')) {
        content.classList.remove('collapsed');
        hint.classList.remove('collapsed');
        toggle.textContent = '💡';
    } else {
        content.classList.add('collapsed');
        hint.classList.add('collapsed');
        toggle.textContent = '💡';
    }
}

// Make toggleHint available globally
window.toggleHint = toggleHint;

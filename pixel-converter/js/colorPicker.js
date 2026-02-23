/* ================= CUSTOM COLOR PICKER (Paint Mode) ================= */

let currentPaintColor = '#FF0000';

function initColorPicker() {
    const button = document.getElementById('paintColorButton');
    const popup = document.getElementById('paintColorPopup');
    const grid = document.getElementById('paintColorGrid');
    const hexInput = document.getElementById('paintColorHex');
    const nativeInput = document.getElementById('paintColorNative');

    // Set initial color
    button.style.background = currentPaintColor;
    hexInput.value = currentPaintColor;
    nativeInput.value = currentPaintColor;

    // Populate color grid
    commonColors.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'color-picker-swatch';
        swatch.style.background = color;
        swatch.onclick = () => {
            currentPaintColor = color;
            updateColorPicker();
            popup.classList.remove('show');
        };
        grid.appendChild(swatch);
    });

    // Toggle popup
    button.onclick = (e) => {
        e.stopPropagation();
        const isShowing = popup.classList.contains('show');

        if (!isShowing) {
            // Position popup intelligently
            const rect = button.getBoundingClientRect();
            const popupHeight = 280;
            const spaceAbove = rect.top;
            const spaceBelow = window.innerHeight - rect.bottom;

            popup.classList.add('show');

            if (spaceBelow < popupHeight && spaceAbove > spaceBelow) {
                popup.style.bottom = '100%';
                popup.style.top = 'auto';
                popup.style.marginBottom = '8px';
                popup.style.marginTop = '0';
            } else {
                popup.style.top = '100%';
                popup.style.bottom = 'auto';
                popup.style.marginTop = '8px';
                popup.style.marginBottom = '0';
            }
        } else {
            popup.classList.remove('show');
        }
    };

    // Hex input
    hexInput.oninput = () => {
        let value = hexInput.value.trim();
        if (!value.startsWith('#')) value = '#' + value;
        if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            currentPaintColor = value.toUpperCase();
            updateColorPicker();
        }
    };

    // Native color picker
    nativeInput.oninput = () => {
        currentPaintColor = nativeInput.value.toUpperCase();
        updateColorPicker();
    };

    // Close popup when clicking outside
    document.addEventListener('click', (e) => {
        if (!button.contains(e.target) && !popup.contains(e.target)) {
            popup.classList.remove('show');
        }
    });
}

function updateColorPicker() {
    const button = document.getElementById('paintColorButton');
    const hexInput = document.getElementById('paintColorHex');
    const nativeInput = document.getElementById('paintColorNative');

    button.style.background = currentPaintColor;
    hexInput.value = currentPaintColor;
    nativeInput.value = currentPaintColor;

    // Update selected swatch
    document.querySelectorAll('.color-picker-swatch').forEach(swatch => {
        if (swatch.style.background.toUpperCase() === currentPaintColor.toUpperCase() ||
            rgbToHex(...swatch.style.background.match(/\d+/g).map(Number)) === currentPaintColor) {
            swatch.classList.add('selected');
        } else {
            swatch.classList.remove('selected');
        }
    });
}

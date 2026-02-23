/* ================= PALETTE MANAGEMENT ================= */

function initPalette() {
    const p = document.getElementById('palette');
    p.innerHTML = '';
    palette = [];
    PRESET.forEach(addColor);
}

function addColor(hex = '#888888') {
    const wrapper = document.createElement('div');
    wrapper.className = 'color-picker-wrapper';
    wrapper.style.display = 'inline-block';
    wrapper.style.margin = '4px';

    const button = document.createElement('div');
    button.className = 'color-picker-button';
    button.style.background = hex;
    button.dataset.paletteIndex = palette.length;

    const popup = document.createElement('div');
    popup.className = 'color-picker-popup';

    const grid = document.createElement('div');
    grid.className = 'color-picker-grid';

    // Populate color grid
    commonColors.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'color-picker-swatch';
        swatch.style.background = color;
        swatch.onclick = () => {
            button.style.background = color;
            palette[button.dataset.paletteIndex].value = color;
            popup.classList.remove('show');
            regroup();
        };
        grid.appendChild(swatch);
    });

    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'color-picker-input-wrapper';

    const hexInput = document.createElement('input');
    hexInput.type = 'text';
    hexInput.placeholder = '#FF0000';
    hexInput.maxLength = 7;
    hexInput.value = hex;

    const nativeInput = document.createElement('input');
    nativeInput.type = 'color';
    nativeInput.value = hex;

    hexInput.oninput = () => {
        let value = hexInput.value.trim();
        if (!value.startsWith('#')) value = '#' + value;
        if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            button.style.background = value.toUpperCase();
            nativeInput.value = value.toUpperCase();
            palette[button.dataset.paletteIndex].value = value.toUpperCase();
            regroup();
        }
    };

    nativeInput.oninput = () => {
        const color = nativeInput.value.toUpperCase();
        button.style.background = color;
        hexInput.value = color;
        palette[button.dataset.paletteIndex].value = color;
        regroup();
    };

    inputWrapper.appendChild(hexInput);
    inputWrapper.appendChild(nativeInput);

    popup.appendChild(grid);
    popup.appendChild(inputWrapper);

    wrapper.appendChild(button);
    wrapper.appendChild(popup);

    // Toggle popup with intelligent positioning
    button.onclick = (e) => {
        e.stopPropagation();

        // Close all other popups
        document.querySelectorAll('.color-picker-popup').forEach(p => {
            if (p !== popup) p.classList.remove('show');
        });

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

    // Store reference
    const paletteItem = { value: hex, button, popup, hexInput, nativeInput };
    palette.push(paletteItem);

    document.getElementById('palette').appendChild(wrapper);
}

// Close popups when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.color-picker-wrapper')) {
        document.querySelectorAll('.color-picker-popup').forEach(popup => {
            popup.classList.remove('show');
        });
    }
});

// Add color button handler
document.getElementById('addColor').onclick = () => {
    addColor();
    regroup();
};

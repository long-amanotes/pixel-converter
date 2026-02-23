/* ================= EXPORT / IMPORT ================= */

// Export JSON
document.getElementById('exportBtn').onclick = () => {
    const jsonData = {
        Palette: palette.map(p => p.value.slice(1)),
        Artwork: {
            Width: SIZE,
            Height: SIZE,
            PixelData: pixels.map(p => ({
                Position: { x: p.x, y: p.y },
                Group: p.group,
                ColorGroup: p.colorGroup,
                ColorType: p.colorType || 0,
                ColorHex: rgbToHex(p.r, p.g, p.b).slice(1)
            }))
        }
    };

    // Display in textarea
    document.getElementById('output').value = JSON.stringify(jsonData, null, 2);

    // Download as file
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixel_art_${SIZE}x${SIZE}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Export PNG
document.getElementById('exportPngBtn').onclick = () => {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = SIZE;
    exportCanvas.height = SIZE;
    const exportCtx = exportCanvas.getContext('2d');

    const imgData = exportCtx.createImageData(SIZE, SIZE);
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

    exportCtx.putImageData(imgData, 0, 0);

    // Convert to PNG and download
    exportCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pixel_art_${SIZE}x${SIZE}_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 'image/png');
};

// Import JSON
document.getElementById('importBtn').onclick = () => {
    document.getElementById('importFile').click();
};

document.getElementById('importFile').onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const jsonData = JSON.parse(event.target.result);

            // Validate structure
            if (!jsonData.Artwork || !jsonData.Artwork.PixelData) {
                alert('Invalid JSON format: Missing Artwork or PixelData');
                return;
            }

            // Import size
            SIZE = jsonData.Artwork.Width || SIZE;
            document.getElementById('sizeInput').value = SIZE;

            // Clear existing pixels
            pixels = [];

            // Collect unique colors and groups
            const colorMap = new Map();
            const colorList = [];
            const uniqueGroups = new Set();

            jsonData.Artwork.PixelData.forEach(pd => {
                if (!colorMap.has(pd.ColorHex)) {
                    colorMap.set(pd.ColorHex, colorList.length);
                    colorList.push(pd.ColorHex);
                }
                if (pd.Group && pd.Group !== 0) {
                    uniqueGroups.add(pd.Group);
                }
            });

            // Rebuild palette
            palette = [];
            document.getElementById('palette').innerHTML = '';

            if (jsonData.Palette && Array.isArray(jsonData.Palette)) {
                jsonData.Palette.forEach(colorHex => {
                    addColor('#' + colorHex);
                });
            } else {
                colorList.forEach(colorHex => {
                    addColor('#' + colorHex);
                });
            }

            // Rebuild data groups
            dataGroups = [{ id: 0, name: 'None' }];
            const sortedGroups = Array.from(uniqueGroups).sort((a, b) => a - b);
            sortedGroups.forEach(groupId => {
                dataGroups.push({ id: groupId, name: `Group ${groupId}` });
            });
            activeDataGroupId = 0;

            // Rebuild color type groups
            colorTypeGroups = [];
            const uniqueColorTypes = new Set();
            jsonData.Artwork.PixelData.forEach(pd => {
                if (pd.ColorType && pd.ColorType !== 0) {
                    uniqueColorTypes.add(pd.ColorType);
                }
            });

            uniqueColorTypes.forEach(typeId => {
                const samplePixel = jsonData.Artwork.PixelData.find(pd => pd.ColorType === typeId);
                if (samplePixel) {
                    colorTypeGroups.push({
                        id: typeId,
                        color: '#' + samplePixel.ColorHex,
                        name: `Type ${typeId}`
                    });
                }
            });
            activeColorTypeId = 0;

            // Import pixels
            jsonData.Artwork.PixelData.forEach(pd => {
                const hex = '#' + pd.ColorHex;
                const rgb = hexToRgb(hex);

                let colorGroupIndex = pd.ColorGroup;
                if (colorGroupIndex === undefined || colorGroupIndex === null) {
                    colorGroupIndex = colorMap.get(pd.ColorHex);
                }

                pixels.push({
                    x: pd.Position.x,
                    y: pd.Position.y,
                    r: rgb.r,
                    g: rgb.g,
                    b: rgb.b,
                    group: pd.Group || 0,
                    colorGroup: colorGroupIndex,
                    colorType: pd.ColorType || 0
                });
            });

            // Recreate canvas
            updateCanvasSize();

            const t = document.createElement('canvas');
            t.width = SIZE;
            t.height = SIZE;
            const tctx = t.getContext('2d');
            const imgData = tctx.createImageData(SIZE, SIZE);
            const data = imgData.data;

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

            // Rebuild groups
            groups = palette.map((p, i) => ({
                index: i,
                color: hexToRgb(p.value),
                pixels: pixels.filter(px => px.colorGroup === i)
            }));

            // Update UI
            renderColorGroups();
            renderColorTypeGroups();
            renderDataGroups();
            draw();

            // Display in textarea
            document.getElementById('output').value = JSON.stringify(jsonData, null, 2);

            alert(`Successfully imported ${pixels.length} pixels (${SIZE}x${SIZE})\n${colorList.length} colors, ${uniqueGroups.size} groups`);

        } catch (err) {
            alert('Error parsing JSON: ' + err.message);
            console.error(err);
        }
    };
    reader.readAsText(file);

    // Reset input
    e.target.value = '';
};

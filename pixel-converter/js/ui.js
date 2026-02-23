/* ================= UI RENDERING ================= */

function renderColorGroups() {
    const g = document.getElementById('colorGroups');
    g.innerHTML = '';
    groups.forEach(gr => {
        const d = document.createElement('div');
        d.className = 'group' + (gr.index === activeColorGroup ? ' active' : '');
        d.innerHTML = `<span class="color-box" style="background:${palette[gr.index].value}"></span>
      Color ${gr.index}: ${gr.pixels.length}px`;
        d.onclick = () => {
            activeColorGroup = activeColorGroup === gr.index ? -1 : gr.index;
            draw();
            renderColorGroups();
        };
        g.appendChild(d);
    });
}

function renderColorTypeGroups() {
    const g = document.getElementById('colorTypeGroups');
    g.innerHTML = '';

    const total = pixels.length;

    // Show statistics header
    const headerDiv = document.createElement('div');
    headerDiv.style.margin = '8px 0';
    headerDiv.innerHTML = `<b>Total pixels:</b> ${total}`;
    g.appendChild(headerDiv);

    // Show color type groups with statistics
    if (colorTypeGroups.length > 0) {
        let typeSum = 0;

        colorTypeGroups.forEach(ct => {
            const count = pixels.filter(p => p.colorType === ct.id).length;
            typeSum += count;

            const d = document.createElement('div');
            d.className = 'group' + (ct.id === activeColorTypeId ? ' active' : '');
            d.innerHTML = `<span class="color-box" style="background:${ct.color}"></span>
      Type ${ct.id}: ${count}px`;
            d.onclick = () => {
                activeColorTypeId = activeColorTypeId === ct.id ? 0 : ct.id;

                // Auto-switch to Color Type mode when selecting a color type
                if (activeColorTypeId !== 0) {
                    document.getElementById('editMode').value = 'colorType';
                    document.getElementById('editMode').dispatchEvent(new Event('change'));
                }

                draw();
                renderColorTypeGroups();
            };
            g.appendChild(d);
        });

        // Show "No Type" pixels
        const noType = pixels.filter(p => !p.colorType || p.colorType === 0).length;
        if (noType > 0) {
            const d = document.createElement('div');
            d.className = 'group';
            d.innerHTML = `<span class="color-box" style="background:#ccc"></span>
      No Type: ${noType}px`;
            g.appendChild(d);
            typeSum += noType;
        }

        // Validation message
        const validDiv = document.createElement('div');
        validDiv.style.marginTop = '6px';
        if (typeSum === total) {
            validDiv.style.color = 'green';
            validDiv.innerHTML = '✓ Type sum matches total';
        } else {
            validDiv.style.color = 'red';
            validDiv.innerHTML = `⚠ Mismatch ${typeSum} ≠ ${total}`;
        }
        g.appendChild(validDiv);
    } else {
        // No color types yet
        const d = document.createElement('div');
        d.style.opacity = '0.6';
        d.style.marginTop = '8px';
        d.innerHTML = 'No color types defined. Click "Parse from Group Color" to create them.';
        g.appendChild(d);
    }
}

// Parse color types from current group colors
document.getElementById('parseColorType').onclick = () => {
    saveState();

    colorTypeGroups = [];
    groups.forEach((gr, index) => {
        colorTypeGroups.push({
            id: index + 1,
            color: palette[index].value,
            name: `Type ${index + 1}`
        });

        // Assign color type to pixels based on their color group
        if (gr.pixels.length > 0) {
            gr.pixels.forEach(p => {
                p.colorType = index + 1;
            });
        }
    });

    activeColorTypeId = 0;
    renderColorTypeGroups();
    draw();

    alert(`Created ${colorTypeGroups.length} color type groups from group colors`);
};

function renderDataGroups() {
    const g = document.getElementById('dataGroups');
    g.innerHTML = '';

    // Calculate total pixels across all groups
    let totalGroupedPixels = 0;
    dataGroups.forEach(gr => {
        if (gr.id !== 0) {
            totalGroupedPixels += pixels.filter(p => p.group === gr.id).length;
        }
    });

    dataGroups.forEach(gr => {
        const groupPixels = pixels.filter(p => p.group === gr.id);
        const groupTotal = groupPixels.length;

        const d = document.createElement('div');
        d.className = 'group' + (gr.id === activeDataGroupId ? ' active' : '');
        d.style.flexDirection = 'column';
        d.style.alignItems = 'flex-start';

        const headerDiv = document.createElement('div');
        headerDiv.style.display = 'flex';
        headerDiv.style.alignItems = 'center';
        headerDiv.style.width = '100%';
        headerDiv.style.gap = '8px';

        const input = document.createElement('input');
        input.className = 'group-name';
        input.value = gr.name;
        input.style.flex = '1';

        // Stop input events from selecting group
        input.onclick = (e) => e.stopPropagation();
        input.onmousedown = (e) => e.stopPropagation();

        input.onkeydown = (e) => {
            if (e.key === 'Enter') input.blur();
            if (e.key === 'Escape') {
                input.value = gr.name;
                input.blur();
            }
        };

        input.onchange = () => {
            gr.name = input.value.trim() || `Group ${gr.id}`;
            input.value = gr.name;
        };

        const totalSpan = document.createElement('span');
        totalSpan.style.fontSize = '11px';
        totalSpan.style.fontWeight = '600';
        totalSpan.style.color = '#666';
        totalSpan.textContent = `${groupTotal}px`;

        headerDiv.appendChild(input);
        headerDiv.appendChild(totalSpan);

        d.appendChild(headerDiv);

        // Show color type breakdown if group has pixels (skip "None" group)
        if (groupTotal > 0 && gr.id !== 0) {
            const statsDiv = document.createElement('div');
            statsDiv.style.fontSize = '10px';
            statsDiv.style.color = '#888';
            statsDiv.style.marginTop = '4px';
            statsDiv.style.paddingLeft = '4px';
            statsDiv.style.width = '100%';

            // Count pixels by color type
            const colorTypeCounts = {};
            groupPixels.forEach(p => {
                const typeId = p.colorType || 0;
                colorTypeCounts[typeId] = (colorTypeCounts[typeId] || 0) + 1;
            });

            // Display color type breakdown
            const typeEntries = Object.entries(colorTypeCounts).sort((a, b) => b[1] - a[1]);
            typeEntries.forEach(([typeId, count]) => {
                const colorDiv = document.createElement('div');
                colorDiv.style.display = 'flex';
                colorDiv.style.alignItems = 'center';
                colorDiv.style.gap = '4px';
                colorDiv.style.marginBottom = '2px';

                const colorBox = document.createElement('span');
                colorBox.style.width = '12px';
                colorBox.style.height = '12px';
                colorBox.style.border = '1px solid #ddd';
                colorBox.style.borderRadius = '2px';
                colorBox.style.display = 'inline-block';

                const colorText = document.createElement('span');

                // Find color type info
                const typeIdNum = parseInt(typeId);
                if (typeIdNum === 0) {
                    colorBox.style.background = '#ccc';
                    colorText.textContent = `No Type: ${count}px`;
                } else {
                    const colorType = colorTypeGroups.find(ct => ct.id === typeIdNum);
                    if (colorType) {
                        colorBox.style.background = colorType.color;
                        colorText.textContent = `Type ${typeIdNum}: ${count}px`;
                    } else {
                        colorBox.style.background = '#ccc';
                        colorText.textContent = `Type ${typeIdNum}: ${count}px`;
                    }
                }

                colorDiv.appendChild(colorBox);
                colorDiv.appendChild(colorText);
                statsDiv.appendChild(colorDiv);
            });

            d.appendChild(statsDiv);
        }

        d.onclick = () => {
            activeDataGroupId = gr.id;

            // Auto-switch to Group Data mode when selecting a data group
            if (activeDataGroupId !== 0) {
                document.getElementById('editMode').value = 'group';
                document.getElementById('editMode').dispatchEvent(new Event('change'));
            }

            renderDataGroups();
            draw();
        };

        g.appendChild(d);
    });

    // Add total summary at the bottom
    if (dataGroups.length > 1) {
        const summaryDiv = document.createElement('div');
        summaryDiv.style.marginTop = '12px';
        summaryDiv.style.padding = '8px';
        summaryDiv.style.background = '#f0f0f0';
        summaryDiv.style.borderRadius = '6px';
        summaryDiv.style.fontSize = '12px';
        summaryDiv.style.fontWeight = '600';
        summaryDiv.style.color = '#333';

        const ungrouped = pixels.filter(p => p.group === 0).length;
        summaryDiv.innerHTML = `
      <div>Total grouped: ${totalGroupedPixels}px</div>
      <div style="margin-top: 4px; font-size: 11px; color: #666;">Ungrouped: ${ungrouped}px</div>
    `;

        g.appendChild(summaryDiv);
    }
}

// Data group buttons
document.getElementById('addDataGroup').onclick = () => {
    saveState();
    const id = nextGroupId();
    dataGroups.push({ id, name: `Group ${id}` });
    activeDataGroupId = id;
    renderDataGroups();
    draw();
};

document.getElementById('deleteDataGroup').onclick = () => {
    if (activeDataGroupId === 0) return;
    saveState();
    pixels.forEach(p => {
        if (p.group === activeDataGroupId) p.group = 0;
    });
    dataGroups = dataGroups.filter(g => g.id !== activeDataGroupId);
    activeDataGroupId = 0;
    renderDataGroups();
    draw();
};

document.getElementById('clearDataGroup').onclick = () => {
    if (activeDataGroupId === 0) return;
    saveState();
    pixels.forEach(p => {
        if (p.group === activeDataGroupId) p.group = 0;
    });
    draw();
};

document.getElementById('showUngrouped').onclick = () => {
    const btn = document.getElementById('showUngrouped');

    // Toggle ungrouped view
    if (activeDataGroupId === -1) {
        // Turn off ungrouped view
        activeDataGroupId = 0;
        btn.classList.remove('active');
        btn.textContent = 'Show Ungrouped';
    } else {
        // Turn on ungrouped view (use -1 as special ID for ungrouped)
        activeDataGroupId = -1;
        btn.classList.add('active');
        btn.textContent = 'Hide Ungrouped';

        // Switch to Group Data mode
        document.getElementById('editMode').value = 'group';
        document.getElementById('editMode').dispatchEvent(new Event('change'));
    }

    renderDataGroups();
    draw();
};

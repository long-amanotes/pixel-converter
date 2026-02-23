/* ================= INITIALIZATION ================= */

// Initialize the application
function init() {
    initPalette();
    initColorPicker();
    renderDataGroups();
    renderColorTypeGroups();
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

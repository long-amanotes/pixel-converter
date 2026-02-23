/* ================= IMAGE LOADING ================= */

function loadImage(file) {
    if (!file || !file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
    }

    const img = new Image();
    img.onload = () => {
        originalImage = img;
        convert(img);
    };
    img.src = URL.createObjectURL(file);
}

// File upload
document.getElementById('upload').onchange = e => {
    if (e.target.files[0]) {
        loadImage(e.target.files[0]);
    }
};

// Drag and drop functionality
const canvasWrapper = document.getElementById('canvasWrapper');

canvasWrapper.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    canvasWrapper.classList.add('drag-over');
});

canvasWrapper.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    canvasWrapper.classList.remove('drag-over');
});

canvasWrapper.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    canvasWrapper.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        loadImage(files[0]);
    }
});

// Prevent default drag behavior on document
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
});

// Copy/paste image support
document.addEventListener('paste', (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            loadImage(blob);
            break;
        }
    }
});

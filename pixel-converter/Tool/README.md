# Pixel Art Converter

A professional web-based tool for converting images to pixel art with advanced editing capabilities.

## Features

- **Image Conversion**: Convert any image to pixel art with customizable size and scaling modes
- **Color Palette Management**: Create and manage color palettes with custom color picker
- **Group Data System**: Organize pixels into data groups with detailed statistics
- **Color Type System**: Assign and manage color types for pixels
- **Edit Modes**: Paint, Erase, Group Data, and Color Type modes
- **Undo/Redo**: Full undo support (Ctrl+Z)
- **Zoom**: Adjustable zoom from 10% to 200%
- **Pixel Grid**: Visual grid overlay for precise editing
- **Export/Import**: Export to JSON or PNG, import from JSON
- **Drag & Drop**: Drag and drop images or use Ctrl+V to paste
- **Statistics**: Detailed pixel count and color type breakdown

## File Structure

```
Tool/
├── index.html          # Main HTML structure
├── styles.css          # All CSS styles
├── js/                 # JavaScript modules
│   ├── config.js       # Configuration and state
│   ├── utils.js        # Utility functions
│   ├── palette.js      # Palette management
│   ├── colorPicker.js  # Custom color picker
│   ├── imageLoader.js  # Image loading and drag/drop
│   ├── converter.js    # Image conversion logic
│   ├── canvas.js       # Canvas drawing
│   ├── undo.js         # Undo system
│   ├── editModes.js    # Edit modes (paint, erase, etc.)
│   ├── mouse.js        # Mouse interactions
│   ├── ui.js           # UI rendering
│   ├── exportImport.js # Export/Import functionality
│   └── main.js         # Initialization
└── README.md           # This file
```

## Local Development

Simply open `index.html` in a modern web browser. No build process or server required!

```bash
open Tool/index.html
```

## Deployment to Vercel

### Option 1: Using Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
cd Tool
vercel
```

### Option 2: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Set the root directory to `Tool`
5. Click "Deploy"

### Option 3: Drag & Drop

1. Go to [vercel.com/new](https://vercel.com/new)
2. Drag and drop the `Tool` folder
3. Click "Deploy"

## Configuration

No configuration needed! The tool works out of the box as a static site.

### Vercel Configuration (Optional)

Create `vercel.json` in the Tool directory if you need custom settings:

```json
{
  "cleanUrls": true,
  "trailingSlash": false
}
```

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

## Keyboard Shortcuts

- **Ctrl+Z**: Undo last action
- **Ctrl+V**: Paste image from clipboard

## Usage Tips

1. **Import Image**: Click "Choose File" or drag & drop an image
2. **Adjust Size**: Set target pixel art size (8-256px)
3. **Edit Palette**: Click color swatches to customize colors
4. **Group Pixels**: Select "Group Data" mode and drag to assign groups
5. **Color Types**: Use "Parse from Group Color" to create color types
6. **Export**: Save as JSON (with all data) or PNG (pixel art only)

## Technical Details

- Pure HTML/CSS/JavaScript - no frameworks
- Modular JavaScript architecture (13 modules)
- Canvas API for image processing
- LocalStorage not used - all data in memory
- Total size: ~64KB (uncompressed)

## License

MIT License - Feel free to use and modify!

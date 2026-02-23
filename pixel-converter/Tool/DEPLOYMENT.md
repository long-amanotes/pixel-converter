# Deployment Guide

## Files Overview

The Pixel Art Converter has been split into modular files for better maintainability:

### Main Files
- **index.html** (6.5KB) - HTML structure
- **styles.css** (9.5KB) - All styling
- **js/** - JavaScript modules (13 files, ~48KB total)
  - `config.js` - Configuration and state management
  - `utils.js` - Utility functions
  - `palette.js` - Palette management
  - `colorPicker.js` - Custom color picker
  - `imageLoader.js` - Image loading and drag/drop
  - `converter.js` - Image conversion logic
  - `canvas.js` - Canvas drawing and zoom
  - `undo.js` - Undo/redo system
  - `editModes.js` - Edit modes (paint, erase, group, color type)
  - `mouse.js` - Mouse interactions
  - `ui.js` - UI rendering
  - `exportImport.js` - Export/Import functionality
  - `main.js` - Application initialization

### Legacy Files
- **app.js** (48KB) - Original monolithic JavaScript (kept for reference)
- **PixelConverter.html** (64KB) - Original single-file version (kept for reference)

## Quick Deploy to Vercel

### Method 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to Tool directory
cd Tool

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? (press enter for default)
# - Directory? ./ (current directory)
# - Override settings? No

# Your site will be live at: https://your-project.vercel.app
```

### Method 2: Vercel Dashboard

1. Go to https://vercel.com/new
2. Click "Add New Project"
3. Import your Git repository OR drag & drop the `Tool` folder
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: Tool (if deploying from repo root)
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
5. Click "Deploy"

### Method 3: Drag & Drop (Easiest)

1. Zip the Tool folder contents (index.html, styles.css, app.js, vercel.json)
2. Go to https://vercel.com/new
3. Drag and drop the zip file
4. Click "Deploy"

## Testing Locally

No server needed! Just open `index.html` in your browser:

```bash
# macOS
open Tool/index.html

# Linux
xdg-open Tool/index.html

# Windows
start Tool/index.html
```

Or use a simple HTTP server:

```bash
# Python 3
cd Tool
python3 -m http.server 8000

# Node.js (with http-server)
npx http-server Tool -p 8000

# Then visit: http://localhost:8000
```

## File Structure for Deployment

```
Tool/
├── index.html          # Entry point
├── styles.css          # Styles
├── js/                 # JavaScript modules (13 files)
│   ├── config.js
│   ├── utils.js
│   ├── palette.js
│   ├── colorPicker.js
│   ├── imageLoader.js
│   ├── converter.js
│   ├── canvas.js
│   ├── undo.js
│   ├── editModes.js
│   ├── mouse.js
│   ├── ui.js
│   ├── exportImport.js
│   └── main.js
├── vercel.json         # Vercel config (optional)
├── README.md           # Documentation
└── DEPLOYMENT.md       # This file
```

## Vercel Configuration

The included `vercel.json` provides:
- Clean URLs (no .html extension)
- No trailing slashes
- Automatic HTTPS
- Global CDN

## Post-Deployment

After deployment, your tool will be available at:
- Production: `https://your-project.vercel.app`
- Preview: `https://your-project-git-branch.vercel.app` (for each branch)

## Custom Domain (Optional)

1. Go to your project settings on Vercel
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Wait for SSL certificate (automatic)

## Environment

- **Runtime**: Static (no server-side code)
- **Build**: None required
- **Dependencies**: None
- **Size**: ~64KB total
- **Load Time**: < 1 second

## Troubleshooting

### Issue: Files not loading
- **Solution**: Ensure all files (index.html, styles.css, and js/ folder with all modules) are in the correct structure

### Issue: 404 on Vercel
- **Solution**: Check that index.html is in the root of your deployment directory and the js/ folder is present

### Issue: Styles not applying
- **Solution**: Verify styles.css path in index.html: `<link rel="stylesheet" href="styles.css">`

### Issue: JavaScript not working
- **Solution**: Verify all JS modules are loading in correct order in index.html. Check browser console for errors.

## Performance

- **First Load**: ~64KB (uncompressed)
- **With Gzip**: ~15KB
- **Lighthouse Score**: 95+
- **Mobile Friendly**: Yes
- **PWA Ready**: Can be enhanced

## Updates

To update your deployment:

```bash
# Make changes to files
# Then redeploy
cd Tool
vercel --prod
```

Or push to Git and Vercel will auto-deploy.

## Support

For issues or questions:
- Check browser console for errors
- Verify all files are present
- Test locally first
- Check Vercel deployment logs

## Success Checklist

- [ ] All files in correct structure (HTML, CSS, js/ folder with 13 modules)
- [ ] Files can be opened locally in browser
- [ ] No console errors when testing locally
- [ ] Vercel account created
- [ ] Project deployed successfully
- [ ] Site loads at Vercel URL
- [ ] All features working (upload, edit, export)

## Next Steps

1. Test the tool locally
2. Deploy to Vercel
3. Share the URL
4. (Optional) Add custom domain
5. (Optional) Enable analytics

Happy deploying! 🚀

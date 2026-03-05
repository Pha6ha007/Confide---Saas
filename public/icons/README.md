# PWA Icons

These SVG icons need to be converted to PNG format for PWA compatibility.

## Quick conversion options:

1. **Online converter:** https://cloudconvert.com/svg-to-png
   - Upload icon-192x192.svg → set width to 192px
   - Upload icon-512x512.svg → set width to 512px

2. **ImageMagick (if installed):**
   ```bash
   convert icon-192x192.svg -resize 192x192 icon-192x192.png
   convert icon-512x512.svg -resize 512x512 icon-512x512.png
   ```

3. **Figma/Sketch/Photoshop:**
   - Import SVG
   - Export as PNG at correct dimensions

Once converted, replace the .svg files with .png files in this directory.

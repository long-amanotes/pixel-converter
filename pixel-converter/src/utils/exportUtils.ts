/**
 * Export utilities for the Pixel Converter application
 * Handles JSON and PNG export functionality
 */

import type { Pixel, ExportedData, ExportedPixel } from '../types';
import { rgbToHex } from './colorUtils';

/**
 * Export pixel art data to JSON format
 * 
 * Requirements:
 * - 9.1: Generate JSON file with palette, dimensions, and pixel data
 * - 9.2: Include Position, Group, ColorGroup, ColorType, and ColorHex for each pixel
 * 
 * @param pixels - Array of pixels to export
 * @param palette - Array of hex color strings (with # prefix)
 * @param size - Width and height of the pixel art (assumes square)
 * @returns ExportedData object ready for JSON serialization
 */
export function exportJSON(
  pixels: Pixel[],
  palette: string[],
  size: number
): ExportedData {
  // Convert palette to format without # prefix
  const exportedPalette = palette.map((color) =>
    color.startsWith('#') ? color.slice(1) : color
  );

  // Convert pixels to exported format
  const exportedPixels: ExportedPixel[] = pixels.map((pixel) => ({
    Position: {
      x: pixel.x,
      y: pixel.y,
    },
    Group: pixel.group,
    ColorGroup: pixel.colorGroup,
    ColorType: pixel.colorType,
    ColorHex: rgbToHex(pixel.r, pixel.g, pixel.b).slice(1), // Remove # prefix
  }));

  return {
    Palette: exportedPalette,
    Artwork: {
      Width: size,
      Height: size,
      PixelData: exportedPixels,
    },
  };
}

/**
 * Export pixel art as PNG image using canvas API
 * 
 * Requirements:
 * - 9.3: Generate PNG image at native pixel art resolution
 * - 9.4: Preserve transparency for empty pixels
 * - 9.5: Automatically download with timestamped filename
 * 
 * @param pixels - Array of pixels to export
 * @param size - Width and height of the pixel art (assumes square)
 * @param filename - Optional filename (defaults to timestamped name)
 */
export function exportPNG(
  pixels: Pixel[],
  size: number,
  filename?: string
): void {
  // Create a canvas at the native pixel art resolution
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas 2D context');
  }

  // Clear canvas to transparent
  ctx.clearRect(0, 0, size, size);

  // Create a map of pixel positions for quick lookup
  const pixelMap = new Map<string, Pixel>();
  for (const pixel of pixels) {
    pixelMap.set(`${pixel.x},${pixel.y}`, pixel);
  }

  // Draw each pixel
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const pixel = pixelMap.get(`${x},${y}`);
      if (pixel) {
        // Set pixel color (opaque)
        ctx.fillStyle = rgbToHex(pixel.r, pixel.g, pixel.b);
        ctx.fillRect(x, y, 1, 1);
      }
      // Empty pixels remain transparent (already cleared)
    }
  }

  // Convert canvas to blob and download
  canvas.toBlob((blob) => {
    if (!blob) {
      throw new Error('Failed to create PNG blob');
    }

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Generate timestamped filename if not provided
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.download = filename || `pixel-art-${timestamp}.png`;
    
    link.href = url;
    link.click();

    // Clean up
    URL.revokeObjectURL(url);
  }, 'image/png');
}

/**
 * Download JSON data as a file
 * 
 * Requirements:
 * - 9.5: Automatically download with timestamped filename
 * 
 * @param data - ExportedData object to download
 * @param filename - Optional filename (defaults to timestamped name)
 */
export function downloadJSON(data: ExportedData, filename?: string): void {
  // Convert data to JSON string with pretty formatting
  const jsonString = JSON.stringify(data, null, 2);
  
  // Create blob
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Create download link
  const link = document.createElement('a');
  
  // Generate timestamped filename if not provided
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  link.download = filename || `pixel-art-${timestamp}.json`;
  
  link.href = url;
  link.click();
  
  // Clean up
  URL.revokeObjectURL(url);
}

import { RGB } from '../types/pixel';

/**
 * Convert a hex color string to RGB object
 * Handles both formats: "#FF0000" and "FF0000"
 * 
 * @param hex - Hex color string (with or without # prefix)
 * @returns RGB object with r, g, b values (0-255)
 */
export function hexToRgb(hex: string): RGB {
  // Remove # prefix if present
  const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
  
  // Parse hex values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  return { r, g, b };
}

/**
 * Convert RGB values to hex color string
 * 
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns Hex color string with # prefix (e.g., "#ff0080")
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (value: number): string => {
    const hex = Math.max(0, Math.min(255, Math.round(value))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Calculate the Euclidean distance squared between two colors in RGB space
 * Using squared distance avoids the expensive sqrt operation while maintaining
 * the same ordering for comparison purposes
 * 
 * @param c1 - First RGB color
 * @param c2 - Second RGB color
 * @returns Euclidean distance squared between the two colors
 */
export function colorDistance(c1: RGB, c2: RGB): number {
  const dr = c1.r - c2.r;
  const dg = c1.g - c2.g;
  const db = c1.b - c2.b;
  
  return dr * dr + dg * dg + db * db;
}

/**
 * Find the index of the nearest palette color to a given RGB color
 * Uses Euclidean distance squared for comparison
 * 
 * @param color - RGB color to match
 * @param palette - Array of hex color strings
 * @returns Index of the nearest palette color
 */
export function findNearestPaletteColor(color: RGB, palette: string[]): number {
  if (palette.length === 0) {
    return -1;
  }
  
  let nearestIndex = 0;
  let minDistance = Infinity;
  
  for (let i = 0; i < palette.length; i++) {
    const hexColor = palette[i];
    if (!hexColor) continue;
    
    const paletteColor = hexToRgb(hexColor);
    const distance = colorDistance(color, paletteColor);
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestIndex = i;
    }
  }
  
  return nearestIndex;
}

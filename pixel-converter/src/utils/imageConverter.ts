/**
 * Image Converter Utility
 * 
 * Provides functions to convert images to pixel art using different sampling methods:
 * - Block Majority: Uses majority voting within blocks for color selection
 * - Nearest Neighbor: Uses simple nearest neighbor sampling for scaling
 * 
 * Requirements: 2.4, 2.5, 2.6
 */

import { Pixel } from '../types/pixel';

/**
 * Alpha cutoff threshold - pixels with alpha below this value are considered transparent
 */
export const ALPHA_CUTOFF = 10;

/**
 * Converts an image to pixel art using block majority sampling.
 * 
 * For each target pixel, this function:
 * 1. Calculates the corresponding block in the source image
 * 2. Counts the occurrence of each color in the block
 * 3. Selects the most common (majority) color
 * 
 * @param imageData - The source image data from a canvas context
 * @param targetSize - The target size for the pixel art (width and height)
 * @returns Array of Pixel objects representing the converted pixel art
 * 
 * Requirements: 2.4, 2.5
 */
export function blockMajorityConvert(imageData: ImageData, targetSize: number): Pixel[] {
  const pixels: Pixel[] = [];
  const { width, height, data } = imageData;
  
  // Calculate block size for each target pixel
  const blockWidth = width / targetSize;
  const blockHeight = height / targetSize;
  
  for (let ty = 0; ty < targetSize; ty++) {
    for (let tx = 0; tx < targetSize; tx++) {
      // Calculate the source block boundaries
      const startX = Math.floor(tx * blockWidth);
      const endX = Math.floor((tx + 1) * blockWidth);
      const startY = Math.floor(ty * blockHeight);
      const endY = Math.floor((ty + 1) * blockHeight);
      
      // Count colors in the block using a map
      const colorCounts = new Map<string, { r: number; g: number; b: number; count: number }>();
      let transparentCount = 0;
      let totalPixels = 0;
      
      for (let sy = startY; sy < endY; sy++) {
        for (let sx = startX; sx < endX; sx++) {
          // Ensure we don't go out of bounds
          if (sx >= width || sy >= height) continue;
          
          const idx = (sy * width + sx) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];
          
          totalPixels++;
          
          // Skip transparent pixels
          if (a < ALPHA_CUTOFF) {
            transparentCount++;
            continue;
          }
          
          // Create a color key for counting
          const colorKey = `${r},${g},${b}`;
          
          if (colorCounts.has(colorKey)) {
            const existing = colorCounts.get(colorKey)!;
            existing.count++;
          } else {
            colorCounts.set(colorKey, { r, g, b, count: 1 });
          }
        }
      }
      
      // If majority of pixels are transparent, skip this pixel
      if (transparentCount > totalPixels / 2 || colorCounts.size === 0) {
        continue;
      }
      
      // Find the majority color
      let majorityColor = { r: 0, g: 0, b: 0, count: 0 };
      for (const color of colorCounts.values()) {
        if (color.count > majorityColor.count) {
          majorityColor = color;
        }
      }
      
      // Create the pixel with default metadata
      pixels.push({
        x: tx,
        y: ty,
        r: majorityColor.r,
        g: majorityColor.g,
        b: majorityColor.b,
        colorGroup: 0,
        group: 0,
        colorType: 0,
      });
    }
  }
  
  return pixels;
}

/**
 * Converts an image to pixel art using nearest neighbor sampling.
 * 
 * For each target pixel, this function:
 * 1. Calculates the corresponding position in the source image
 * 2. Samples the color at that position directly
 * 
 * This is a simpler and faster method than block majority but may produce
 * less smooth results for images with fine details.
 * 
 * @param imageData - The source image data from a canvas context
 * @param targetSize - The target size for the pixel art (width and height)
 * @returns Array of Pixel objects representing the converted pixel art
 * 
 * Requirements: 2.4, 2.6
 */
export function nearestNeighborConvert(imageData: ImageData, targetSize: number): Pixel[] {
  const pixels: Pixel[] = [];
  const { width, height, data } = imageData;
  
  // Calculate scale factors
  const scaleX = width / targetSize;
  const scaleY = height / targetSize;
  
  for (let ty = 0; ty < targetSize; ty++) {
    for (let tx = 0; tx < targetSize; tx++) {
      // Calculate the source position (center of the corresponding area)
      const sx = Math.floor((tx + 0.5) * scaleX);
      const sy = Math.floor((ty + 0.5) * scaleY);
      
      // Clamp to valid range
      const clampedX = Math.min(sx, width - 1);
      const clampedY = Math.min(sy, height - 1);
      
      // Get the pixel data at the source position
      const idx = (clampedY * width + clampedX) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];
      
      // Skip transparent pixels
      if (a < ALPHA_CUTOFF) {
        continue;
      }
      
      // Create the pixel with default metadata
      pixels.push({
        x: tx,
        y: ty,
        r,
        g,
        b,
        colorGroup: 0,
        group: 0,
        colorType: 0,
      });
    }
  }
  
  return pixels;
}

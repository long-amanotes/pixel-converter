/**
 * Palette slice for managing color palette state
 * Handles palette colors and color groups
 */

import type { StateCreator } from 'zustand';
import type { ColorGroup, Pixel, RGB } from '../../types';
import type { PaletteSlice, PixelConverterState } from '../types';
import { findNearestPaletteColor, hexToRgb } from '../../utils/colorUtils';

/**
 * Default palette colors (9 preset colors as per requirements)
 */
export const DEFAULT_PALETTE: string[] = [
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFFFFF', // White
  '#000000', // Black
  '#808080', // Gray
];

/**
 * Creates the palette slice for the Zustand store
 * Manages palette colors and color group assignments
 */
export const createPaletteSlice: StateCreator<
  PixelConverterState,
  [],
  [],
  PaletteSlice
> = (set, get) => ({
  // Initial state with 9 preset colors
  palette: [...DEFAULT_PALETTE],
  colorGroups: [],

  // Actions
  addPaletteColor: (color: string) =>
    set((state) => ({
      palette: [...state.palette, color],
    })),

  updatePaletteColor: (index: number, color: string) =>
    set((state) => {
      if (index < 0 || index >= state.palette.length) {
        return state;
      }
      const newPalette = [...state.palette];
      newPalette[index] = color;
      return { palette: newPalette };
    }),

  setPalette: (palette: string[]) =>
    set(() => ({
      palette,
    })),

  setColorGroups: (colorGroups: ColorGroup[]) =>
    set(() => ({
      colorGroups,
    })),

  /**
   * Regroups all pixels by assigning each to the nearest palette color
   * Implements Requirements 4.3 and 4.4:
   * - Automatically assigns each pixel to the nearest palette color group
   * - Recalculates all pixel color group assignments when palette changes
   */
  regroup: () =>
    set((state) => {
      const { pixels, palette } = state;

      // If no pixels or empty palette, nothing to regroup
      if (pixels.length === 0 || palette.length === 0) {
        return { colorGroups: [] };
      }

      // Create updated pixels with new colorGroup assignments
      const updatedPixels: Pixel[] = pixels.map((pixel) => {
        const pixelColor: RGB = { r: pixel.r, g: pixel.g, b: pixel.b };
        const nearestIndex = findNearestPaletteColor(pixelColor, palette);
        
        return {
          ...pixel,
          colorGroup: nearestIndex,
        };
      });

      // Build color groups from updated pixels
      const colorGroupsMap = new Map<number, Pixel[]>();
      
      for (const pixel of updatedPixels) {
        if (!colorGroupsMap.has(pixel.colorGroup)) {
          colorGroupsMap.set(pixel.colorGroup, []);
        }
        colorGroupsMap.get(pixel.colorGroup)!.push(pixel);
      }

      // Create ColorGroup objects
      const newColorGroups: ColorGroup[] = Array.from(
        colorGroupsMap.entries()
      ).map(([index, groupPixels]) => {
        const paletteColor = palette[index];
        if (!paletteColor) {
          throw new Error(`Palette color at index ${index} is undefined`);
        }
        return {
          index,
          color: hexToRgb(paletteColor),
          pixels: groupPixels,
        };
      });

      // Sort by index for consistent ordering
      newColorGroups.sort((a, b) => a.index - b.index);

      return {
        pixels: updatedPixels,
        colorGroups: newColorGroups,
      };
    }),
});

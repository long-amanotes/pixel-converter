/**
 * Pixel slice for managing pixel data state
 * Handles pixel array and size configuration
 */

import type { StateCreator } from 'zustand';
import type { Pixel, ExportedData } from '../../types';
import type { PixelSlice, PixelConverterState } from '../types';
import { importJSON } from '../../utils/importUtils';

/**
 * Creates the pixel slice for the Zustand store
 * Manages pixel data and size state
 */
export const createPixelSlice: StateCreator<
  PixelConverterState,
  [],
  [],
  PixelSlice
> = (set) => ({
  // Initial state
  pixels: [],
  size: 32, // Default size

  // Actions
  setPixels: (pixels: Pixel[]) =>
    set(() => ({
      pixels,
    })),

  setSize: (size: number) =>
    set(() => ({
      // Clamp size between 8 and 256 as per requirements
      size: Math.max(8, Math.min(256, size)),
    })),

  /**
   * Import pixel art data from JSON
   * 
   * Requirements:
   * - 10.1: Parse and load JSON data
   * - 10.2: Restore palette, pixel data, data groups, and color types
   * 
   * @param data - Unknown data to import (will be validated)
   * @throws ImportValidationError if validation fails
   */
  importFromJSON: (data: unknown) =>
    set((state) => {
      // Import and validate the data
      const imported = importJSON(data);

      // Update all relevant state
      return {
        pixels: imported.pixels,
        size: imported.size,
        palette: imported.palette,
        dataGroups: imported.dataGroups,
        colorTypes: imported.colorTypes,
        // Reset UI state
        selectedPixels: new Set<string>(),
        activeDataGroupId: 0,
        activeColorTypeId: 0,
        activeColorGroup: -1,
      };
    }),

  /**
   * Apply paint color to selected pixels
   * 
   * Requirements:
   * - 5.3: Allow selecting pixels and applying a chosen color
   * - 5.5: Only affect pixels matching color group filter if active
   * 
   * Property 6: Paint Operation Color Application
   * For any set of selected pixels and paint color, applying paint SHALL change
   * all selected pixels' RGB values to match the paint color.
   * 
   * @param pixelKeys - Array of pixel keys in "x,y" format
   * @param color - Hex color string (e.g., "#ff0000")
   */
  applyPaintColor: (pixelKeys: string[], color: string) =>
    set((state) => {
      const { pixels, activeColorGroup } = state;

      // Parse hex color to RGB
      const hexMatch = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
      if (!hexMatch) {
        return state;
      }

      const r = parseInt(hexMatch[1]!, 16);
      const g = parseInt(hexMatch[2]!, 16);
      const b = parseInt(hexMatch[3]!, 16);

      // Create a set for O(1) lookup
      const pixelKeySet = new Set(pixelKeys);

      // Update pixels that match the selection
      // If activeColorGroup is set, only affect pixels in that color group (Property 8)
      const updatedPixels = pixels.map((pixel) => {
        const key = `${pixel.x},${pixel.y}`;
        if (!pixelKeySet.has(key)) {
          return pixel;
        }

        // Check color group filter (Requirement 5.5)
        if (activeColorGroup >= 0 && pixel.colorGroup !== activeColorGroup) {
          return pixel;
        }

        // Apply paint color (Property 6)
        return { ...pixel, r, g, b };
      });

      return {
        pixels: updatedPixels,
      };
    }),

  /**
   * Erase selected pixels by removing them from the pixel array
   * 
   * Requirements:
   * - 5.4: Allow selecting pixels and removing them
   * - 5.5: Only affect pixels matching color group filter if active
   * 
   * Property 7: Erase Operation Pixel Removal
   * For any set of selected pixels, erasing SHALL remove exactly those pixels
   * from the pixel array.
   * 
   * @param pixelKeys - Array of pixel keys in "x,y" format
   */
  eraseSelectedPixels: (pixelKeys: string[]) =>
    set((state) => {
      const { pixels, activeColorGroup } = state;

      // Create a set for O(1) lookup
      const pixelKeySet = new Set(pixelKeys);

      // Remove pixels that match the selection
      // If activeColorGroup is set, only affect pixels in that color group (Property 8)
      const updatedPixels = pixels.filter((pixel) => {
        const key = `${pixel.x},${pixel.y}`;
        if (!pixelKeySet.has(key)) {
          return true; // Keep pixel
        }

        // Check color group filter (Requirement 5.5)
        if (activeColorGroup >= 0 && pixel.colorGroup !== activeColorGroup) {
          return true; // Keep pixel (not in active color group)
        }

        // Remove pixel (Property 7)
        return false;
      });

      return {
        pixels: updatedPixels,
      };
    }),
});

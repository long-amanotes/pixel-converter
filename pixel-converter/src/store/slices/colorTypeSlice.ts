/**
 * Color type slice for managing color type state
 * Handles color type creation, selection, and pixel assignment
 *
 * Requirements:
 * - 7.1: Parse color types from existing color groups
 * - 7.4: When a color type is selected, automatically switch to "Color Type" edit mode
 * - 7.5: When pixels are assigned to a color type, update the statistics display
 */

import type { StateCreator } from 'zustand';
import type { ColorType } from '../../types';
import type { PixelConverterState } from '../types';

/**
 * ColorTypeSlice interface for color type management
 */
export interface ColorTypeSlice {
  // Color types state
  colorTypes: ColorType[];
  activeColorTypeId: number;

  // Actions
  parseColorTypes: () => void;
  setActiveColorType: (id: number) => void;
  setColorTypes: (colorTypes: ColorType[]) => void;
  assignPixelsToColorType: (pixelKeys: string[], colorTypeId: number) => void;
}

/**
 * Converts RGB values to hex color string
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Creates the color type slice for the Zustand store
 * Manages color types and their operations
 */
export const createColorTypeSlice: StateCreator<
  PixelConverterState,
  [],
  [],
  ColorTypeSlice
> = (set) => ({
  // Initial state
  colorTypes: [],
  activeColorTypeId: 0,

  // Actions

  /**
   * Parse color types from existing color groups
   * Requirement 7.1: Create color types from existing color groups
   *
   * Creates one color type per non-empty color group.
   * Each pixel is assigned to the color type corresponding to its color group.
   */
  parseColorTypes: () =>
    set((state) => {
      const { colorGroups, pixels } = state;

      // Filter to only non-empty color groups
      const nonEmptyGroups = colorGroups.filter(
        (group) => group.pixels.length > 0
      );

      // Create color types from non-empty color groups
      const newColorTypes: ColorType[] = nonEmptyGroups.map((group, index) => ({
        id: index + 1, // Start IDs from 1
        color: rgbToHex(group.color.r, group.color.g, group.color.b),
        name: `Color ${index + 1}`,
      }));

      // Create a mapping from colorGroup index to colorType id
      const colorGroupToColorType = new Map<number, number>();
      nonEmptyGroups.forEach((group, index) => {
        colorGroupToColorType.set(group.index, index + 1);
      });

      // Assign each pixel to its corresponding color type based on colorGroup
      // Requirement 7.5: Update statistics when pixels are assigned
      const updatedPixels = pixels.map((pixel) => {
        const colorTypeId = colorGroupToColorType.get(pixel.colorGroup) ?? 0;
        return { ...pixel, colorType: colorTypeId };
      });

      return {
        colorTypes: newColorTypes,
        pixels: updatedPixels,
        activeColorTypeId: newColorTypes.length > 0 ? newColorTypes[0]!.id : 0,
      };
    }),

  /**
   * Set the active color type
   * Requirement 7.4: When a color type is selected, automatically switch to "Color Type" edit mode
   */
  setActiveColorType: (id: number) =>
    set(() => ({
      activeColorTypeId: id,
      // Automatically switch to colorType edit mode when selecting a color type
      editMode: 'colorType',
    })),

  /**
   * Set color types directly (for import functionality)
   */
  setColorTypes: (colorTypes: ColorType[]) =>
    set(() => ({
      colorTypes,
    })),

  /**
   * Assign selected pixels to a color type
   * Requirement 7.5: When pixels are assigned to a color type, update the statistics display
   *
   * @param pixelKeys - Array of pixel keys in "x,y" format
   * @param colorTypeId - The color type ID to assign to the pixels
   */
  assignPixelsToColorType: (pixelKeys: string[], colorTypeId: number) =>
    set((state) => {
      const { pixels, colorTypes, activeColorGroup } = state;

      // Verify the color type exists
      const colorTypeExists = colorTypes.some((ct) => ct.id === colorTypeId);
      if (!colorTypeExists && colorTypeId !== 0) {
        return state;
      }

      // Create a set for O(1) lookup
      const pixelKeySet = new Set(pixelKeys);

      // Update pixels that match the selection
      // If activeColorGroup is set, only affect pixels in that color group
      const updatedPixels = pixels.map((pixel) => {
        const key = `${pixel.x},${pixel.y}`;
        if (!pixelKeySet.has(key)) {
          return pixel;
        }

        // Check color group filter
        if (activeColorGroup >= 0 && pixel.colorGroup !== activeColorGroup) {
          return pixel;
        }

        return { ...pixel, colorType: colorTypeId };
      });

      return {
        pixels: updatedPixels,
      };
    }),
});

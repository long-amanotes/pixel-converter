import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { exportJSON } from '../../utils/exportUtils';
import { importJSON } from '../../utils/importUtils';
import type { Pixel, DataGroup, ColorType } from '../../types';

/**
 * Property-Based Tests for Export/Import Round-Trip
 * 
 * **Validates: Requirements 10.5**
 * 
 * Property 15: Export/Import Round-Trip
 * For any valid pixel converter state, exporting to JSON and then importing
 * that JSON SHALL produce an equivalent state (same pixels, palette, data groups, and color types).
 */

// Arbitrary generators for property tests

/**
 * Generate a valid RGB value (0-255)
 */
const arbitraryRgbValue = () => fc.integer({ min: 0, max: 255 });

/**
 * Generate a valid hex color string with # prefix
 */
const arbitraryHexColor = (): fc.Arbitrary<string> =>
  fc.tuple(arbitraryRgbValue(), arbitraryRgbValue(), arbitraryRgbValue()).map(
    ([r, g, b]) => {
      const toHex = (v: number) => v.toString(16).padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
  );

/**
 * Generate a non-empty palette (1-16 colors)
 */
const arbitraryPalette = (): fc.Arbitrary<string[]> =>
  fc.array(arbitraryHexColor(), { minLength: 1, maxLength: 16 });

/**
 * Generate a valid pixel with constrained coordinates
 */
const arbitraryPixel = (maxSize: number): fc.Arbitrary<Pixel> =>
  fc.record({
    x: fc.integer({ min: 0, max: maxSize - 1 }),
    y: fc.integer({ min: 0, max: maxSize - 1 }),
    r: arbitraryRgbValue(),
    g: arbitraryRgbValue(),
    b: arbitraryRgbValue(),
    colorGroup: fc.integer({ min: 0, max: 15 }),
    group: fc.integer({ min: 0, max: 10 }),
    colorType: fc.integer({ min: 0, max: 10 }),
  });

/**
 * Generate an array of unique pixels (no duplicate positions)
 */
const arbitraryUniquePixels = (size: number): fc.Arbitrary<Pixel[]> =>
  fc
    .array(arbitraryPixel(size), { minLength: 1, maxLength: Math.min(100, size * size) })
    .map((pixels) => {
      // Ensure unique positions by using a map
      const uniquePixelsMap = new Map<string, Pixel>();
      for (const pixel of pixels) {
        const key = `${pixel.x},${pixel.y}`;
        if (!uniquePixelsMap.has(key)) {
          uniquePixelsMap.set(key, pixel);
        }
      }
      return Array.from(uniquePixelsMap.values());
    })
    .filter((pixels) => pixels.length > 0); // Ensure at least one pixel

/**
 * Generate a valid size for pixel art (8-64 for testing performance)
 */
const arbitrarySize = (): fc.Arbitrary<number> =>
  fc.integer({ min: 8, max: 64 });

/**
 * Generate a complete pixel converter state for testing
 */
const arbitraryPixelState = (): fc.Arbitrary<{
  pixels: Pixel[];
  palette: string[];
  size: number;
}> =>
  fc
    .tuple(arbitrarySize(), arbitraryPalette())
    .chain(([size, palette]) =>
      arbitraryUniquePixels(size).map((pixels) => ({
        pixels,
        palette,
        size,
      }))
    );

describe('Property 15: Export/Import Round-Trip', () => {
  /**
   * **Validates: Requirements 10.5**
   * 
   * Property: Export then import produces equivalent state
   * For any valid pixel converter state, exporting to JSON and then importing
   * that JSON SHALL produce an equivalent state.
   */
  describe('export then import produces equivalent state', () => {
    it('should preserve all pixels through export/import cycle', () => {
      fc.assert(
        fc.property(arbitraryPixelState(), (state) => {
          // Export the state
          const exported = exportJSON(state.pixels, state.palette, state.size);

          // Import the exported data
          const imported = importJSON(exported);

          // Property: Same number of pixels
          expect(imported.pixels).toHaveLength(state.pixels.length);

          // Property: Same size
          expect(imported.size).toBe(state.size);

          // Property: Each original pixel exists in imported state with same properties
          for (const originalPixel of state.pixels) {
            const importedPixel = imported.pixels.find(
              (p) => p.x === originalPixel.x && p.y === originalPixel.y
            );

            expect(importedPixel).toBeDefined();
            expect(importedPixel?.r).toBe(originalPixel.r);
            expect(importedPixel?.g).toBe(originalPixel.g);
            expect(importedPixel?.b).toBe(originalPixel.b);
            expect(importedPixel?.colorGroup).toBe(originalPixel.colorGroup);
            expect(importedPixel?.group).toBe(originalPixel.group);
            expect(importedPixel?.colorType).toBe(originalPixel.colorType);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve palette through export/import cycle', () => {
      fc.assert(
        fc.property(arbitraryPixelState(), (state) => {
          // Export the state
          const exported = exportJSON(state.pixels, state.palette, state.size);

          // Import the exported data
          const imported = importJSON(exported);

          // Property: Same palette length
          expect(imported.palette).toHaveLength(state.palette.length);

          // Property: Same palette colors (case-insensitive)
          for (let i = 0; i < state.palette.length; i++) {
            expect(imported.palette[i].toLowerCase()).toBe(
              state.palette[i].toLowerCase()
            );
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve data groups through export/import cycle', () => {
      fc.assert(
        fc.property(arbitraryPixelState(), (state) => {
          // Export the state
          const exported = exportJSON(state.pixels, state.palette, state.size);

          // Import the exported data
          const imported = importJSON(exported);

          // Extract unique data group IDs from original pixels
          const originalGroupIds = new Set(state.pixels.map((p) => p.group));

          // Property: All original group IDs are present in imported data groups
          for (const groupId of originalGroupIds) {
            const importedGroup = imported.dataGroups.find((g) => g.id === groupId);
            expect(importedGroup).toBeDefined();
          }

          // Property: Imported data groups always include the default "None" group (id: 0)
          const noneGroup = imported.dataGroups.find((g) => g.id === 0);
          expect(noneGroup).toBeDefined();
          expect(noneGroup?.name).toBe('None');
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve color types through export/import cycle', () => {
      fc.assert(
        fc.property(arbitraryPixelState(), (state) => {
          // Export the state
          const exported = exportJSON(state.pixels, state.palette, state.size);

          // Import the exported data
          const imported = importJSON(exported);

          // Extract unique color type IDs from original pixels (excluding 0)
          const originalColorTypeIds = new Set(
            state.pixels.filter((p) => p.colorType > 0).map((p) => p.colorType)
          );

          // Property: All original color type IDs are present in imported color types
          for (const colorTypeId of originalColorTypeIds) {
            const importedColorType = imported.colorTypes.find(
              (ct) => ct.id === colorTypeId
            );
            expect(importedColorType).toBeDefined();
          }

          // Property: Number of imported color types matches unique non-zero color types
          expect(imported.colorTypes.length).toBe(originalColorTypeIds.size);
        }),
        { numRuns: 100 }
      );
    });

    it('should maintain pixel position uniqueness through export/import cycle', () => {
      fc.assert(
        fc.property(arbitraryPixelState(), (state) => {
          // Export the state
          const exported = exportJSON(state.pixels, state.palette, state.size);

          // Import the exported data
          const imported = importJSON(exported);

          // Property: No duplicate pixel positions in imported data
          const positionSet = new Set<string>();
          for (const pixel of imported.pixels) {
            const key = `${pixel.x},${pixel.y}`;
            expect(positionSet.has(key)).toBe(false);
            positionSet.add(key);
          }

          // Property: Same number of unique positions
          expect(positionSet.size).toBe(state.pixels.length);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve pixel coordinates within bounds through export/import cycle', () => {
      fc.assert(
        fc.property(arbitraryPixelState(), (state) => {
          // Export the state
          const exported = exportJSON(state.pixels, state.palette, state.size);

          // Import the exported data
          const imported = importJSON(exported);

          // Property: All imported pixels have coordinates within [0, size-1]
          for (const pixel of imported.pixels) {
            expect(pixel.x).toBeGreaterThanOrEqual(0);
            expect(pixel.x).toBeLessThan(state.size);
            expect(pixel.y).toBeGreaterThanOrEqual(0);
            expect(pixel.y).toBeLessThan(state.size);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve RGB color values through export/import cycle', () => {
      fc.assert(
        fc.property(arbitraryPixelState(), (state) => {
          // Export the state
          const exported = exportJSON(state.pixels, state.palette, state.size);

          // Import the exported data
          const imported = importJSON(exported);

          // Property: All RGB values remain in valid range [0, 255]
          for (const pixel of imported.pixels) {
            expect(pixel.r).toBeGreaterThanOrEqual(0);
            expect(pixel.r).toBeLessThanOrEqual(255);
            expect(pixel.g).toBeGreaterThanOrEqual(0);
            expect(pixel.g).toBeLessThanOrEqual(255);
            expect(pixel.b).toBeGreaterThanOrEqual(0);
            expect(pixel.b).toBeLessThanOrEqual(255);
          }

          // Property: RGB values match original pixels
          for (const originalPixel of state.pixels) {
            const importedPixel = imported.pixels.find(
              (p) => p.x === originalPixel.x && p.y === originalPixel.y
            );
            expect(importedPixel?.r).toBe(originalPixel.r);
            expect(importedPixel?.g).toBe(originalPixel.g);
            expect(importedPixel?.b).toBe(originalPixel.b);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should handle edge case: single pixel', () => {
      fc.assert(
        fc.property(
          arbitrarySize(),
          arbitraryPalette(),
          arbitraryRgbValue(),
          arbitraryRgbValue(),
          arbitraryRgbValue(),
          (size, palette, r, g, b) => {
            const state = {
              pixels: [
                {
                  x: 0,
                  y: 0,
                  r,
                  g,
                  b,
                  colorGroup: 0,
                  group: 0,
                  colorType: 0,
                },
              ],
              palette,
              size,
            };

            // Export and import
            const exported = exportJSON(state.pixels, state.palette, state.size);
            const imported = importJSON(exported);

            // Property: Single pixel is preserved
            expect(imported.pixels).toHaveLength(1);
            expect(imported.pixels[0].x).toBe(0);
            expect(imported.pixels[0].y).toBe(0);
            expect(imported.pixels[0].r).toBe(r);
            expect(imported.pixels[0].g).toBe(g);
            expect(imported.pixels[0].b).toBe(b);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle edge case: maximum size grid', () => {
      const size = 64; // Use 64 for testing (256 would be too slow)
      const palette = ['#FF0000', '#00FF00', '#0000FF'];
      
      // Create a few pixels at corners and center
      const pixels: Pixel[] = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
        { x: size - 1, y: 0, r: 0, g: 255, b: 0, colorGroup: 1, group: 1, colorType: 1 },
        { x: 0, y: size - 1, r: 0, g: 0, b: 255, colorGroup: 2, group: 2, colorType: 2 },
        { x: size - 1, y: size - 1, r: 255, g: 255, b: 0, colorGroup: 0, group: 0, colorType: 0 },
        { x: Math.floor(size / 2), y: Math.floor(size / 2), r: 128, g: 128, b: 128, colorGroup: 1, group: 1, colorType: 1 },
      ];

      // Export and import
      const exported = exportJSON(pixels, palette, size);
      const imported = importJSON(exported);

      // Property: All pixels preserved at maximum size
      expect(imported.pixels).toHaveLength(pixels.length);
      expect(imported.size).toBe(size);

      for (const originalPixel of pixels) {
        const importedPixel = imported.pixels.find(
          (p) => p.x === originalPixel.x && p.y === originalPixel.y
        );
        expect(importedPixel).toBeDefined();
        expect(importedPixel?.r).toBe(originalPixel.r);
        expect(importedPixel?.g).toBe(originalPixel.g);
        expect(importedPixel?.b).toBe(originalPixel.b);
      }
    });

    it('should handle edge case: empty data groups (all pixels in group 0)', () => {
      fc.assert(
        fc.property(arbitraryPixelState(), (state) => {
          // Set all pixels to group 0
          const modifiedState = {
            ...state,
            pixels: state.pixels.map((p) => ({ ...p, group: 0 })),
          };

          // Export and import
          const exported = exportJSON(
            modifiedState.pixels,
            modifiedState.palette,
            modifiedState.size
          );
          const imported = importJSON(exported);

          // Property: All pixels remain in group 0
          for (const pixel of imported.pixels) {
            expect(pixel.group).toBe(0);
          }

          // Property: Only the "None" group exists
          expect(imported.dataGroups).toHaveLength(1);
          expect(imported.dataGroups[0].id).toBe(0);
          expect(imported.dataGroups[0].name).toBe('None');
        }),
        { numRuns: 50 }
      );
    });

    it('should handle edge case: no color types (all pixels have colorType 0)', () => {
      fc.assert(
        fc.property(arbitraryPixelState(), (state) => {
          // Set all pixels to colorType 0
          const modifiedState = {
            ...state,
            pixels: state.pixels.map((p) => ({ ...p, colorType: 0 })),
          };

          // Export and import
          const exported = exportJSON(
            modifiedState.pixels,
            modifiedState.palette,
            modifiedState.size
          );
          const imported = importJSON(exported);

          // Property: All pixels remain with colorType 0
          for (const pixel of imported.pixels) {
            expect(pixel.colorType).toBe(0);
          }

          // Property: No color types extracted (empty array)
          expect(imported.colorTypes).toHaveLength(0);
        }),
        { numRuns: 50 }
      );
    });
  });
});

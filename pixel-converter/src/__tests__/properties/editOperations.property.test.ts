/**
 * Property-based tests for edit operations
 * 
 * Feature: pixel-converter-react
 * 
 * Tests Properties 6, 7, 8, and 9:
 * - Property 6: Paint Operation Color Application
 * - Property 7: Erase Operation Pixel Removal
 * - Property 8: Color Filter Restriction
 * - Property 9: Mode Switch Selection Clear
 * 
 * **Validates: Requirements 5.3, 5.4, 5.5, 5.6**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { create } from 'zustand';
import { createPixelSlice } from '../../store/slices/pixelSlice';
import { createUISlice } from '../../store/slices/uiSlice';
import type { PixelSlice, UISlice } from '../../store/types';
import type { Pixel } from '../../types';

/**
 * Property 6: Paint Operation Color Application
 * 
 * For any set of selected pixels and paint color, applying paint SHALL change
 * all selected pixels' RGB values to match the paint color.
 * 
 * **Validates: Requirements 5.3**
 */
describe('Property 6: Paint Operation Color Application', () => {
  it('should change all selected pixels RGB values to match paint color', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary unique pixels
        arbitraryUniquePixels(5, 50),
        // Generate arbitrary selection count
        fc.integer({ min: 1, max: 10 }),
        // Generate arbitrary paint color
        arbitraryHexColor(),
        (pixels, selectionCount, paintColor) => {
          // Create a minimal store with pixel and UI slices
          const useTestStore = create<PixelSlice & UISlice>()((...a) => ({
            ...createPixelSlice(...a),
            ...createUISlice(...a),
          }));

          // Set initial pixels
          useTestStore.setState({ pixels: [...pixels] });

          // Select a subset of pixels
          const selectedCount = Math.min(selectionCount, pixels.length);
          const selectedPixels = pixels.slice(0, selectedCount);
          const pixelKeys = selectedPixels.map((p) => `${p.x},${p.y}`);

          // Parse the paint color to RGB
          const hexMatch = paintColor.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
          if (!hexMatch) return; // Skip invalid colors

          const expectedR = parseInt(hexMatch[1]!, 16);
          const expectedG = parseInt(hexMatch[2]!, 16);
          const expectedB = parseInt(hexMatch[3]!, 16);

          // Apply paint color
          useTestStore.getState().applyPaintColor(pixelKeys, paintColor);

          // Get updated pixels
          const updatedPixels = useTestStore.getState().pixels;

          // Verify all selected pixels have the new color
          for (const selectedPixel of selectedPixels) {
            const updatedPixel = updatedPixels.find(
              (p) => p.x === selectedPixel.x && p.y === selectedPixel.y
            );

            expect(updatedPixel).toBeDefined();
            expect(updatedPixel!.r).toBe(expectedR);
            expect(updatedPixel!.g).toBe(expectedG);
            expect(updatedPixel!.b).toBe(expectedB);
          }

          // Verify non-selected pixels remain unchanged
          const nonSelectedPixels = pixels.slice(selectedCount);
          for (const nonSelectedPixel of nonSelectedPixels) {
            const updatedPixel = updatedPixels.find(
              (p) => p.x === nonSelectedPixel.x && p.y === nonSelectedPixel.y
            );

            expect(updatedPixel).toBeDefined();
            expect(updatedPixel!.r).toBe(nonSelectedPixel.r);
            expect(updatedPixel!.g).toBe(nonSelectedPixel.g);
            expect(updatedPixel!.b).toBe(nonSelectedPixel.b);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 7: Erase Operation Pixel Removal
 * 
 * For any set of selected pixels, erasing SHALL remove exactly those pixels
 * from the pixel array.
 * 
 * **Validates: Requirements 5.4**
 */
describe('Property 7: Erase Operation Pixel Removal', () => {
  it('should remove exactly the selected pixels from the pixel array', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary unique pixels
        arbitraryUniquePixels(5, 50),
        // Generate arbitrary selection count
        fc.integer({ min: 1, max: 10 }),
        (pixels, selectionCount) => {
          // Create a minimal store with pixel and UI slices
          const useTestStore = create<PixelSlice & UISlice>()((...a) => ({
            ...createPixelSlice(...a),
            ...createUISlice(...a),
          }));

          // Set initial pixels
          useTestStore.setState({ pixels: [...pixels] });

          const initialPixelCount = pixels.length;

          // Select a subset of pixels
          const selectedCount = Math.min(selectionCount, pixels.length);
          const selectedPixels = pixels.slice(0, selectedCount);
          const pixelKeys = selectedPixels.map((p) => `${p.x},${p.y}`);

          // Erase selected pixels
          useTestStore.getState().eraseSelectedPixels(pixelKeys);

          // Get updated pixels
          const updatedPixels = useTestStore.getState().pixels;

          // Verify the pixel count decreased by exactly the selection count
          expect(updatedPixels.length).toBe(initialPixelCount - selectedCount);

          // Verify selected pixels are removed
          for (const selectedPixel of selectedPixels) {
            const foundPixel = updatedPixels.find(
              (p) => p.x === selectedPixel.x && p.y === selectedPixel.y
            );
            expect(foundPixel).toBeUndefined();
          }

          // Verify non-selected pixels remain
          const nonSelectedPixels = pixels.slice(selectedCount);
          for (const nonSelectedPixel of nonSelectedPixels) {
            const foundPixel = updatedPixels.find(
              (p) => p.x === nonSelectedPixel.x && p.y === nonSelectedPixel.y
            );
            expect(foundPixel).toBeDefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 8: Color Filter Restriction
 * 
 * For any operation with an active color group filter, only pixels with
 * matching colorGroup SHALL be affected.
 * 
 * **Validates: Requirements 5.5**
 */
describe('Property 8: Color Filter Restriction', () => {
  it('should only affect pixels matching the active color group filter when painting', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary unique pixels with various color groups
        arbitraryUniquePixels(10, 50),
        // Generate arbitrary active color group
        fc.integer({ min: 0, max: 5 }),
        // Generate arbitrary paint color
        arbitraryHexColor(),
        (pixels, activeColorGroup, paintColor) => {
          // Create a minimal store with pixel and UI slices
          const useTestStore = create<PixelSlice & UISlice>()((...a) => ({
            ...createPixelSlice(...a),
            ...createUISlice(...a),
          }));

          // Set initial pixels and active color group
          useTestStore.setState({
            pixels: [...pixels],
            activeColorGroup,
          });

          // Select all pixels
          const pixelKeys = pixels.map((p) => `${p.x},${p.y}`);

          // Parse the paint color to RGB
          const hexMatch = paintColor.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
          if (!hexMatch) return; // Skip invalid colors

          const expectedR = parseInt(hexMatch[1]!, 16);
          const expectedG = parseInt(hexMatch[2]!, 16);
          const expectedB = parseInt(hexMatch[3]!, 16);

          // Apply paint color with active color group filter
          useTestStore.getState().applyPaintColor(pixelKeys, paintColor);

          // Get updated pixels
          const updatedPixels = useTestStore.getState().pixels;

          // Verify only pixels in the active color group were painted
          for (const originalPixel of pixels) {
            const updatedPixel = updatedPixels.find(
              (p) => p.x === originalPixel.x && p.y === originalPixel.y
            );

            expect(updatedPixel).toBeDefined();

            if (originalPixel.colorGroup === activeColorGroup) {
              // Pixel should be painted
              expect(updatedPixel!.r).toBe(expectedR);
              expect(updatedPixel!.g).toBe(expectedG);
              expect(updatedPixel!.b).toBe(expectedB);
            } else {
              // Pixel should remain unchanged
              expect(updatedPixel!.r).toBe(originalPixel.r);
              expect(updatedPixel!.g).toBe(originalPixel.g);
              expect(updatedPixel!.b).toBe(originalPixel.b);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should only affect pixels matching the active color group filter when erasing', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary unique pixels with various color groups
        arbitraryUniquePixels(10, 50),
        // Generate arbitrary active color group
        fc.integer({ min: 0, max: 5 }),
        (pixels, activeColorGroup) => {
          // Create a minimal store with pixel and UI slices
          const useTestStore = create<PixelSlice & UISlice>()((...a) => ({
            ...createPixelSlice(...a),
            ...createUISlice(...a),
          }));

          // Set initial pixels and active color group
          useTestStore.setState({
            pixels: [...pixels],
            activeColorGroup,
          });

          // Count pixels in the active color group
          const pixelsInActiveGroup = pixels.filter(
            (p) => p.colorGroup === activeColorGroup
          ).length;

          // Select all pixels
          const pixelKeys = pixels.map((p) => `${p.x},${p.y}`);

          // Erase with active color group filter
          useTestStore.getState().eraseSelectedPixels(pixelKeys);

          // Get updated pixels
          const updatedPixels = useTestStore.getState().pixels;

          // Verify only pixels in the active color group were erased
          expect(updatedPixels.length).toBe(pixels.length - pixelsInActiveGroup);

          // Verify pixels not in the active color group remain
          for (const originalPixel of pixels) {
            if (originalPixel.colorGroup !== activeColorGroup) {
              const foundPixel = updatedPixels.find(
                (p) => p.x === originalPixel.x && p.y === originalPixel.y
              );
              expect(foundPixel).toBeDefined();
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 9: Mode Switch Selection Clear
 * 
 * For any edit mode switch, the selectedPixels set SHALL be empty after the switch.
 * 
 * **Validates: Requirements 5.6**
 */
describe('Property 9: Mode Switch Selection Clear', () => {
  it('should clear selection when switching edit modes', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary initial edit mode
        fc.constantFrom('group', 'colorType', 'paint', 'erase'),
        // Generate arbitrary target edit mode (different from initial)
        fc.constantFrom('group', 'colorType', 'paint', 'erase'),
        // Generate arbitrary selection
        fc.array(fc.tuple(fc.integer({ min: 0, max: 100 }), fc.integer({ min: 0, max: 100 })), {
          minLength: 1,
          maxLength: 20,
        }),
        (initialMode, targetMode, selection) => {
          // Skip if modes are the same
          if (initialMode === targetMode) return;

          // Create a minimal store with UI slice
          const useTestStore = create<UISlice>()((...a) => ({
            ...createUISlice(...a),
          }));

          // Set initial mode and selection
          const selectedPixels = new Set(selection.map(([x, y]) => `${x},${y}`));
          useTestStore.setState({
            editMode: initialMode as any,
            selectedPixels,
          });

          // Verify selection is not empty initially
          expect(useTestStore.getState().selectedPixels.size).toBeGreaterThan(0);

          // Switch edit mode
          useTestStore.getState().setEditMode(targetMode as any);

          // Verify selection is cleared
          expect(useTestStore.getState().selectedPixels.size).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Arbitrary Generators
// ============================================================================

/**
 * Arbitrary generator for an array of unique Pixel objects
 * Generates pixels with unique (x, y) coordinates
 * 
 * @param minLength - Minimum number of pixels to generate
 * @param maxLength - Maximum number of pixels to generate
 */
function arbitraryUniquePixels(minLength: number, maxLength: number): fc.Arbitrary<Pixel[]> {
  return fc.integer({ min: minLength, max: maxLength }).chain((length) => {
    // Generate unique indices for each pixel
    return fc.array(
      fc.record({
        index: fc.integer({ min: 0, max: 1000 }),
        r: fc.integer({ min: 0, max: 255 }),
        g: fc.integer({ min: 0, max: 255 }),
        b: fc.integer({ min: 0, max: 255 }),
        colorGroup: fc.integer({ min: 0, max: 5 }),
        group: fc.integer({ min: 0, max: 10 }),
        colorType: fc.integer({ min: 0, max: 10 }),
      }),
      { minLength: length, maxLength: length }
    ).map((pixelData) => {
      // Convert to pixels with unique coordinates
      const seen = new Set<string>();
      const pixels: Pixel[] = [];
      
      for (const data of pixelData) {
        let x = data.index % 256;
        let y = Math.floor(data.index / 256);
        let key = `${x},${y}`;
        
        // Ensure uniqueness by incrementing if collision
        while (seen.has(key)) {
          x = (x + 1) % 256;
          if (x === 0) y = (y + 1) % 256;
          key = `${x},${y}`;
        }
        
        seen.add(key);
        pixels.push({
          x,
          y,
          r: data.r,
          g: data.g,
          b: data.b,
          colorGroup: data.colorGroup,
          group: data.group,
          colorType: data.colorType,
        });
      }
      
      return pixels;
    });
  });
}

/**
 * Arbitrary generator for Pixel objects
 * Generates valid pixels with random positions, colors, and group assignments
 * Ensures unique (x, y) coordinates by using the index
 */
function arbitraryPixel(): fc.Arbitrary<Pixel> {
  return fc.nat({ max: 1000 }).chain((index) => {
    // Use index to ensure unique coordinates
    const x = index % 256;
    const y = Math.floor(index / 256);
    
    return fc.record({
      x: fc.constant(x),
      y: fc.constant(y),
      r: fc.integer({ min: 0, max: 255 }),
      g: fc.integer({ min: 0, max: 255 }),
      b: fc.integer({ min: 0, max: 255 }),
      colorGroup: fc.integer({ min: 0, max: 5 }),
      group: fc.integer({ min: 0, max: 10 }),
      colorType: fc.integer({ min: 0, max: 10 }),
    });
  });
}

/**
 * Arbitrary generator for hex color strings
 * Generates valid hex colors in the format #RRGGBB
 */
function arbitraryHexColor(): fc.Arbitrary<string> {
  return fc
    .tuple(
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 })
    )
    .map(([r, g, b]) => {
      const toHex = (n: number) => n.toString(16).padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    });
}

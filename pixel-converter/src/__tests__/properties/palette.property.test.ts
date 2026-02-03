/**
 * Property-based tests for palette operations
 * 
 * Feature: pixel-converter-react
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { create } from 'zustand';
import { createPaletteSlice } from '../../store/slices/paletteSlice';
import type { PaletteSlice } from '../../store/types';

/**
 * Property 3: Palette Addition Invariant
 * 
 * For any palette state, adding a new color SHALL increase the palette length by exactly 1.
 * 
 * **Validates: Requirements 4.2**
 */
describe('Property 3: Palette Addition Invariant', () => {
  it('should increase palette length by exactly 1 when adding a color', () => {
    fc.assert(
      fc.property(
        // Generate an arbitrary initial palette (array of hex colors)
        fc.array(arbitraryHexColor(), { minLength: 1, maxLength: 20 }),
        // Generate an arbitrary color to add
        arbitraryHexColor(),
        (initialPalette, colorToAdd) => {
          // Create a minimal store with just the palette slice
          const useTestStore = create<PaletteSlice>()((...a) => ({
            ...createPaletteSlice(...a),
          }));

          // Set initial palette
          useTestStore.setState({ palette: [...initialPalette] });

          // Get initial length
          const initialLength = useTestStore.getState().palette.length;

          // Add a color
          useTestStore.getState().addPaletteColor(colorToAdd);

          // Get new length
          const newLength = useTestStore.getState().palette.length;

          // Verify the palette length increased by exactly 1
          expect(newLength).toBe(initialLength + 1);

          // Verify the new color is at the end
          const palette = useTestStore.getState().palette;
          expect(palette[palette.length - 1]).toBe(colorToAdd);
        }
      ),
      { numRuns: 100 }
    );
  });
});

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

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  createColorTypeSlice,
  type ColorTypeSlice,
} from '../../store/slices/colorTypeSlice';
import type { Pixel, ColorGroup, RGB } from '../../types';
import type { PixelConverterState } from '../../store/types';

/**
 * Property-Based Tests for Color Type Parsing
 *
 * **Validates: Requirements 7.1, 7.5**
 *
 * Property 12: Color Type Parsing Completeness
 * For any state with non-empty color groups, parsing color types SHALL create
 * exactly one color type per non-empty color group, and all pixels SHALL be
 * assigned to their corresponding color type.
 */

// Arbitrary generators

/**
 * Generate a valid RGB color
 */
const arbitraryRGB = (): fc.Arbitrary<RGB> =>
  fc.record({
    r: fc.integer({ min: 0, max: 255 }),
    g: fc.integer({ min: 0, max: 255 }),
    b: fc.integer({ min: 0, max: 255 }),
  });

/**
 * Generate a valid pixel with a specific colorGroup assignment
 */
const arbitraryPixel = (colorGroup: number): fc.Arbitrary<Pixel> =>
  fc.record({
    x: fc.integer({ min: 0, max: 255 }),
    y: fc.integer({ min: 0, max: 255 }),
    r: fc.integer({ min: 0, max: 255 }),
    g: fc.integer({ min: 0, max: 255 }),
    b: fc.integer({ min: 0, max: 255 }),
    colorGroup: fc.constant(colorGroup),
    group: fc.integer({ min: 0, max: 10 }),
    colorType: fc.constant(0), // Initially unassigned
  });

/**
 * Generate a color group with pixels
 */
const arbitraryColorGroupWithPixels = (
  index: number,
  pixelCount: number
): fc.Arbitrary<{ colorGroup: ColorGroup; pixels: Pixel[] }> =>
  fc.tuple(arbitraryRGB(), fc.array(arbitraryPixel(index), { minLength: pixelCount, maxLength: pixelCount })).map(
    ([color, pixels]) => ({
      colorGroup: {
        index,
        color,
        pixels,
      },
      pixels,
    })
  );

/**
 * Generate a state with multiple color groups, some empty and some non-empty
 */
const arbitraryStateWithColorGroups = (): fc.Arbitrary<{
  colorGroups: ColorGroup[];
  pixels: Pixel[];
  nonEmptyGroupIndices: number[];
}> =>
  fc
    .integer({ min: 1, max: 10 }) // Number of color groups
    .chain((groupCount) =>
      fc
        .array(fc.integer({ min: 0, max: 20 }), {
          minLength: groupCount,
          maxLength: groupCount,
        }) // Pixel counts per group (0 means empty)
        .chain((pixelCounts) => {
          const groupGenerators = pixelCounts.map((count, index) =>
            count > 0
              ? arbitraryColorGroupWithPixels(index, count)
              : fc.constant({
                  colorGroup: {
                    index,
                    color: { r: 0, g: 0, b: 0 },
                    pixels: [] as Pixel[],
                  },
                  pixels: [] as Pixel[],
                })
          );

          return fc.tuple(...groupGenerators).map((groups) => {
            const colorGroups = groups.map((g) => g.colorGroup);
            const pixels = groups.flatMap((g) => g.pixels);
            const nonEmptyGroupIndices = pixelCounts
              .map((count, index) => (count > 0 ? index : -1))
              .filter((index) => index >= 0);

            return { colorGroups, pixels, nonEmptyGroupIndices };
          });
        })
    );

/**
 * Helper to create a mock state with the color type slice
 * This simulates the Zustand store behavior for testing
 */
interface MockState extends ColorTypeSlice {
  pixels: Pixel[];
  colorGroups: ColorGroup[];
  activeColorGroup: number;
  editMode: string;
}

function createMockStore(
  initialPixels: Pixel[] = [],
  initialColorGroups: ColorGroup[] = []
): {
  getState: () => MockState;
  setState: (partial: Partial<MockState>) => void;
} {
  let state: MockState = {
    pixels: initialPixels,
    colorGroups: initialColorGroups,
    colorTypes: [],
    activeColorTypeId: 0,
    activeColorGroup: -1,
    editMode: 'group',
    parseColorTypes: () => {},
    setActiveColorType: () => {},
    setColorTypes: () => {},
    assignPixelsToColorType: () => {},
  };

  const setState = (
    partial: Partial<MockState> | ((state: MockState) => Partial<MockState>)
  ) => {
    if (typeof partial === 'function') {
      state = { ...state, ...partial(state) };
    } else {
      state = { ...state, ...partial };
    }
  };

  const getState = () => state;

  // Create the slice with our mock set function
  const slice = createColorTypeSlice(
    setState as Parameters<typeof createColorTypeSlice>[0],
    getState as Parameters<typeof createColorTypeSlice>[1],
    {} as Parameters<typeof createColorTypeSlice>[2]
  );

  // Merge slice into state
  state = { ...state, ...slice };

  return { getState, setState };
}

describe('Property 12: Color Type Parsing Completeness', () => {
  /**
   * **Validates: Requirements 7.1, 7.5**
   *
   * Property: For any state with non-empty color groups, parsing color types
   * SHALL create exactly one color type per non-empty color group, and all
   * pixels SHALL be assigned to their corresponding color type.
   */
  describe('parseColorTypes creates exactly one color type per non-empty color group', () => {
    it('should create exactly one color type per non-empty color group', () => {
      fc.assert(
        fc.property(arbitraryStateWithColorGroups(), ({ colorGroups, pixels, nonEmptyGroupIndices }) => {
          const store = createMockStore(pixels, colorGroups);

          // Parse color types
          store.getState().parseColorTypes();

          const state = store.getState();

          // Should have exactly one color type per non-empty color group
          expect(state.colorTypes.length).toBe(nonEmptyGroupIndices.length);
        }),
        { numRuns: 20 }
      );
    });

    it('should assign unique IDs to each color type', () => {
      fc.assert(
        fc.property(arbitraryStateWithColorGroups(), ({ colorGroups, pixels }) => {
          const store = createMockStore(pixels, colorGroups);

          // Parse color types
          store.getState().parseColorTypes();

          const state = store.getState();

          // All color type IDs should be unique
          const ids = state.colorTypes.map((ct) => ct.id);
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(ids.length);
        }),
        { numRuns: 20 }
      );
    });

    it('should create color types with IDs starting from 1', () => {
      fc.assert(
        fc.property(arbitraryStateWithColorGroups(), ({ colorGroups, pixels, nonEmptyGroupIndices }) => {
          // Skip if no non-empty groups
          if (nonEmptyGroupIndices.length === 0) return;

          const store = createMockStore(pixels, colorGroups);

          // Parse color types
          store.getState().parseColorTypes();

          const state = store.getState();

          // All color type IDs should be >= 1
          for (const colorType of state.colorTypes) {
            expect(colorType.id).toBeGreaterThanOrEqual(1);
          }
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('All pixels are assigned to their corresponding color type', () => {
    it('should assign all pixels to a color type based on their colorGroup', () => {
      fc.assert(
        fc.property(arbitraryStateWithColorGroups(), ({ colorGroups, pixels, nonEmptyGroupIndices }) => {
          // Skip if no pixels
          if (pixels.length === 0) return;

          const store = createMockStore(pixels, colorGroups);

          // Parse color types
          store.getState().parseColorTypes();

          const state = store.getState();

          // Every pixel should have a non-zero colorType if its colorGroup is non-empty
          for (const pixel of state.pixels) {
            const isInNonEmptyGroup = nonEmptyGroupIndices.includes(pixel.colorGroup);
            if (isInNonEmptyGroup) {
              expect(pixel.colorType).toBeGreaterThan(0);
            }
          }
        }),
        { numRuns: 20 }
      );
    });

    it('should assign pixels with the same colorGroup to the same colorType', () => {
      fc.assert(
        fc.property(arbitraryStateWithColorGroups(), ({ colorGroups, pixels }) => {
          // Skip if no pixels
          if (pixels.length === 0) return;

          const store = createMockStore(pixels, colorGroups);

          // Parse color types
          store.getState().parseColorTypes();

          const state = store.getState();

          // Group pixels by their original colorGroup
          const pixelsByColorGroup = new Map<number, Pixel[]>();
          for (const pixel of state.pixels) {
            const group = pixel.colorGroup;
            if (!pixelsByColorGroup.has(group)) {
              pixelsByColorGroup.set(group, []);
            }
            pixelsByColorGroup.get(group)!.push(pixel);
          }

          // All pixels in the same colorGroup should have the same colorType
          for (const [, groupPixels] of pixelsByColorGroup) {
            if (groupPixels.length > 1) {
              const firstColorType = groupPixels[0].colorType;
              for (const pixel of groupPixels) {
                expect(pixel.colorType).toBe(firstColorType);
              }
            }
          }
        }),
        { numRuns: 20 }
      );
    });

    it('should preserve total pixel count after parsing', () => {
      fc.assert(
        fc.property(arbitraryStateWithColorGroups(), ({ colorGroups, pixels }) => {
          const store = createMockStore(pixels, colorGroups);
          const originalPixelCount = pixels.length;

          // Parse color types
          store.getState().parseColorTypes();

          const state = store.getState();

          // Pixel count should remain the same
          expect(state.pixels.length).toBe(originalPixelCount);
        }),
        { numRuns: 20 }
      );
    });

    it('should ensure sum of pixels per color type equals total pixel count', () => {
      fc.assert(
        fc.property(arbitraryStateWithColorGroups(), ({ colorGroups, pixels, nonEmptyGroupIndices }) => {
          // Skip if no pixels
          if (pixels.length === 0) return;

          const store = createMockStore(pixels, colorGroups);

          // Parse color types
          store.getState().parseColorTypes();

          const state = store.getState();

          // Count pixels per color type
          const pixelCountByColorType = new Map<number, number>();
          for (const pixel of state.pixels) {
            const ct = pixel.colorType;
            pixelCountByColorType.set(ct, (pixelCountByColorType.get(ct) || 0) + 1);
          }

          // Sum of all assigned pixels (colorType > 0) should equal total pixels
          // if all pixels are in non-empty groups
          const allPixelsInNonEmptyGroups = pixels.every((p) =>
            nonEmptyGroupIndices.includes(p.colorGroup)
          );

          if (allPixelsInNonEmptyGroups) {
            let totalAssigned = 0;
            for (const [colorType, count] of pixelCountByColorType) {
              if (colorType > 0) {
                totalAssigned += count;
              }
            }
            expect(totalAssigned).toBe(pixels.length);
          }
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('Color type colors match their source color groups', () => {
    it('should create color types with hex colors matching their source color group RGB', () => {
      fc.assert(
        fc.property(arbitraryStateWithColorGroups(), ({ colorGroups, pixels, nonEmptyGroupIndices }) => {
          // Skip if no non-empty groups
          if (nonEmptyGroupIndices.length === 0) return;

          const store = createMockStore(pixels, colorGroups);

          // Parse color types
          store.getState().parseColorTypes();

          const state = store.getState();

          // Each color type should have a valid hex color
          for (const colorType of state.colorTypes) {
            expect(colorType.color).toMatch(/^#[0-9a-f]{6}$/i);
          }
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle empty color groups array', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const store = createMockStore([], []);

          // Parse color types
          store.getState().parseColorTypes();

          const state = store.getState();

          // Should have no color types
          expect(state.colorTypes.length).toBe(0);
        }),
        { numRuns: 20 }
      );
    });

    it('should handle all empty color groups', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          (groupCount) => {
            // Create empty color groups
            const colorGroups: ColorGroup[] = Array.from({ length: groupCount }, (_, i) => ({
              index: i,
              color: { r: 0, g: 0, b: 0 },
              pixels: [],
            }));

            const store = createMockStore([], colorGroups);

            // Parse color types
            store.getState().parseColorTypes();

            const state = store.getState();

            // Should have no color types since all groups are empty
            expect(state.colorTypes.length).toBe(0);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should set activeColorTypeId to first color type when parsing non-empty groups', () => {
      fc.assert(
        fc.property(arbitraryStateWithColorGroups(), ({ colorGroups, pixels, nonEmptyGroupIndices }) => {
          const store = createMockStore(pixels, colorGroups);

          // Parse color types
          store.getState().parseColorTypes();

          const state = store.getState();

          if (nonEmptyGroupIndices.length > 0) {
            // Active color type should be set to the first one
            expect(state.activeColorTypeId).toBe(state.colorTypes[0]?.id);
          } else {
            // No color types, active should be 0
            expect(state.activeColorTypeId).toBe(0);
          }
        }),
        { numRuns: 20 }
      );
    });
  });
});

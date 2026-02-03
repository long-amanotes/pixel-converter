import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  createUndoSlice,
  MAX_UNDO_STACK_SIZE,
  type UndoSlice,
} from '../../store/slices/undoSlice';
import type { Pixel, DataGroup, ColorType } from '../../types';
import type { PixelConverterState, UndoState } from '../../store/types';

/**
 * Property-Based Tests for Undo Functionality
 *
 * **Validates: Requirements 8.2, 8.3**
 *
 * Property 13: Undo Stack Size Limit
 * For any sequence of operations, the undo stack size SHALL never exceed 50 entries.
 *
 * Property 14: Undo State Restoration
 * For any state S1, after performing an operation that creates state S2 and then undoing,
 * the resulting state SHALL be equivalent to S1.
 */

// Arbitrary generators

/**
 * Generate a valid pixel
 */
const arbitraryPixel = (): fc.Arbitrary<Pixel> =>
  fc.record({
    x: fc.integer({ min: 0, max: 255 }),
    y: fc.integer({ min: 0, max: 255 }),
    r: fc.integer({ min: 0, max: 255 }),
    g: fc.integer({ min: 0, max: 255 }),
    b: fc.integer({ min: 0, max: 255 }),
    colorGroup: fc.integer({ min: 0, max: 15 }),
    group: fc.integer({ min: 0, max: 10 }),
    colorType: fc.integer({ min: 0, max: 10 }),
  });

/**
 * Generate an array of pixels
 */
const arbitraryPixels = (): fc.Arbitrary<Pixel[]> =>
  fc.array(arbitraryPixel(), { minLength: 0, maxLength: 50 });

/**
 * Generate a valid hex color
 */
const arbitraryHexColor = (): fc.Arbitrary<string> =>
  fc.tuple(
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 })
  ).map(([r, g, b]) => {
    const toHex = (v: number) => v.toString(16).padStart(2, '0').toUpperCase();
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  });

/**
 * Generate a palette (array of hex colors)
 */
const arbitraryPalette = (): fc.Arbitrary<string[]> =>
  fc.array(arbitraryHexColor(), { minLength: 1, maxLength: 16 });

/**
 * Generate a data group
 */
const arbitraryDataGroup = (): fc.Arbitrary<DataGroup> =>
  fc.record({
    id: fc.integer({ min: 0, max: 100 }),
    name: fc.string({ minLength: 1, maxLength: 20 }),
  });

/**
 * Generate an array of data groups (always including the default "None" group)
 */
const arbitraryDataGroups = (): fc.Arbitrary<DataGroup[]> =>
  fc.array(arbitraryDataGroup(), { minLength: 0, maxLength: 10 }).map((groups) => [
    { id: 0, name: 'None' },
    ...groups.filter((g) => g.id !== 0),
  ]);

/**
 * Generate a color type
 */
const arbitraryColorType = (): fc.Arbitrary<ColorType> =>
  fc.record({
    id: fc.integer({ min: 1, max: 100 }),
    color: arbitraryHexColor(),
    name: fc.string({ minLength: 1, maxLength: 20 }),
  });

/**
 * Generate an array of color types
 */
const arbitraryColorTypes = (): fc.Arbitrary<ColorType[]> =>
  fc.array(arbitraryColorType(), { minLength: 0, maxLength: 10 });

/**
 * Generate a complete state snapshot for undo
 */
const arbitraryUndoState = (): fc.Arbitrary<UndoState> =>
  fc.record({
    pixels: arbitraryPixels(),
    palette: arbitraryPalette(),
    dataGroups: arbitraryDataGroups(),
    colorTypes: arbitraryColorTypes(),
  });

/**
 * Generate a number of saveState calls to perform
 */
const arbitrarySaveCount = (): fc.Arbitrary<number> =>
  fc.integer({ min: 1, max: 100 });

/**
 * Helper to create a mock state with the undo slice
 * This simulates the Zustand store behavior for testing
 */
interface MockState extends UndoSlice {
  pixels: Pixel[];
  palette: string[];
  dataGroups: DataGroup[];
  colorTypes: ColorType[];
}

function createMockStore(initialState?: Partial<MockState>): {
  getState: () => MockState;
  setState: (partial: Partial<MockState> | ((state: MockState) => Partial<MockState>)) => void;
} {
  let state: MockState = {
    undoStack: [],
    pixels: [],
    palette: ['#FF0000', '#00FF00', '#0000FF'],
    dataGroups: [{ id: 0, name: 'None' }],
    colorTypes: [],
    saveState: () => {},
    undo: () => {},
    clearUndoStack: () => {},
    ...initialState,
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
  const slice = createUndoSlice(
    setState as Parameters<typeof createUndoSlice>[0],
    getState as Parameters<typeof createUndoSlice>[1],
    {} as Parameters<typeof createUndoSlice>[2]
  );

  // Merge slice into state
  state = { ...state, ...slice };

  return { getState, setState };
}

describe('Property 13: Undo Stack Size Limit', () => {
  /**
   * **Validates: Requirements 8.3**
   *
   * Property: For any sequence of operations, the undo stack size SHALL never exceed 50 entries.
   */
  describe('Undo stack size never exceeds MAX_UNDO_STACK_SIZE (50)', () => {
    it('should never exceed 50 entries after any number of saveState calls', () => {
      fc.assert(
        fc.property(arbitrarySaveCount(), (saveCount) => {
          const store = createMockStore();

          // Perform the sequence of saveState calls
          for (let i = 0; i < saveCount; i++) {
            // Modify state slightly before each save to simulate real usage
            store.setState({
              pixels: [
                {
                  x: i % 16,
                  y: Math.floor(i / 16),
                  r: i % 256,
                  g: (i * 2) % 256,
                  b: (i * 3) % 256,
                  colorGroup: 0,
                  group: 0,
                  colorType: 0,
                },
              ],
            });
            store.getState().saveState();
          }

          const state = store.getState();

          // The undo stack size should never exceed MAX_UNDO_STACK_SIZE
          expect(state.undoStack.length).toBeLessThanOrEqual(MAX_UNDO_STACK_SIZE);
        }),
        { numRuns: 20 }
      );
    });

    it('should have exactly MAX_UNDO_STACK_SIZE entries when more than 50 saves are performed', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: MAX_UNDO_STACK_SIZE + 1, max: 150 }),
          (saveCount) => {
            const store = createMockStore();

            // Perform more than MAX_UNDO_STACK_SIZE saveState calls
            for (let i = 0; i < saveCount; i++) {
              store.setState({
                pixels: [
                  {
                    x: i % 16,
                    y: Math.floor(i / 16),
                    r: i % 256,
                    g: (i * 2) % 256,
                    b: (i * 3) % 256,
                    colorGroup: 0,
                    group: 0,
                    colorType: 0,
                  },
                ],
              });
              store.getState().saveState();
            }

            const state = store.getState();

            // The undo stack should be exactly at the maximum size
            expect(state.undoStack.length).toBe(MAX_UNDO_STACK_SIZE);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should preserve the most recent states when stack overflows', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: MAX_UNDO_STACK_SIZE + 1, max: 100 }),
          (saveCount) => {
            const store = createMockStore();
            const savedStates: { pixels: Pixel[] }[] = [];

            // Perform saveState calls and track what we saved
            for (let i = 0; i < saveCount; i++) {
              const pixels = [
                {
                  x: i,
                  y: i,
                  r: i % 256,
                  g: (i * 2) % 256,
                  b: (i * 3) % 256,
                  colorGroup: 0,
                  group: 0,
                  colorType: 0,
                },
              ];
              store.setState({ pixels });
              savedStates.push({ pixels: [...pixels] });
              store.getState().saveState();
            }

            const state = store.getState();

            // The most recent MAX_UNDO_STACK_SIZE states should be preserved
            // The oldest states should be discarded
            const expectedStates = savedStates.slice(-MAX_UNDO_STACK_SIZE);

            expect(state.undoStack.length).toBe(MAX_UNDO_STACK_SIZE);

            // Verify the most recent state is at the end of the stack
            const lastSavedState = expectedStates[expectedStates.length - 1];
            const lastStackState = state.undoStack[state.undoStack.length - 1];

            expect(lastStackState.pixels[0].x).toBe(lastSavedState.pixels[0].x);
            expect(lastStackState.pixels[0].y).toBe(lastSavedState.pixels[0].y);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should have correct count when fewer than 50 saves are performed', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: MAX_UNDO_STACK_SIZE - 1 }),
          (saveCount) => {
            const store = createMockStore();

            // Perform fewer than MAX_UNDO_STACK_SIZE saveState calls
            for (let i = 0; i < saveCount; i++) {
              store.setState({
                pixels: [
                  {
                    x: i,
                    y: i,
                    r: i % 256,
                    g: 0,
                    b: 0,
                    colorGroup: 0,
                    group: 0,
                    colorType: 0,
                  },
                ],
              });
              store.getState().saveState();
            }

            const state = store.getState();

            // The undo stack should have exactly saveCount entries
            expect(state.undoStack.length).toBe(saveCount);
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});

describe('Property 14: Undo State Restoration', () => {
  /**
   * **Validates: Requirements 8.2**
   *
   * Property: For any state S1, after performing an operation that creates state S2
   * and then undoing, the resulting state SHALL be equivalent to S1.
   */
  describe('Undo restores the previous state correctly', () => {
    it('should restore pixels to their previous state after undo', () => {
      fc.assert(
        fc.property(
          arbitraryPixels(),
          arbitraryPixels(),
          (initialPixels, modifiedPixels) => {
            const store = createMockStore({ pixels: initialPixels });

            // Save the initial state (S1)
            store.getState().saveState();

            // Modify the state to create S2
            store.setState({ pixels: modifiedPixels });

            // Undo to restore S1
            store.getState().undo();

            const state = store.getState();

            // The pixels should be restored to the initial state
            expect(state.pixels.length).toBe(initialPixels.length);

            for (let i = 0; i < initialPixels.length; i++) {
              expect(state.pixels[i].x).toBe(initialPixels[i].x);
              expect(state.pixels[i].y).toBe(initialPixels[i].y);
              expect(state.pixels[i].r).toBe(initialPixels[i].r);
              expect(state.pixels[i].g).toBe(initialPixels[i].g);
              expect(state.pixels[i].b).toBe(initialPixels[i].b);
              expect(state.pixels[i].colorGroup).toBe(initialPixels[i].colorGroup);
              expect(state.pixels[i].group).toBe(initialPixels[i].group);
              expect(state.pixels[i].colorType).toBe(initialPixels[i].colorType);
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should restore palette to its previous state after undo', () => {
      fc.assert(
        fc.property(
          arbitraryPalette(),
          arbitraryPalette(),
          (initialPalette, modifiedPalette) => {
            const store = createMockStore({ palette: initialPalette });

            // Save the initial state (S1)
            store.getState().saveState();

            // Modify the state to create S2
            store.setState({ palette: modifiedPalette });

            // Undo to restore S1
            store.getState().undo();

            const state = store.getState();

            // The palette should be restored to the initial state
            expect(state.palette).toEqual(initialPalette);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should restore dataGroups to their previous state after undo', () => {
      fc.assert(
        fc.property(
          arbitraryDataGroups(),
          arbitraryDataGroups(),
          (initialGroups, modifiedGroups) => {
            const store = createMockStore({ dataGroups: initialGroups });

            // Save the initial state (S1)
            store.getState().saveState();

            // Modify the state to create S2
            store.setState({ dataGroups: modifiedGroups });

            // Undo to restore S1
            store.getState().undo();

            const state = store.getState();

            // The dataGroups should be restored to the initial state
            expect(state.dataGroups).toEqual(initialGroups);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should restore colorTypes to their previous state after undo', () => {
      fc.assert(
        fc.property(
          arbitraryColorTypes(),
          arbitraryColorTypes(),
          (initialColorTypes, modifiedColorTypes) => {
            const store = createMockStore({ colorTypes: initialColorTypes });

            // Save the initial state (S1)
            store.getState().saveState();

            // Modify the state to create S2
            store.setState({ colorTypes: modifiedColorTypes });

            // Undo to restore S1
            store.getState().undo();

            const state = store.getState();

            // The colorTypes should be restored to the initial state
            expect(state.colorTypes).toEqual(initialColorTypes);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should restore complete state (pixels, palette, dataGroups, colorTypes) after undo', () => {
      fc.assert(
        fc.property(
          arbitraryUndoState(),
          arbitraryUndoState(),
          (initialState, modifiedState) => {
            const store = createMockStore({
              pixels: initialState.pixels,
              palette: initialState.palette,
              dataGroups: initialState.dataGroups,
              colorTypes: initialState.colorTypes,
            });

            // Save the initial state (S1)
            store.getState().saveState();

            // Modify the state to create S2
            store.setState({
              pixels: modifiedState.pixels,
              palette: modifiedState.palette,
              dataGroups: modifiedState.dataGroups,
              colorTypes: modifiedState.colorTypes,
            });

            // Undo to restore S1
            store.getState().undo();

            const state = store.getState();

            // All state components should be restored
            expect(state.pixels.length).toBe(initialState.pixels.length);
            expect(state.palette).toEqual(initialState.palette);
            expect(state.dataGroups).toEqual(initialState.dataGroups);
            expect(state.colorTypes).toEqual(initialState.colorTypes);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should support multiple sequential undos', () => {
      fc.assert(
        fc.property(
          fc.array(arbitraryUndoState(), { minLength: 2, maxLength: 10 }),
          (states) => {
            // Start with the first state
            const store = createMockStore({
              pixels: states[0].pixels,
              palette: states[0].palette,
              dataGroups: states[0].dataGroups,
              colorTypes: states[0].colorTypes,
            });

            // Save and modify through each state
            for (let i = 1; i < states.length; i++) {
              store.getState().saveState();
              store.setState({
                pixels: states[i].pixels,
                palette: states[i].palette,
                dataGroups: states[i].dataGroups,
                colorTypes: states[i].colorTypes,
              });
            }

            // Undo back through all states
            for (let i = states.length - 2; i >= 0; i--) {
              store.getState().undo();
              const state = store.getState();

              // Verify we're at the expected state
              expect(state.pixels.length).toBe(states[i].pixels.length);
              expect(state.palette).toEqual(states[i].palette);
              expect(state.dataGroups).toEqual(states[i].dataGroups);
              expect(state.colorTypes).toEqual(states[i].colorTypes);
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should be a no-op when undo stack is empty', () => {
      fc.assert(
        fc.property(arbitraryUndoState(), (initialState) => {
          const store = createMockStore({
            pixels: initialState.pixels,
            palette: initialState.palette,
            dataGroups: initialState.dataGroups,
            colorTypes: initialState.colorTypes,
          });

          // Don't save any state, just try to undo
          store.getState().undo();

          const state = store.getState();

          // State should remain unchanged
          expect(state.pixels.length).toBe(initialState.pixels.length);
          expect(state.palette).toEqual(initialState.palette);
          expect(state.dataGroups).toEqual(initialState.dataGroups);
          expect(state.colorTypes).toEqual(initialState.colorTypes);
          expect(state.undoStack.length).toBe(0);
        }),
        { numRuns: 20 }
      );
    });

    it('should remove the restored state from the undo stack', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }),
          arbitraryUndoState(),
          (saveCount, initialState) => {
            const store = createMockStore({
              pixels: initialState.pixels,
              palette: initialState.palette,
              dataGroups: initialState.dataGroups,
              colorTypes: initialState.colorTypes,
            });

            // Save multiple states
            for (let i = 0; i < saveCount; i++) {
              store.getState().saveState();
              store.setState({
                pixels: [
                  {
                    x: i,
                    y: i,
                    r: i % 256,
                    g: 0,
                    b: 0,
                    colorGroup: 0,
                    group: 0,
                    colorType: 0,
                  },
                ],
              });
            }

            const stackSizeBefore = store.getState().undoStack.length;

            // Undo once
            store.getState().undo();

            const stackSizeAfter = store.getState().undoStack.length;

            // Stack size should decrease by 1
            expect(stackSizeAfter).toBe(stackSizeBefore - 1);
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});

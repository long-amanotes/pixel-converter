import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  createGroupSlice,
  DEFAULT_DATA_GROUP,
  type GroupSlice,
} from '../../store/slices/groupSlice';
import type { Pixel, DataGroup } from '../../types';
import type { PixelConverterState } from '../../store/types';

/**
 * Property-Based Tests for Data Group Operations
 *
 * **Validates: Requirements 6.2, 6.3, 6.4**
 *
 * Property 10: Data Group ID Uniqueness
 * For any sequence of data group additions, all group IDs SHALL be unique.
 *
 * Property 11: Data Group Deletion Pixel Reassignment
 * For any data group deletion, all pixels previously assigned to that group
 * SHALL have group set to 0 (None).
 */

// Arbitrary generators

/**
 * Generate a valid pixel with a specific group assignment
 */
const arbitraryPixel = (groupId: number = 0): fc.Arbitrary<Pixel> =>
  fc.record({
    x: fc.integer({ min: 0, max: 255 }),
    y: fc.integer({ min: 0, max: 255 }),
    r: fc.integer({ min: 0, max: 255 }),
    g: fc.integer({ min: 0, max: 255 }),
    b: fc.integer({ min: 0, max: 255 }),
    colorGroup: fc.integer({ min: 0, max: 15 }),
    group: fc.constant(groupId),
    colorType: fc.integer({ min: 0, max: 10 }),
  });

/**
 * Generate an array of pixels with various group assignments
 */
const arbitraryPixelsWithGroups = (
  groupIds: number[]
): fc.Arbitrary<Pixel[]> => {
  if (groupIds.length === 0) {
    return fc.constant([]);
  }
  return fc
    .array(fc.integer({ min: 0, max: groupIds.length - 1 }), {
      minLength: 1,
      maxLength: 50,
    })
    .chain((indices) =>
      fc.tuple(
        ...indices.map((idx) => arbitraryPixel(groupIds[idx % groupIds.length]))
      )
    );
};

/**
 * Generate a sequence of group additions (number of groups to add)
 */
const arbitraryAdditionCount = (): fc.Arbitrary<number> =>
  fc.integer({ min: 1, max: 20 });

/**
 * Helper to create a mock state with the group slice
 * This simulates the Zustand store behavior for testing
 */
interface MockState extends GroupSlice {
  pixels: Pixel[];
}

function createMockStore(initialPixels: Pixel[] = []): {
  getState: () => MockState;
  setState: (partial: Partial<MockState>) => void;
} {
  let state: MockState = {
    dataGroups: [DEFAULT_DATA_GROUP],
    activeDataGroupId: 0,
    pixels: initialPixels,
    addDataGroup: () => {},
    deleteDataGroup: () => {},
    clearDataGroup: () => {},
    updateDataGroupName: () => {},
    setActiveDataGroup: () => {},
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
  const slice = createGroupSlice(
    setState as Parameters<typeof createGroupSlice>[0],
    getState as Parameters<typeof createGroupSlice>[1],
    {} as Parameters<typeof createGroupSlice>[2]
  );

  // Merge slice into state
  state = { ...state, ...slice };

  return { getState, setState };
}

describe('Property 10: Data Group ID Uniqueness', () => {
  /**
   * **Validates: Requirements 6.2**
   *
   * Property: For any sequence of data group additions, all group IDs SHALL be unique.
   */
  describe('All group IDs are unique after any sequence of additions', () => {
    it('should maintain unique IDs after any number of addDataGroup calls', () => {
      fc.assert(
        fc.property(arbitraryAdditionCount(), (addCount) => {
          const store = createMockStore();

          // Perform the sequence of additions
          for (let i = 0; i < addCount; i++) {
            store.getState().addDataGroup();
          }

          const state = store.getState();
          const ids = state.dataGroups.map((g) => g.id);

          // All IDs should be unique
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(ids.length);
        }),
        { numRuns: 20 }
      );
    });

    it('should always include the default "None" group with id 0', () => {
      fc.assert(
        fc.property(arbitraryAdditionCount(), (addCount) => {
          const store = createMockStore();

          // Perform the sequence of additions
          for (let i = 0; i < addCount; i++) {
            store.getState().addDataGroup();
          }

          const state = store.getState();

          // The default "None" group should always exist
          const noneGroup = state.dataGroups.find((g) => g.id === 0);
          expect(noneGroup).toBeDefined();
          expect(noneGroup?.name).toBe('None');
        }),
        { numRuns: 20 }
      );
    });

    it('should generate strictly increasing IDs for new groups', () => {
      fc.assert(
        fc.property(arbitraryAdditionCount(), (addCount) => {
          const store = createMockStore();
          const addedIds: number[] = [];

          // Perform the sequence of additions and track IDs
          for (let i = 0; i < addCount; i++) {
            store.getState().addDataGroup();
            const state = store.getState();
            // The active group ID is set to the newly added group
            addedIds.push(state.activeDataGroupId);
          }

          // Each new ID should be greater than all previous IDs
          for (let i = 1; i < addedIds.length; i++) {
            expect(addedIds[i]).toBeGreaterThan(addedIds[i - 1]);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('should have exactly addCount + 1 groups after addCount additions (including default)', () => {
      fc.assert(
        fc.property(arbitraryAdditionCount(), (addCount) => {
          const store = createMockStore();

          // Perform the sequence of additions
          for (let i = 0; i < addCount; i++) {
            store.getState().addDataGroup();
          }

          const state = store.getState();

          // Should have default group + all added groups
          expect(state.dataGroups.length).toBe(addCount + 1);
        }),
        { numRuns: 20 }
      );
    });
  });
});

describe('Property 11: Data Group Deletion Pixel Reassignment', () => {
  /**
   * **Validates: Requirements 6.3, 6.4**
   *
   * Property: For any data group deletion, all pixels previously assigned to that group
   * SHALL have group set to 0 (None).
   */
  describe('deleteDataGroup reassigns all affected pixels to group 0', () => {
    it('should reassign all pixels from deleted group to group 0', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }), // Number of groups to create
          fc.integer({ min: 1, max: 50 }), // Number of pixels
          (groupCount, pixelCount) => {
            const store = createMockStore();

            // Create groups
            for (let i = 0; i < groupCount; i++) {
              store.getState().addDataGroup();
            }

            const groupIds = store.getState().dataGroups.map((g) => g.id);

            // Create pixels assigned to various groups
            const pixels: Pixel[] = [];
            for (let i = 0; i < pixelCount; i++) {
              const groupId = groupIds[i % groupIds.length];
              pixels.push({
                x: i % 16,
                y: Math.floor(i / 16),
                r: 100,
                g: 100,
                b: 100,
                colorGroup: 0,
                group: groupId,
                colorType: 0,
              });
            }

            store.setState({ pixels });

            // Pick a non-zero group to delete
            const nonZeroGroups = groupIds.filter((id) => id !== 0);
            if (nonZeroGroups.length === 0) return; // Skip if no non-zero groups

            const groupToDelete = nonZeroGroups[0];
            const pixelsInGroup = pixels.filter((p) => p.group === groupToDelete);

            // Set active group and delete
            store.getState().setActiveDataGroup(groupToDelete);
            store.getState().deleteDataGroup();

            const state = store.getState();

            // All pixels that were in the deleted group should now be in group 0
            for (const originalPixel of pixelsInGroup) {
              const updatedPixel = state.pixels.find(
                (p) => p.x === originalPixel.x && p.y === originalPixel.y
              );
              expect(updatedPixel).toBeDefined();
              expect(updatedPixel?.group).toBe(0);
            }

            // The deleted group should no longer exist
            expect(state.dataGroups.find((g) => g.id === groupToDelete)).toBeUndefined();
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should not affect pixels in other groups when deleting a group', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 10 }), // Need at least 2 groups (including default)
          fc.integer({ min: 1, max: 50 }), // Number of pixels
          (groupCount, pixelCount) => {
            const store = createMockStore();

            // Create groups
            for (let i = 0; i < groupCount - 1; i++) {
              store.getState().addDataGroup();
            }

            const groupIds = store.getState().dataGroups.map((g) => g.id);

            // Create pixels assigned to various groups
            const pixels: Pixel[] = [];
            for (let i = 0; i < pixelCount; i++) {
              const groupId = groupIds[i % groupIds.length];
              pixels.push({
                x: i % 16,
                y: Math.floor(i / 16),
                r: 100,
                g: 100,
                b: 100,
                colorGroup: 0,
                group: groupId,
                colorType: 0,
              });
            }

            store.setState({ pixels });

            // Pick a non-zero group to delete
            const nonZeroGroups = groupIds.filter((id) => id !== 0);
            if (nonZeroGroups.length === 0) return;

            const groupToDelete = nonZeroGroups[0];
            const pixelsNotInGroup = pixels.filter(
              (p) => p.group !== groupToDelete
            );

            // Set active group and delete
            store.getState().setActiveDataGroup(groupToDelete);
            store.getState().deleteDataGroup();

            const state = store.getState();

            // Pixels not in the deleted group should retain their original group
            for (const originalPixel of pixelsNotInGroup) {
              const updatedPixel = state.pixels.find(
                (p) => p.x === originalPixel.x && p.y === originalPixel.y
              );
              expect(updatedPixel).toBeDefined();
              expect(updatedPixel?.group).toBe(originalPixel.group);
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should not delete the default "None" group (id: 0)', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 5 }), (groupCount) => {
          const store = createMockStore();

          // Create some groups
          for (let i = 0; i < groupCount; i++) {
            store.getState().addDataGroup();
          }

          // Try to delete the default group
          store.getState().setActiveDataGroup(0);
          store.getState().deleteDataGroup();

          const state = store.getState();

          // The default "None" group should still exist
          const noneGroup = state.dataGroups.find((g) => g.id === 0);
          expect(noneGroup).toBeDefined();
          expect(noneGroup?.name).toBe('None');
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('clearDataGroup reassigns all affected pixels to group 0', () => {
    it('should reassign all pixels from cleared group to group 0 without removing the group', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }), // Number of groups to create
          fc.integer({ min: 1, max: 50 }), // Number of pixels
          (groupCount, pixelCount) => {
            const store = createMockStore();

            // Create groups
            for (let i = 0; i < groupCount; i++) {
              store.getState().addDataGroup();
            }

            const groupIds = store.getState().dataGroups.map((g) => g.id);

            // Create pixels assigned to various groups
            const pixels: Pixel[] = [];
            for (let i = 0; i < pixelCount; i++) {
              const groupId = groupIds[i % groupIds.length];
              pixels.push({
                x: i % 16,
                y: Math.floor(i / 16),
                r: 100,
                g: 100,
                b: 100,
                colorGroup: 0,
                group: groupId,
                colorType: 0,
              });
            }

            store.setState({ pixels });

            // Pick a non-zero group to clear
            const nonZeroGroups = groupIds.filter((id) => id !== 0);
            if (nonZeroGroups.length === 0) return;

            const groupToClear = nonZeroGroups[0];
            const pixelsInGroup = pixels.filter((p) => p.group === groupToClear);
            const originalGroupCount = store.getState().dataGroups.length;

            // Set active group and clear
            store.getState().setActiveDataGroup(groupToClear);
            store.getState().clearDataGroup();

            const state = store.getState();

            // All pixels that were in the cleared group should now be in group 0
            for (const originalPixel of pixelsInGroup) {
              const updatedPixel = state.pixels.find(
                (p) => p.x === originalPixel.x && p.y === originalPixel.y
              );
              expect(updatedPixel).toBeDefined();
              expect(updatedPixel?.group).toBe(0);
            }

            // The cleared group should still exist (unlike delete)
            expect(state.dataGroups.find((g) => g.id === groupToClear)).toBeDefined();

            // Group count should remain the same
            expect(state.dataGroups.length).toBe(originalGroupCount);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should not affect pixels in other groups when clearing a group', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 10 }), // Need at least 2 groups
          fc.integer({ min: 1, max: 50 }), // Number of pixels
          (groupCount, pixelCount) => {
            const store = createMockStore();

            // Create groups
            for (let i = 0; i < groupCount - 1; i++) {
              store.getState().addDataGroup();
            }

            const groupIds = store.getState().dataGroups.map((g) => g.id);

            // Create pixels assigned to various groups
            const pixels: Pixel[] = [];
            for (let i = 0; i < pixelCount; i++) {
              const groupId = groupIds[i % groupIds.length];
              pixels.push({
                x: i % 16,
                y: Math.floor(i / 16),
                r: 100,
                g: 100,
                b: 100,
                colorGroup: 0,
                group: groupId,
                colorType: 0,
              });
            }

            store.setState({ pixels });

            // Pick a non-zero group to clear
            const nonZeroGroups = groupIds.filter((id) => id !== 0);
            if (nonZeroGroups.length === 0) return;

            const groupToClear = nonZeroGroups[0];
            const pixelsNotInGroup = pixels.filter(
              (p) => p.group !== groupToClear
            );

            // Set active group and clear
            store.getState().setActiveDataGroup(groupToClear);
            store.getState().clearDataGroup();

            const state = store.getState();

            // Pixels not in the cleared group should retain their original group
            for (const originalPixel of pixelsNotInGroup) {
              const updatedPixel = state.pixels.find(
                (p) => p.x === originalPixel.x && p.y === originalPixel.y
              );
              expect(updatedPixel).toBeDefined();
              expect(updatedPixel?.group).toBe(originalPixel.group);
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should be a no-op when clearing the default "None" group (id: 0)', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 50 }), (pixelCount) => {
          const store = createMockStore();

          // Create pixels all in group 0
          const pixels: Pixel[] = [];
          for (let i = 0; i < pixelCount; i++) {
            pixels.push({
              x: i % 16,
              y: Math.floor(i / 16),
              r: 100,
              g: 100,
              b: 100,
              colorGroup: 0,
              group: 0,
              colorType: 0,
            });
          }

          store.setState({ pixels });

          // Try to clear the default group
          store.getState().setActiveDataGroup(0);
          store.getState().clearDataGroup();

          const state = store.getState();

          // All pixels should still be in group 0
          for (const pixel of state.pixels) {
            expect(pixel.group).toBe(0);
          }
        }),
        { numRuns: 20 }
      );
    });
  });
});

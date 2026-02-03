/**
 * Group slice for managing data groups state
 * Handles data group creation, deletion, clearing, and naming
 * 
 * Requirements:
 * - 6.1: Initialize with default "None" data group (id: 0)
 * - 6.2: Add new group with auto-incremented ID
 * - 6.3: Delete active group and reassign pixels to "None"
 * - 6.4: Clear active group (reassign pixels to "None")
 * - 6.5: Update group name
 */

import type { StateCreator } from 'zustand';
import type { DataGroup } from '../../types';
import type { PixelConverterState } from '../types';

/**
 * GroupSlice interface for data group management
 */
export interface GroupSlice {
  // Data groups state
  dataGroups: DataGroup[];
  activeDataGroupId: number;

  // Actions
  addDataGroup: () => void;
  deleteDataGroup: () => void;
  clearDataGroup: () => void;
  updateDataGroupName: (id: number, name: string) => void;
  setActiveDataGroup: (id: number) => void;
  assignPixelsToDataGroup: (pixelKeys: string[], dataGroupId: number) => void;
}

/**
 * Default "None" data group (id: 0)
 * Requirement 6.1: Initialize with default "None" data group
 */
export const DEFAULT_DATA_GROUP: DataGroup = {
  id: 0,
  name: 'None',
};

/**
 * Creates the group slice for the Zustand store
 * Manages data groups and their operations
 */
export const createGroupSlice: StateCreator<
  PixelConverterState,
  [],
  [],
  GroupSlice
> = (set) => ({
  // Initial state - Requirement 6.1
  dataGroups: [DEFAULT_DATA_GROUP],
  activeDataGroupId: 0,

  // Actions

  /**
   * Add a new data group with auto-incremented ID
   * Requirement 6.2: Create new group with auto-incremented ID
   */
  addDataGroup: () =>
    set((state) => {
      // Find the maximum ID in existing groups and increment by 1
      const maxId = state.dataGroups.reduce(
        (max, group) => Math.max(max, group.id),
        0
      );
      const newId = maxId + 1;

      const newGroup: DataGroup = {
        id: newId,
        name: `Group ${newId}`,
      };

      return {
        dataGroups: [...state.dataGroups, newGroup],
        activeDataGroupId: newId, // Automatically select the new group
      };
    }),

  /**
   * Delete the active data group and reassign its pixels to "None" (id: 0)
   * Requirement 6.3: Remove active group and reassign pixels to "None"
   */
  deleteDataGroup: () =>
    set((state) => {
      const { activeDataGroupId, dataGroups, pixels } = state;

      // Cannot delete the default "None" group (id: 0)
      if (activeDataGroupId === 0) {
        return state;
      }

      // Remove the active group from the list
      const updatedGroups = dataGroups.filter(
        (group) => group.id !== activeDataGroupId
      );

      // Reassign all pixels from the deleted group to "None" (id: 0)
      const updatedPixels = pixels.map((pixel) =>
        pixel.group === activeDataGroupId
          ? { ...pixel, group: 0 }
          : pixel
      );

      return {
        dataGroups: updatedGroups,
        pixels: updatedPixels,
        activeDataGroupId: 0, // Reset to "None" group
      };
    }),

  /**
   * Clear the active data group by reassigning all its pixels to "None" (id: 0)
   * Requirement 6.4: Reassign all pixels in active group to "None"
   */
  clearDataGroup: () =>
    set((state) => {
      const { activeDataGroupId, pixels } = state;

      // No need to clear if already on "None" group
      if (activeDataGroupId === 0) {
        return state;
      }

      // Reassign all pixels from the active group to "None" (id: 0)
      const updatedPixels = pixels.map((pixel) =>
        pixel.group === activeDataGroupId
          ? { ...pixel, group: 0 }
          : pixel
      );

      return {
        pixels: updatedPixels,
      };
    }),

  /**
   * Update the name of a data group
   * Requirement 6.5: Update group name
   */
  updateDataGroupName: (id: number, name: string) =>
    set((state) => {
      const updatedGroups = state.dataGroups.map((group) =>
        group.id === id ? { ...group, name } : group
      );

      return {
        dataGroups: updatedGroups,
      };
    }),

  /**
   * Set the active data group
   */
  setActiveDataGroup: (id: number) =>
    set(() => ({
      activeDataGroupId: id,
    })),

  /**
   * Assign selected pixels to a data group
   * 
   * Requirements:
   * - 5.1: Allow assigning pixels to data groups via rectangle selection
   * - 5.5: Only affect pixels matching color group filter if active
   * 
   * @param pixelKeys - Array of pixel keys in "x,y" format
   * @param dataGroupId - The data group ID to assign to the pixels
   */
  assignPixelsToDataGroup: (pixelKeys: string[], dataGroupId: number) =>
    set((state) => {
      const { pixels, dataGroups, activeColorGroup } = state;

      // Verify the data group exists
      const dataGroupExists = dataGroups.some((dg) => dg.id === dataGroupId);
      if (!dataGroupExists) {
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

        // Check color group filter (Requirement 5.5)
        if (activeColorGroup >= 0 && pixel.colorGroup !== activeColorGroup) {
          return pixel;
        }

        return { ...pixel, group: dataGroupId };
      });

      return {
        pixels: updatedPixels,
      };
    }),
});

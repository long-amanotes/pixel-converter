/**
 * Undo slice for managing undo stack state
 * Handles saving state snapshots and restoring previous states
 *
 * Requirements:
 * - 8.1: When a destructive operation is performed, save the current state to the undo stack
 * - 8.2: When user clicks "Undo" or presses Ctrl+Z, restore the previous state
 * - 8.3: The undo stack shall maintain a maximum of 50 states
 */

import type { StateCreator } from 'zustand';
import type { PixelConverterState, UndoState } from '../types';

/**
 * Maximum number of states to keep in the undo stack
 * Requirement 8.3: The undo stack shall maintain a maximum of 50 states
 */
export const MAX_UNDO_STACK_SIZE = 50;

/**
 * UndoSlice interface for undo functionality management
 */
export interface UndoSlice {
  // Undo stack state
  undoStack: UndoState[];

  // Actions
  saveState: () => void;
  undo: () => void;
  clearUndoStack: () => void;
}

/**
 * Creates the undo slice for the Zustand store
 * Manages undo stack and state restoration
 */
export const createUndoSlice: StateCreator<
  PixelConverterState,
  [],
  [],
  UndoSlice
> = (set) => ({
  // Initial state - empty undo stack
  undoStack: [],

  // Actions

  /**
   * Save the current state to the undo stack
   * Requirement 8.1: When a destructive operation is performed, save the current state
   *
   * This should be called BEFORE performing any destructive operation
   * (paint, erase, delete group, clear group, import, etc.)
   */
  saveState: () =>
    set((state) => {
      const { pixels, palette, dataGroups, colorTypes, undoStack } = state;

      // Create a snapshot of the current state
      // Deep copy arrays to prevent mutation issues
      const snapshot: UndoState = {
        pixels: pixels.map((pixel) => ({ ...pixel })),
        palette: [...palette],
        dataGroups: dataGroups.map((group) => ({ ...group })),
        colorTypes: colorTypes.map((colorType) => ({ ...colorType })),
      };

      // Add the snapshot to the undo stack
      const newUndoStack = [...undoStack, snapshot];

      // Requirement 8.3: Maintain maximum of 50 states
      // If stack exceeds max size, remove the oldest state(s)
      if (newUndoStack.length > MAX_UNDO_STACK_SIZE) {
        newUndoStack.splice(0, newUndoStack.length - MAX_UNDO_STACK_SIZE);
      }

      return {
        undoStack: newUndoStack,
      };
    }),

  /**
   * Restore the previous state from the undo stack
   * Requirement 8.2: When user clicks "Undo" or presses Ctrl+Z, restore the previous state
   *
   * If the undo stack is empty, this operation does nothing
   * (the UI should display an alert message - handled by the component)
   */
  undo: () =>
    set((state) => {
      const { undoStack } = state;

      // If undo stack is empty, do nothing
      if (undoStack.length === 0) {
        return state;
      }

      // Pop the last state from the stack
      const newUndoStack = [...undoStack];
      const previousState = newUndoStack.pop();

      // This should never happen due to the length check above, but TypeScript needs it
      if (!previousState) {
        return state;
      }

      // Restore the previous state
      // Deep copy to prevent mutation issues
      return {
        undoStack: newUndoStack,
        pixels: previousState.pixels.map((pixel) => ({ ...pixel })),
        palette: [...previousState.palette],
        dataGroups: previousState.dataGroups.map((group) => ({ ...group })),
        colorTypes: previousState.colorTypes.map((colorType) => ({
          ...colorType,
        })),
      };
    }),

  /**
   * Clear the undo stack
   * Used when importing data to start fresh
   */
  clearUndoStack: () =>
    set(() => ({
      undoStack: [],
    })),
});

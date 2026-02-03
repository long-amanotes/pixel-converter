/**
 * Main Zustand store for the Pixel Converter application
 * Combines all slices into a single store
 *
 * Requirements:
 * - 11.2: Use React Context or Zustand for centralized state management
 */

import { create } from 'zustand';
import type { PixelConverterState } from './types';
import {
  createPixelSlice,
  createPaletteSlice,
  createUISlice,
  createGroupSlice,
  createColorTypeSlice,
  createUndoSlice,
} from './slices';

/**
 * Main Zustand store combining all slices
 *
 * The store uses the slice pattern where each slice is a function that
 * receives the Zustand set, get, and store API and returns a partial state.
 * All slices are spread into a single store object.
 */
export const useStore = create<PixelConverterState>()((...a) => ({
  ...createPixelSlice(...a),
  ...createPaletteSlice(...a),
  ...createUISlice(...a),
  ...createGroupSlice(...a),
  ...createColorTypeSlice(...a),
  ...createUndoSlice(...a),
}));

// Re-export types and slices for convenience
export * from './types';
export * from './slices';

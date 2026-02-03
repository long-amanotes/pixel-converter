/**
 * Main Zustand store for the Pixel Converter application
 * Combines all slices into a single store
 *
 * Requirements:
 * - 11.2: Use React Context or Zustand for centralized state management
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { PixelConverterState } from './types';
import {
  createPixelSlice,
  createPaletteSlice,
  createUISlice,
  createGroupSlice,
  createColorTypeSlice,
  createUndoSlice,
} from './slices';
import { saveStateToStorage, saveImageToStorage } from '../utils/storageUtils';

/**
 * Main Zustand store combining all slices
 *
 * The store uses the slice pattern where each slice is a function that
 * receives the Zustand set, get, and store API and returns a partial state.
 * 
 * Includes persistence middleware to save state to localStorage
 */
export const useStore = create<PixelConverterState>()(
  subscribeWithSelector((...a) => ({
    ...createPixelSlice(...a),
    ...createPaletteSlice(...a),
    ...createUISlice(...a),
    ...createGroupSlice(...a),
    ...createColorTypeSlice(...a),
    ...createUndoSlice(...a),
  }))
);

// Subscribe to state changes and persist to localStorage
useStore.subscribe(
  (state) => ({
    pixels: state.pixels,
    size: state.size,
    palette: state.palette,
    dataGroups: state.dataGroups,
    colorTypes: state.colorTypes,
    scaleMode: state.scaleMode,
  }),
  (state) => {
    // Debounce storage updates to avoid excessive writes
    saveStateToStorage(state);
  },
  { equalityFn: (a, b) => JSON.stringify(a) === JSON.stringify(b) }
);

// Subscribe to original image changes and persist
useStore.subscribe(
  (state) => state.originalImage,
  (image) => {
    if (image) {
      saveImageToStorage(image);
    }
  }
);

// Re-export types and slices for convenience
export * from './types';
export * from './slices';

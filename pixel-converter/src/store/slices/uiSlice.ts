/**
 * UI slice for managing user interface state
 * Handles edit mode, zoom, selections, and drag state
 */

import type { StateCreator } from 'zustand';
import type { Position, EditMode, ScaleMode } from '../../types';
import type { UISlice, PixelConverterState } from '../types';

/**
 * Minimum zoom scale (10%)
 */
const MIN_ZOOM = 0.1;

/**
 * Maximum zoom scale (200%)
 */
const MAX_ZOOM = 2.0;

/**
 * Creates the UI slice for the Zustand store
 * Manages UI state including edit mode, zoom, selections, and drag state
 */
export const createUISlice: StateCreator<
  PixelConverterState,
  [],
  [],
  UISlice
> = (set, get) => ({
  // Initial state
  editMode: 'group' as EditMode,
  scaleMode: 'majority' as ScaleMode,
  zoomScale: 1.0, // 100%
  activeColorGroup: -1, // -1 means no active color group filter
  selectedPixels: new Set<string>(),

  // Drag state
  isDragging: false,
  dragStart: null,
  dragEnd: null,

  // Original image reference
  originalImage: null,

  // Actions
  setEditMode: (mode: EditMode) =>
    set(() => ({
      editMode: mode,
      // Clear selection when switching modes (Property 9)
      selectedPixels: new Set<string>(),
    })),

  setScaleMode: (mode: ScaleMode) =>
    set(() => ({
      scaleMode: mode,
    })),

  setZoomScale: (scale: number) =>
    set(() => ({
      // Clamp zoom between 10% and 200% (Property 2)
      zoomScale: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale)),
    })),

  setActiveColorGroup: (index: number) =>
    set(() => ({
      activeColorGroup: index,
    })),

  togglePixelSelection: (x: number, y: number) =>
    set((state) => {
      const key = `${x},${y}`;
      const newSelection = new Set(state.selectedPixels);
      if (newSelection.has(key)) {
        newSelection.delete(key);
      } else {
        newSelection.add(key);
      }
      return { selectedPixels: newSelection };
    }),

  selectPixelsInRect: (x0: number, y0: number, x1: number, y1: number) =>
    set((state) => {
      const minX = Math.min(x0, x1);
      const maxX = Math.max(x0, x1);
      const minY = Math.min(y0, y1);
      const maxY = Math.max(y0, y1);

      const newSelection = new Set(state.selectedPixels);
      const { pixels, activeColorGroup } = get();

      // Filter pixels based on active color group if set
      const eligiblePixels =
        activeColorGroup >= 0
          ? pixels.filter((p) => p.colorGroup === activeColorGroup)
          : pixels;

      // Add pixels within the rectangle to selection
      for (const pixel of eligiblePixels) {
        if (
          pixel.x >= minX &&
          pixel.x <= maxX &&
          pixel.y >= minY &&
          pixel.y <= maxY
        ) {
          newSelection.add(`${pixel.x},${pixel.y}`);
        }
      }

      return { selectedPixels: newSelection };
    }),

  clearSelection: () =>
    set(() => ({
      selectedPixels: new Set<string>(),
    })),

  setDragState: (
    isDragging: boolean,
    start?: Position | null,
    end?: Position | null
  ) =>
    set((state) => ({
      isDragging,
      dragStart: start !== undefined ? start : state.dragStart,
      dragEnd: end !== undefined ? end : state.dragEnd,
    })),

  setOriginalImage: (image: HTMLImageElement | null) =>
    set(() => ({
      originalImage: image,
    })),
});

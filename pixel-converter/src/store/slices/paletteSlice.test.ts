/**
 * Unit tests for palette slice
 * Tests palette management and regrouping functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import type { PixelConverterState } from '../types';
import { createPaletteSlice } from './paletteSlice';
import { createPixelSlice } from './pixelSlice';
import type { Pixel } from '../../types';

// Create a test store with only the slices we need
const createTestStore = () => {
  return create<PixelConverterState>()((...args) => ({
    ...createPixelSlice(...args),
    ...createPaletteSlice(...args),
    // Mock other required slices
    editMode: 'paint' as const,
    scaleMode: 'majority' as const,
    zoomScale: 1,
    activeColorGroup: -1,
    selectedPixels: new Set(),
    isDragging: false,
    dragStart: null,
    dragEnd: null,
    originalImage: null,
    dataGroups: [],
    activeDataGroupId: 0,
    colorTypes: [],
    activeColorTypeId: 0,
    undoStack: [],
    setEditMode: () => {},
    setScaleMode: () => {},
    setZoomScale: () => {},
    setActiveColorGroup: () => {},
    togglePixelSelection: () => {},
    selectPixelsInRect: () => {},
    clearSelection: () => {},
    setDragState: () => {},
    setOriginalImage: () => {},
    addDataGroup: () => {},
    deleteDataGroup: () => {},
    clearDataGroup: () => {},
    updateDataGroupName: () => {},
    setActiveDataGroup: () => {},
    parseColorTypes: () => {},
    setActiveColorType: () => {},
    setColorTypes: () => {},
    assignPixelsToColorType: () => {},
    saveState: () => {},
    undo: () => {},
    clearUndoStack: () => {},
  }));
};

describe('paletteSlice', () => {
  describe('regroup', () => {
    it('should assign each pixel to the nearest palette color', () => {
      const store = createTestStore();
      
      // Set up a simple palette with red, green, and blue
      store.setState({
        palette: ['#FF0000', '#00FF00', '#0000FF'],
        pixels: [
          // Pixel close to red
          { x: 0, y: 0, r: 255, g: 10, b: 10, colorGroup: -1, group: 0, colorType: 0 },
          // Pixel close to green
          { x: 1, y: 0, r: 10, g: 255, b: 10, colorGroup: -1, group: 0, colorType: 0 },
          // Pixel close to blue
          { x: 2, y: 0, r: 10, g: 10, b: 255, colorGroup: -1, group: 0, colorType: 0 },
          // Another pixel close to red
          { x: 3, y: 0, r: 250, g: 5, b: 5, colorGroup: -1, group: 0, colorType: 0 },
        ],
      });

      // Perform regrouping
      store.getState().regroup();

      const state = store.getState();
      
      // Check that pixels are assigned to correct color groups
      expect(state.pixels[0].colorGroup).toBe(0); // Red
      expect(state.pixels[1].colorGroup).toBe(1); // Green
      expect(state.pixels[2].colorGroup).toBe(2); // Blue
      expect(state.pixels[3].colorGroup).toBe(0); // Red

      // Check that color groups are created correctly
      expect(state.colorGroups).toHaveLength(3);
      
      const redGroup = state.colorGroups.find(g => g.index === 0);
      const greenGroup = state.colorGroups.find(g => g.index === 1);
      const blueGroup = state.colorGroups.find(g => g.index === 2);
      
      expect(redGroup?.pixels).toHaveLength(2);
      expect(greenGroup?.pixels).toHaveLength(1);
      expect(blueGroup?.pixels).toHaveLength(1);
    });

    it('should handle empty pixels array', () => {
      const store = createTestStore();
      
      store.setState({
        palette: ['#FF0000', '#00FF00'],
        pixels: [],
      });

      store.getState().regroup();

      const state = store.getState();
      expect(state.colorGroups).toHaveLength(0);
    });

    it('should handle empty palette', () => {
      const store = createTestStore();
      
      store.setState({
        palette: [],
        pixels: [
          { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: -1, group: 0, colorType: 0 },
        ],
      });

      store.getState().regroup();

      const state = store.getState();
      expect(state.colorGroups).toHaveLength(0);
    });

    it('should update colorGroup assignments when palette changes', () => {
      const store = createTestStore();
      
      // Initial setup with red and blue palette
      store.setState({
        palette: ['#FF0000', '#0000FF'],
        pixels: [
          { x: 0, y: 0, r: 128, g: 128, b: 0, colorGroup: -1, group: 0, colorType: 0 },
        ],
      });

      store.getState().regroup();
      
      // Pixel should be assigned to red (closer than blue)
      expect(store.getState().pixels[0].colorGroup).toBe(0);

      // Change palette to green and blue
      store.setState({
        palette: ['#00FF00', '#0000FF'],
      });

      store.getState().regroup();
      
      // Pixel should now be assigned to green (index 0)
      expect(store.getState().pixels[0].colorGroup).toBe(0);
    });

    it('should preserve other pixel properties during regrouping', () => {
      const store = createTestStore();
      
      const originalPixel: Pixel = {
        x: 5,
        y: 10,
        r: 200,
        g: 50,
        b: 50,
        colorGroup: -1,
        group: 3,
        colorType: 2,
      };

      store.setState({
        palette: ['#FF0000'],
        pixels: [originalPixel],
      });

      store.getState().regroup();

      const updatedPixel = store.getState().pixels[0];
      
      // Check that non-colorGroup properties are preserved
      expect(updatedPixel.x).toBe(originalPixel.x);
      expect(updatedPixel.y).toBe(originalPixel.y);
      expect(updatedPixel.r).toBe(originalPixel.r);
      expect(updatedPixel.g).toBe(originalPixel.g);
      expect(updatedPixel.b).toBe(originalPixel.b);
      expect(updatedPixel.group).toBe(originalPixel.group);
      expect(updatedPixel.colorType).toBe(originalPixel.colorType);
      
      // Only colorGroup should change
      expect(updatedPixel.colorGroup).toBe(0);
    });

    it('should create color groups sorted by index', () => {
      const store = createTestStore();
      
      store.setState({
        palette: ['#FF0000', '#00FF00', '#0000FF'],
        pixels: [
          { x: 0, y: 0, r: 10, g: 10, b: 255, colorGroup: -1, group: 0, colorType: 0 }, // Blue (2)
          { x: 1, y: 0, r: 255, g: 10, b: 10, colorGroup: -1, group: 0, colorType: 0 }, // Red (0)
          { x: 2, y: 0, r: 10, g: 255, b: 10, colorGroup: -1, group: 0, colorType: 0 }, // Green (1)
        ],
      });

      store.getState().regroup();

      const colorGroups = store.getState().colorGroups;
      
      // Should be sorted by index
      expect(colorGroups[0].index).toBe(0);
      expect(colorGroups[1].index).toBe(1);
      expect(colorGroups[2].index).toBe(2);
    });
  });
});

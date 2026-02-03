/**
 * Unit tests for pixel slice
 */

import { describe, it, expect } from 'vitest';
import { create } from 'zustand';
import type { PixelConverterState } from '../types';
import { createPixelSlice } from './pixelSlice';
import type { ExportedData } from '../../types';

// Create a minimal store for testing
const createTestStore = () => {
  return create<PixelConverterState>()((...a) => ({
    ...createPixelSlice(...a),
    // Mock other slices with minimal implementation
    palette: [],
    colorGroups: [],
    addPaletteColor: () => {},
    updatePaletteColor: () => {},
    setPalette: () => {},
    setColorGroups: () => {},
    regroup: () => {},
    editMode: 'paint' as const,
    scaleMode: 'majority' as const,
    zoomScale: 1,
    activeColorGroup: -1,
    selectedPixels: new Set(),
    isDragging: false,
    dragStart: null,
    dragEnd: null,
    originalImage: null,
    setEditMode: () => {},
    setScaleMode: () => {},
    setZoomScale: () => {},
    setActiveColorGroup: () => {},
    togglePixelSelection: () => {},
    selectPixelsInRect: () => {},
    clearSelection: () => {},
    setDragState: () => {},
    setOriginalImage: () => {},
    dataGroups: [],
    activeDataGroupId: 0,
    addDataGroup: () => {},
    deleteDataGroup: () => {},
    clearDataGroup: () => {},
    updateDataGroupName: () => {},
    setActiveDataGroup: () => {},
    assignPixelsToDataGroup: () => {},
    colorTypes: [],
    activeColorTypeId: 0,
    parseColorTypes: () => {},
    setActiveColorType: () => {},
    setColorTypes: () => {},
    assignPixelsToColorType: () => {},
    undoStack: [],
    saveState: () => {},
    undo: () => {},
    clearUndoStack: () => {},
  }));
};

describe('pixelSlice', () => {
  describe('setPixels', () => {
    it('should set pixels', () => {
      const store = createTestStore();
      const pixels = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
      ];

      store.getState().setPixels(pixels);

      expect(store.getState().pixels).toEqual(pixels);
    });
  });

  describe('setSize', () => {
    it('should set size', () => {
      const store = createTestStore();

      store.getState().setSize(64);

      expect(store.getState().size).toBe(64);
    });

    it('should clamp size to minimum 8', () => {
      const store = createTestStore();

      store.getState().setSize(5);

      expect(store.getState().size).toBe(8);
    });

    it('should clamp size to maximum 256', () => {
      const store = createTestStore();

      store.getState().setSize(300);

      expect(store.getState().size).toBe(256);
    });

    it('should scale existing pixels when size increases', () => {
      const store = createTestStore();
      
      // Set initial size and pixels
      store.setState({ 
        size: 32,
        pixels: [
          { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
          { x: 16, y: 16, r: 0, g: 255, b: 0, colorGroup: 0, group: 0, colorType: 0 },
          { x: 31, y: 31, r: 0, g: 0, b: 255, colorGroup: 0, group: 0, colorType: 0 },
        ]
      });

      // Double the size
      store.getState().setSize(64);

      const state = store.getState();
      expect(state.size).toBe(64);
      expect(state.pixels).toHaveLength(3);
      
      // Pixels should be scaled proportionally
      expect(state.pixels[0]!.x).toBe(0);
      expect(state.pixels[0]!.y).toBe(0);
      expect(state.pixels[1]!.x).toBe(32);
      expect(state.pixels[1]!.y).toBe(32);
      expect(state.pixels[2]!.x).toBe(62);
      expect(state.pixels[2]!.y).toBe(62);
      
      // Colors should remain unchanged
      expect(state.pixels[0]!.r).toBe(255);
      expect(state.pixels[1]!.g).toBe(255);
      expect(state.pixels[2]!.b).toBe(255);
    });

    it('should scale existing pixels when size decreases', () => {
      const store = createTestStore();
      
      // Set initial size and pixels
      store.setState({ 
        size: 64,
        pixels: [
          { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
          { x: 32, y: 32, r: 0, g: 255, b: 0, colorGroup: 0, group: 0, colorType: 0 },
          { x: 63, y: 63, r: 0, g: 0, b: 255, colorGroup: 0, group: 0, colorType: 0 },
        ]
      });

      // Halve the size
      store.getState().setSize(32);

      const state = store.getState();
      expect(state.size).toBe(32);
      expect(state.pixels).toHaveLength(3);
      
      // Pixels should be scaled proportionally
      expect(state.pixels[0]!.x).toBe(0);
      expect(state.pixels[0]!.y).toBe(0);
      expect(state.pixels[1]!.x).toBe(16);
      expect(state.pixels[1]!.y).toBe(16);
      expect(state.pixels[2]!.x).toBe(31);
      expect(state.pixels[2]!.y).toBe(31);
      
      // Colors should remain unchanged
      expect(state.pixels[0]!.r).toBe(255);
      expect(state.pixels[1]!.g).toBe(255);
      expect(state.pixels[2]!.b).toBe(255);
    });

    it('should not scale pixels when there are no pixels', () => {
      const store = createTestStore();
      
      store.setState({ size: 32, pixels: [] });
      store.getState().setSize(64);

      expect(store.getState().size).toBe(64);
      expect(store.getState().pixels).toHaveLength(0);
    });
  });

  describe('importFromJSON', () => {
    it('should import valid JSON data and update all state', () => {
      const store = createTestStore();

      const exportedData: ExportedData = {
        Palette: ['FF0000', '00FF00', '0000FF'],
        Artwork: {
          Width: 16,
          Height: 16,
          PixelData: [
            {
              Position: { x: 0, y: 0 },
              Group: 0,
              ColorGroup: 0,
              ColorType: 0,
              ColorHex: 'FF0000',
            },
            {
              Position: { x: 1, y: 0 },
              Group: 1,
              ColorGroup: 1,
              ColorType: 1,
              ColorHex: '00FF00',
            },
          ],
        },
      };

      store.getState().importFromJSON(exportedData);

      const state = store.getState();

      // Check pixels were imported
      expect(state.pixels).toHaveLength(2);
      expect(state.pixels[0]).toEqual({
        x: 0,
        y: 0,
        r: 255,
        g: 0,
        b: 0,
        colorGroup: 0,
        group: 0,
        colorType: 0,
      });

      // Check size was set
      expect(state.size).toBe(16);

      // Check palette was imported
      expect(state.palette).toEqual(['#FF0000', '#00FF00', '#0000FF']);

      // Check data groups were extracted
      expect(state.dataGroups).toHaveLength(2);
      expect(state.dataGroups[0]).toEqual({ id: 0, name: 'None' });
      expect(state.dataGroups[1]).toEqual({ id: 1, name: 'Group 1' });

      // Check color types were extracted
      expect(state.colorTypes).toHaveLength(1);
      expect(state.colorTypes[0]).toEqual({
        id: 1,
        color: '#00ff00',
        name: 'Color 1',
      });

      // Check UI state was reset
      expect(state.selectedPixels.size).toBe(0);
      expect(state.activeDataGroupId).toBe(0);
      expect(state.activeColorTypeId).toBe(0);
      expect(state.activeColorGroup).toBe(-1);
    });

    it('should throw error for invalid JSON data', () => {
      const store = createTestStore();

      const invalidData = {
        Palette: ['FF0000'],
        // Missing Artwork
      };

      expect(() => store.getState().importFromJSON(invalidData)).toThrow();
    });
  });

  describe('applyPaintColor', () => {
    it('should apply paint color to selected pixels', () => {
      const store = createTestStore();
      const pixels = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
        { x: 1, y: 0, r: 0, g: 255, b: 0, colorGroup: 0, group: 0, colorType: 0 },
        { x: 2, y: 0, r: 0, g: 0, b: 255, colorGroup: 0, group: 0, colorType: 0 },
      ];

      store.setState({ pixels, activeColorGroup: -1 });

      // Apply blue color to first two pixels
      store.getState().applyPaintColor(['0,0', '1,0'], '#0000ff');

      const updatedPixels = store.getState().pixels;
      expect(updatedPixels[0]!.r).toBe(0);
      expect(updatedPixels[0]!.g).toBe(0);
      expect(updatedPixels[0]!.b).toBe(255);
      expect(updatedPixels[1]!.r).toBe(0);
      expect(updatedPixels[1]!.g).toBe(0);
      expect(updatedPixels[1]!.b).toBe(255);
      // Third pixel should remain unchanged
      expect(updatedPixels[2]!.r).toBe(0);
      expect(updatedPixels[2]!.g).toBe(0);
      expect(updatedPixels[2]!.b).toBe(255);
    });

    it('should only affect pixels in active color group when filter is set', () => {
      const store = createTestStore();
      const pixels = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
        { x: 1, y: 0, r: 0, g: 255, b: 0, colorGroup: 1, group: 0, colorType: 0 },
        { x: 2, y: 0, r: 0, g: 0, b: 255, colorGroup: 0, group: 0, colorType: 0 },
      ];

      store.setState({ pixels, activeColorGroup: 0 });

      // Try to paint all pixels, but only colorGroup 0 should be affected
      store.getState().applyPaintColor(['0,0', '1,0', '2,0'], '#ffffff');

      const updatedPixels = store.getState().pixels;
      // First pixel (colorGroup 0) should be painted
      expect(updatedPixels[0]!.r).toBe(255);
      expect(updatedPixels[0]!.g).toBe(255);
      expect(updatedPixels[0]!.b).toBe(255);
      // Second pixel (colorGroup 1) should remain unchanged
      expect(updatedPixels[1]!.r).toBe(0);
      expect(updatedPixels[1]!.g).toBe(255);
      expect(updatedPixels[1]!.b).toBe(0);
      // Third pixel (colorGroup 0) should be painted
      expect(updatedPixels[2]!.r).toBe(255);
      expect(updatedPixels[2]!.g).toBe(255);
      expect(updatedPixels[2]!.b).toBe(255);
    });

    it('should handle invalid hex color gracefully', () => {
      const store = createTestStore();
      const pixels = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
      ];

      store.setState({ pixels });

      // Try to apply invalid color
      store.getState().applyPaintColor(['0,0'], 'invalid');

      // Pixels should remain unchanged
      const updatedPixels = store.getState().pixels;
      expect(updatedPixels[0]!.r).toBe(255);
      expect(updatedPixels[0]!.g).toBe(0);
      expect(updatedPixels[0]!.b).toBe(0);
    });
  });

  describe('eraseSelectedPixels', () => {
    it('should remove selected pixels from array', () => {
      const store = createTestStore();
      const pixels = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
        { x: 1, y: 0, r: 0, g: 255, b: 0, colorGroup: 0, group: 0, colorType: 0 },
        { x: 2, y: 0, r: 0, g: 0, b: 255, colorGroup: 0, group: 0, colorType: 0 },
      ];

      store.setState({ pixels, activeColorGroup: -1 });

      // Erase first two pixels
      store.getState().eraseSelectedPixels(['0,0', '1,0']);

      const updatedPixels = store.getState().pixels;
      expect(updatedPixels).toHaveLength(1);
      expect(updatedPixels[0]!.x).toBe(2);
      expect(updatedPixels[0]!.y).toBe(0);
    });

    it('should only erase pixels in active color group when filter is set', () => {
      const store = createTestStore();
      const pixels = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
        { x: 1, y: 0, r: 0, g: 255, b: 0, colorGroup: 1, group: 0, colorType: 0 },
        { x: 2, y: 0, r: 0, g: 0, b: 255, colorGroup: 0, group: 0, colorType: 0 },
      ];

      store.setState({ pixels, activeColorGroup: 0 });

      // Try to erase all pixels, but only colorGroup 0 should be erased
      store.getState().eraseSelectedPixels(['0,0', '1,0', '2,0']);

      const updatedPixels = store.getState().pixels;
      expect(updatedPixels).toHaveLength(1);
      expect(updatedPixels[0]!.x).toBe(1);
      expect(updatedPixels[0]!.y).toBe(0);
      expect(updatedPixels[0]!.colorGroup).toBe(1);
    });

    it('should handle empty selection gracefully', () => {
      const store = createTestStore();
      const pixels = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
      ];

      store.setState({ pixels });

      // Erase with empty selection
      store.getState().eraseSelectedPixels([]);

      // All pixels should remain
      const updatedPixels = store.getState().pixels;
      expect(updatedPixels).toHaveLength(1);
    });
  });
});

/**
 * Integration tests for component wiring
 * Validates that all components are properly connected to the Zustand store
 * and that state flows correctly between components
 * 
 * Validates: Requirements 11.1, 11.2
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStore } from '../../store';
import type { Pixel } from '../../types';

describe('Component Integration - Store Wiring', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    const { getState } = useStore;
    act(() => {
      useStore.setState({
        pixels: [],
        size: 32,
        palette: [
          '#FF0000',
          '#00FF00',
          '#0000FF',
          '#FFFF00',
          '#FF00FF',
          '#00FFFF',
          '#FFFFFF',
          '#000000',
          '#808080',
        ],
        colorGroups: [],
        dataGroups: [{ id: 0, name: 'None' }],
        activeDataGroupId: 0,
        colorTypes: [],
        activeColorTypeId: 0,
        editMode: 'group',
        scaleMode: 'majority',
        zoomScale: 1.0,
        activeColorGroup: -1,
        selectedPixels: new Set<string>(),
        isDragging: false,
        dragStart: null,
        dragEnd: null,
        originalImage: null,
        undoStack: [],
      });
    });
  });

  describe('Pixel State Management', () => {
    it('should update pixels through setPixels action', () => {
      const { result } = renderHook(() => useStore());

      const testPixels: Pixel[] = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
        { x: 1, y: 0, r: 0, g: 255, b: 0, colorGroup: 1, group: 0, colorType: 0 },
      ];

      act(() => {
        result.current.setPixels(testPixels);
      });

      expect(result.current.pixels).toHaveLength(2);
      expect(result.current.pixels[0]).toEqual(testPixels[0]);
    });

    it('should clamp size between 8 and 256', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setSize(5); // Below minimum
      });
      expect(result.current.size).toBe(8);

      act(() => {
        result.current.setSize(300); // Above maximum
      });
      expect(result.current.size).toBe(256);

      act(() => {
        result.current.setSize(64); // Valid value
      });
      expect(result.current.size).toBe(64);
    });
  });

  describe('Palette and Color Groups Integration', () => {
    it('should add palette color and trigger regroup', () => {
      const { result } = renderHook(() => useStore());

      const initialPaletteLength = result.current.palette.length;

      act(() => {
        result.current.addPaletteColor('#AABBCC');
      });

      expect(result.current.palette).toHaveLength(initialPaletteLength + 1);
      expect(result.current.palette[initialPaletteLength]).toBe('#AABBCC');
    });

    it('should update palette color and regroup pixels', () => {
      const { result } = renderHook(() => useStore());

      // Set up test pixels
      const testPixels: Pixel[] = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
        { x: 1, y: 0, r: 0, g: 255, b: 0, colorGroup: 1, group: 0, colorType: 0 },
      ];

      act(() => {
        result.current.setPixels(testPixels);
        result.current.updatePaletteColor(0, '#FF0000');
        result.current.regroup();
      });

      // Verify color groups were created
      expect(result.current.colorGroups.length).toBeGreaterThan(0);
    });
  });

  describe('Edit Mode and Selection Integration', () => {
    it('should clear selection when switching edit modes', () => {
      const { result } = renderHook(() => useStore());

      // Set up test pixels first
      const testPixels: Pixel[] = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
        { x: 1, y: 0, r: 0, g: 255, b: 0, colorGroup: 1, group: 0, colorType: 0 },
        { x: 2, y: 0, r: 0, g: 0, b: 255, colorGroup: 2, group: 0, colorType: 0 },
      ];

      // Add some selections
      act(() => {
        result.current.setPixels(testPixels);
        result.current.selectPixelsInRect(0, 0, 2, 0);
      });

      expect(result.current.selectedPixels.size).toBeGreaterThan(0);

      // Switch edit mode
      act(() => {
        result.current.setEditMode('paint');
      });

      // Selection should be cleared (Property 9)
      expect(result.current.selectedPixels.size).toBe(0);
      expect(result.current.editMode).toBe('paint');
    });

    it('should maintain zoom scale within bounds', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setZoomScale(0.05); // Below minimum
      });
      expect(result.current.zoomScale).toBe(0.1);

      act(() => {
        result.current.setZoomScale(3.0); // Above maximum
      });
      expect(result.current.zoomScale).toBe(2.0);

      act(() => {
        result.current.setZoomScale(1.5); // Valid value
      });
      expect(result.current.zoomScale).toBe(1.5);
    });
  });

  describe('Data Groups Integration', () => {
    it('should add data group and auto-increment ID', () => {
      const { result } = renderHook(() => useStore());

      const initialGroupCount = result.current.dataGroups.length;

      act(() => {
        result.current.addDataGroup();
      });

      expect(result.current.dataGroups).toHaveLength(initialGroupCount + 1);
      expect(result.current.dataGroups[initialGroupCount]?.id).toBeGreaterThan(0);
      expect(result.current.activeDataGroupId).toBe(
        result.current.dataGroups[initialGroupCount]?.id
      );
    });

    it('should assign pixels to data group', () => {
      const { result } = renderHook(() => useStore());

      // Set up test pixels
      const testPixels: Pixel[] = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
        { x: 1, y: 0, r: 0, g: 255, b: 0, colorGroup: 1, group: 0, colorType: 0 },
      ];

      act(() => {
        result.current.setPixels(testPixels);
        result.current.addDataGroup();
        const newGroupId = result.current.dataGroups[1]?.id ?? 1;
        result.current.assignPixelsToDataGroup(['0,0'], newGroupId);
      });

      const updatedPixel = result.current.pixels.find((p) => p.x === 0 && p.y === 0);
      expect(updatedPixel?.group).toBe(result.current.dataGroups[1]?.id);
    });

    it('should delete data group and reassign pixels to None', () => {
      const { result } = renderHook(() => useStore());

      // Set up test pixels
      const testPixels: Pixel[] = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 1, colorType: 0 },
      ];

      act(() => {
        result.current.setPixels(testPixels);
        result.current.addDataGroup();
        const newGroupId = result.current.dataGroups[1]?.id ?? 1;
        result.current.setActiveDataGroup(newGroupId);
        result.current.deleteDataGroup();
      });

      // Pixel should be reassigned to "None" (id: 0)
      expect(result.current.pixels[0]?.group).toBe(0);
      expect(result.current.activeDataGroupId).toBe(0);
    });
  });

  describe('Color Types Integration', () => {
    it('should parse color types from color groups', () => {
      const { result } = renderHook(() => useStore());

      // Set up test pixels and color groups
      const testPixels: Pixel[] = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
        { x: 1, y: 0, r: 0, g: 255, b: 0, colorGroup: 1, group: 0, colorType: 0 },
      ];

      act(() => {
        result.current.setPixels(testPixels);
        result.current.regroup();
        result.current.parseColorTypes();
      });

      // Should create color types from non-empty color groups
      expect(result.current.colorTypes.length).toBeGreaterThan(0);
      
      // All pixels should be assigned to a color type
      const unassignedPixels = result.current.pixels.filter((p) => p.colorType === 0);
      expect(unassignedPixels).toHaveLength(0);
    });

    it('should assign pixels to color type', () => {
      const { result } = renderHook(() => useStore());

      // Set up test pixels
      const testPixels: Pixel[] = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
        { x: 1, y: 0, r: 0, g: 255, b: 0, colorGroup: 1, group: 0, colorType: 0 },
      ];

      act(() => {
        result.current.setPixels(testPixels);
        result.current.regroup();
        result.current.parseColorTypes();
        
        // Assign first pixel to color type 1
        if (result.current.colorTypes.length > 0) {
          result.current.assignPixelsToColorType(['0,0'], 1);
        }
      });

      const updatedPixel = result.current.pixels.find((p) => p.x === 0 && p.y === 0);
      expect(updatedPixel?.colorType).toBe(1);
    });
  });

  describe('Paint and Erase Operations Integration', () => {
    it('should apply paint color to selected pixels', () => {
      const { result } = renderHook(() => useStore());

      // Set up test pixels
      const testPixels: Pixel[] = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
        { x: 1, y: 0, r: 0, g: 255, b: 0, colorGroup: 1, group: 0, colorType: 0 },
      ];

      act(() => {
        result.current.setPixels(testPixels);
        result.current.applyPaintColor(['0,0'], '#0000FF');
      });

      const paintedPixel = result.current.pixels.find((p) => p.x === 0 && p.y === 0);
      expect(paintedPixel?.r).toBe(0);
      expect(paintedPixel?.g).toBe(0);
      expect(paintedPixel?.b).toBe(255);
    });

    it('should erase selected pixels', () => {
      const { result } = renderHook(() => useStore());

      // Set up test pixels
      const testPixels: Pixel[] = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
        { x: 1, y: 0, r: 0, g: 255, b: 0, colorGroup: 1, group: 0, colorType: 0 },
      ];

      act(() => {
        result.current.setPixels(testPixels);
        result.current.eraseSelectedPixels(['0,0']);
      });

      expect(result.current.pixels).toHaveLength(1);
      expect(result.current.pixels[0]?.x).toBe(1);
    });

    it('should respect color group filter when painting', () => {
      const { result } = renderHook(() => useStore());

      // Set up test pixels with different color groups
      const testPixels: Pixel[] = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
        { x: 1, y: 0, r: 0, g: 255, b: 0, colorGroup: 1, group: 0, colorType: 0 },
      ];

      act(() => {
        result.current.setPixels(testPixels);
        result.current.setActiveColorGroup(0); // Only affect color group 0
        result.current.applyPaintColor(['0,0', '1,0'], '#0000FF');
      });

      // Only pixel in color group 0 should be painted
      const pixel0 = result.current.pixels.find((p) => p.x === 0 && p.y === 0);
      const pixel1 = result.current.pixels.find((p) => p.x === 1 && p.y === 0);

      expect(pixel0?.b).toBe(255); // Should be painted
      expect(pixel1?.g).toBe(255); // Should NOT be painted (different color group)
    });
  });

  describe('Undo Functionality Integration', () => {
    it('should save state to undo stack', () => {
      const { result } = renderHook(() => useStore());

      const testPixels: Pixel[] = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
      ];

      act(() => {
        result.current.setPixels(testPixels);
        result.current.saveState();
      });

      expect(result.current.undoStack.length).toBeGreaterThan(0);
    });

    it('should restore previous state on undo', () => {
      const { result } = renderHook(() => useStore());

      const initialPixels: Pixel[] = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
      ];

      act(() => {
        result.current.setPixels(initialPixels);
        result.current.saveState();
        
        // Make a change
        result.current.applyPaintColor(['0,0'], '#00FF00');
        
        // Undo the change
        result.current.undo();
      });

      // Should restore original color
      const pixel = result.current.pixels.find((p) => p.x === 0 && p.y === 0);
      expect(pixel?.r).toBe(255);
      expect(pixel?.g).toBe(0);
      expect(pixel?.b).toBe(0);
    });
  });

  describe('Drag State Integration', () => {
    it('should manage drag state correctly', () => {
      const { result } = renderHook(() => useStore());

      act(() => {
        result.current.setDragState(true, { x: 0, y: 0 }, { x: 2, y: 2 });
      });

      expect(result.current.isDragging).toBe(true);
      expect(result.current.dragStart).toEqual({ x: 0, y: 0 });
      expect(result.current.dragEnd).toEqual({ x: 2, y: 2 });

      act(() => {
        result.current.setDragState(false, null, null);
      });

      expect(result.current.isDragging).toBe(false);
      expect(result.current.dragStart).toBeNull();
      expect(result.current.dragEnd).toBeNull();
    });
  });
});

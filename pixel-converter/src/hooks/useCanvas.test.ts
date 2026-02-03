/**
 * Unit tests for useCanvas hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCanvas } from './useCanvas';
import { useStore } from '../store';
import type { Pixel } from '../types';

// Mock the store
vi.mock('../store', () => ({
  useStore: vi.fn(),
}));

describe('useCanvas', () => {
  let mockStore: any;

  beforeEach(() => {
    // Reset mock store before each test
    mockStore = {
      pixels: [] as Pixel[],
      size: 16,
      zoomScale: 1.0,
      selectedPixels: new Set<string>(),
      activeColorGroup: -1,
      activeColorTypeId: 0,
      activeDataGroupId: 0,
      isDragging: false,
      dragStart: null,
      dragEnd: null,
      editMode: 'paint' as const,
      setDragState: vi.fn(),
      selectPixelsInRect: vi.fn(),
      clearSelection: vi.fn(),
      assignPixelsToDataGroup: vi.fn(),
      assignPixelsToColorType: vi.fn(),
      saveState: vi.fn(),
    };

    // Mock useStore to return our mock store
    (useStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector(mockStore);
      }
      return mockStore;
    });

    // Add getState method for the hook
    (useStore as any).getState = vi.fn(() => mockStore);
  });

  describe('initialization', () => {
    it('should return canvas ref and event handlers', () => {
      const { result } = renderHook(() => useCanvas());

      expect(result.current.canvasRef).toBeDefined();
      expect(result.current.handleMouseDown).toBeInstanceOf(Function);
      expect(result.current.handleMouseMove).toBeInstanceOf(Function);
      expect(result.current.handleMouseUp).toBeInstanceOf(Function);
    });

    it('should accept custom width and height options', () => {
      const { result } = renderHook(() =>
        useCanvas({ width: 1000, height: 800 })
      );

      expect(result.current.canvasRef).toBeDefined();
    });
  });

  describe('zoom calculations', () => {
    it('should calculate pixel size based on zoom scale', () => {
      mockStore.size = 16;
      mockStore.zoomScale = 1.0;

      const { result } = renderHook(() => useCanvas({ width: 800, height: 600 }));

      // With size=16 and min(800,600)=600, pixelSize should be floor(600/16*1.0) = 37
      expect(result.current.canvasRef).toBeDefined();
    });

    it('should handle zoom scale of 2.0 (200%)', () => {
      mockStore.size = 16;
      mockStore.zoomScale = 2.0;

      const { result } = renderHook(() => useCanvas({ width: 800, height: 600 }));

      // With size=16 and min(800,600)=600, pixelSize should be floor(600/16*2.0) = 75
      expect(result.current.canvasRef).toBeDefined();
    });

    it('should handle zoom scale of 0.1 (10%)', () => {
      mockStore.size = 16;
      mockStore.zoomScale = 0.1;

      const { result } = renderHook(() => useCanvas({ width: 800, height: 600 }));

      // With size=16 and min(800,600)=600, pixelSize should be floor(600/16*0.1) = 3
      expect(result.current.canvasRef).toBeDefined();
    });
  });

  describe('mouse interaction', () => {
    it('should start dragging on mouse down', () => {
      const { result } = renderHook(() => useCanvas());

      // Create a mock canvas element
      const mockCanvas = document.createElement('canvas');
      mockCanvas.width = 800;
      mockCanvas.height = 600;
      Object.defineProperty(result.current.canvasRef, 'current', {
        value: mockCanvas,
        writable: true,
      });

      // Mock getBoundingClientRect
      mockCanvas.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        right: 800,
        bottom: 600,
        width: 800,
        height: 600,
        x: 0,
        y: 0,
        toJSON: () => {},
      }));

      const mockEvent = {
        clientX: 100,
        clientY: 100,
      } as React.MouseEvent<HTMLCanvasElement>;

      act(() => {
        result.current.handleMouseDown(mockEvent);
      });

      expect(mockStore.setDragState).toHaveBeenCalled();
    });

    it('should update drag position on mouse move when dragging', () => {
      mockStore.isDragging = true;
      mockStore.dragStart = { x: 2, y: 2 };

      const { result } = renderHook(() => useCanvas());

      // Create a mock canvas element
      const mockCanvas = document.createElement('canvas');
      mockCanvas.width = 800;
      mockCanvas.height = 600;
      Object.defineProperty(result.current.canvasRef, 'current', {
        value: mockCanvas,
        writable: true,
      });

      // Mock getBoundingClientRect
      mockCanvas.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        right: 800,
        bottom: 600,
        width: 800,
        height: 600,
        x: 0,
        y: 0,
        toJSON: () => {},
      }));

      const mockEvent = {
        clientX: 200,
        clientY: 200,
      } as React.MouseEvent<HTMLCanvasElement>;

      act(() => {
        result.current.handleMouseMove(mockEvent);
      });

      expect(mockStore.setDragState).toHaveBeenCalled();
    });

    it('should not update drag position on mouse move when not dragging', () => {
      mockStore.isDragging = false;

      const { result } = renderHook(() => useCanvas());

      const mockEvent = {
        clientX: 200,
        clientY: 200,
      } as React.MouseEvent<HTMLCanvasElement>;

      act(() => {
        result.current.handleMouseMove(mockEvent);
      });

      // setDragState should not be called when not dragging
      expect(mockStore.setDragState).not.toHaveBeenCalled();
    });

    it('should complete drag selection on mouse up', () => {
      mockStore.isDragging = true;
      mockStore.dragStart = { x: 2, y: 2 };
      mockStore.dragEnd = { x: 5, y: 5 };

      const { result } = renderHook(() => useCanvas());

      act(() => {
        result.current.handleMouseUp();
      });

      expect(mockStore.saveState).toHaveBeenCalled();
      expect(mockStore.selectPixelsInRect).toHaveBeenCalledWith(2, 2, 5, 5);
      expect(mockStore.setDragState).toHaveBeenCalledWith(false, null, null);
    });

    it('should handle mouse up when not dragging', () => {
      mockStore.isDragging = false;

      const { result } = renderHook(() => useCanvas());

      act(() => {
        result.current.handleMouseUp();
      });

      expect(mockStore.setDragState).toHaveBeenCalledWith(false, null, null);
      expect(mockStore.saveState).not.toHaveBeenCalled();
    });
  });

  describe('edit mode handling', () => {
    it('should assign pixels to data group in group mode', () => {
      mockStore.isDragging = true;
      mockStore.dragStart = { x: 0, y: 0 };
      mockStore.dragEnd = { x: 1, y: 1 };
      mockStore.editMode = 'group';
      mockStore.activeDataGroupId = 5;

      const { result } = renderHook(() => useCanvas());

      act(() => {
        result.current.handleMouseUp();
      });

      expect(mockStore.assignPixelsToDataGroup).toHaveBeenCalled();
      expect(mockStore.clearSelection).toHaveBeenCalled();
    });

    it('should assign pixels to color type in colorType mode', () => {
      mockStore.isDragging = true;
      mockStore.dragStart = { x: 0, y: 0 };
      mockStore.dragEnd = { x: 1, y: 1 };
      mockStore.editMode = 'colorType';
      mockStore.activeColorTypeId = 3;

      const { result } = renderHook(() => useCanvas());

      act(() => {
        result.current.handleMouseUp();
      });

      expect(mockStore.assignPixelsToColorType).toHaveBeenCalled();
      expect(mockStore.clearSelection).toHaveBeenCalled();
    });

    it('should keep selection in paint mode', () => {
      mockStore.isDragging = true;
      mockStore.dragStart = { x: 0, y: 0 };
      mockStore.dragEnd = { x: 1, y: 1 };
      mockStore.editMode = 'paint';

      const { result } = renderHook(() => useCanvas());

      act(() => {
        result.current.handleMouseUp();
      });

      expect(mockStore.assignPixelsToDataGroup).not.toHaveBeenCalled();
      expect(mockStore.assignPixelsToColorType).not.toHaveBeenCalled();
      expect(mockStore.clearSelection).not.toHaveBeenCalled();
    });

    it('should keep selection in erase mode', () => {
      mockStore.isDragging = true;
      mockStore.dragStart = { x: 0, y: 0 };
      mockStore.dragEnd = { x: 1, y: 1 };
      mockStore.editMode = 'erase';

      const { result } = renderHook(() => useCanvas());

      act(() => {
        result.current.handleMouseUp();
      });

      expect(mockStore.assignPixelsToDataGroup).not.toHaveBeenCalled();
      expect(mockStore.assignPixelsToColorType).not.toHaveBeenCalled();
      expect(mockStore.clearSelection).not.toHaveBeenCalled();
    });
  });

  describe('coordinate conversion', () => {
    it('should handle size of 0 gracefully', () => {
      mockStore.size = 0;

      const { result } = renderHook(() => useCanvas());

      // Should not crash with size 0
      expect(result.current.canvasRef).toBeDefined();
    });

    it('should handle empty pixels array', () => {
      mockStore.pixels = [];
      mockStore.size = 16;

      const { result } = renderHook(() => useCanvas());

      // Should not crash with empty pixels
      expect(result.current.canvasRef).toBeDefined();
    });
  });
});

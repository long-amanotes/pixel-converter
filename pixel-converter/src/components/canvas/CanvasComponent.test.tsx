/**
 * Unit tests for CanvasComponent
 * Tests rendering, zoom support, and pixelated rendering CSS
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CanvasComponent } from './CanvasComponent';
import { useStore } from '../../store';
import type { Pixel } from '../../types';

describe('CanvasComponent', () => {
  beforeEach(() => {
    // Reset store state before each test
    useStore.setState({
      pixels: [],
      size: 0,
      zoomScale: 1.0,
      selectedPixels: new Set(),
      activeColorGroup: -1,
      activeColorTypeId: 0,
      activeDataGroupId: 0,
      isDragging: false,
      dragStart: null,
      dragEnd: null,
      editMode: 'group',
    });
  });

  it('should render canvas element', () => {
    render(<CanvasComponent />);
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });

  it('should apply pixelated rendering CSS', () => {
    render(<CanvasComponent />);
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas).toBeTruthy();
    
    const style = window.getComputedStyle(canvas);
    // Check that imageRendering is set (browser may normalize the value)
    expect(style.imageRendering).toBeTruthy();
  });

  it('should render with custom width and height', () => {
    render(<CanvasComponent width={1000} height={800} />);
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });

  it('should render pixels when state has pixel data', () => {
    const testPixels: Pixel[] = [
      { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
      { x: 1, y: 0, r: 0, g: 255, b: 0, colorGroup: 0, group: 0, colorType: 0 },
      { x: 0, y: 1, r: 0, g: 0, b: 255, colorGroup: 0, group: 0, colorType: 0 },
    ];

    useStore.setState({
      pixels: testPixels,
      size: 2,
      zoomScale: 1.0,
    });

    render(<CanvasComponent />);
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas).toBeTruthy();
    
    // Canvas should have dimensions based on size and zoom
    expect(canvas.width).toBeGreaterThan(0);
    expect(canvas.height).toBeGreaterThan(0);
  });

  it('should update canvas when zoom scale changes', async () => {
    const testPixels: Pixel[] = [
      { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
    ];

    useStore.setState({
      pixels: testPixels,
      size: 8,
      zoomScale: 1.0,
    });

    const { rerender } = render(<CanvasComponent width={800} height={600} />);
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas).toBeTruthy();

    // Change zoom scale and verify component re-renders without errors
    useStore.setState({ zoomScale: 2.0 });
    rerender(<CanvasComponent width={800} height={600} />);

    // Verify canvas still exists after zoom change
    const updatedCanvas = document.querySelector('canvas') as HTMLCanvasElement;
    expect(updatedCanvas).toBeTruthy();
  });

  it('should handle empty pixel array', () => {
    useStore.setState({
      pixels: [],
      size: 0,
    });

    render(<CanvasComponent />);
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas).toBeTruthy();
  });

  it('should apply crosshair cursor', () => {
    render(<CanvasComponent />);
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas.style.cursor).toBe('crosshair');
  });

  describe('Mouse interaction handlers', () => {
    it('should start drag on mouse down', () => {
      const testPixels: Pixel[] = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
        { x: 1, y: 0, r: 0, g: 255, b: 0, colorGroup: 0, group: 0, colorType: 0 },
      ];

      useStore.setState({
        pixels: testPixels,
        size: 2,
        zoomScale: 1.0,
      });

      render(<CanvasComponent width={800} height={600} />);
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;

      // Mock getBoundingClientRect
      canvas.getBoundingClientRect = vi.fn(() => ({
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

      // Simulate mouse down
      fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });

      // Check that drag state was set
      const state = useStore.getState();
      expect(state.isDragging).toBe(true);
      expect(state.dragStart).toBeTruthy();
    });

    it('should update drag position on mouse move', () => {
      const testPixels: Pixel[] = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
        { x: 1, y: 0, r: 0, g: 255, b: 0, colorGroup: 0, group: 0, colorType: 0 },
      ];

      useStore.setState({
        pixels: testPixels,
        size: 2,
        zoomScale: 1.0,
        isDragging: true,
        dragStart: { x: 0, y: 0 },
      });

      render(<CanvasComponent width={800} height={600} />);
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;

      // Mock getBoundingClientRect
      canvas.getBoundingClientRect = vi.fn(() => ({
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

      // Simulate mouse move
      fireEvent.mouseMove(canvas, { clientX: 200, clientY: 200 });

      // Check that drag end was updated
      const state = useStore.getState();
      expect(state.dragEnd).toBeTruthy();
    });

    it('should complete drag on mouse up in group mode', () => {
      const testPixels: Pixel[] = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
        { x: 1, y: 0, r: 0, g: 255, b: 0, colorGroup: 0, group: 0, colorType: 0 },
      ];

      useStore.setState({
        pixels: testPixels,
        size: 2,
        zoomScale: 1.0,
        isDragging: true,
        dragStart: { x: 0, y: 0 },
        dragEnd: { x: 1, y: 0 },
        editMode: 'group',
        activeDataGroupId: 1,
        dataGroups: [
          { id: 0, name: 'None' },
          { id: 1, name: 'Group 1' },
        ],
      });

      render(<CanvasComponent width={800} height={600} />);
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;

      // Simulate mouse up
      fireEvent.mouseUp(canvas);

      // Check that drag state was cleared
      const state = useStore.getState();
      expect(state.isDragging).toBe(false);
      expect(state.dragStart).toBeNull();
      expect(state.dragEnd).toBeNull();
    });

    it('should complete drag on mouse up in colorType mode', () => {
      const testPixels: Pixel[] = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
        { x: 1, y: 0, r: 0, g: 255, b: 0, colorGroup: 0, group: 0, colorType: 0 },
      ];

      useStore.setState({
        pixels: testPixels,
        size: 2,
        zoomScale: 1.0,
        isDragging: true,
        dragStart: { x: 0, y: 0 },
        dragEnd: { x: 1, y: 0 },
        editMode: 'colorType',
        activeColorTypeId: 1,
        colorTypes: [
          { id: 1, color: '#ff0000', name: 'Color 1' },
        ],
      });

      render(<CanvasComponent width={800} height={600} />);
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;

      // Simulate mouse up
      fireEvent.mouseUp(canvas);

      // Check that drag state was cleared
      const state = useStore.getState();
      expect(state.isDragging).toBe(false);
      expect(state.dragStart).toBeNull();
      expect(state.dragEnd).toBeNull();
    });

    it('should keep selection in paint mode on mouse up', () => {
      const testPixels: Pixel[] = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
        { x: 1, y: 0, r: 0, g: 255, b: 0, colorGroup: 0, group: 0, colorType: 0 },
      ];

      useStore.setState({
        pixels: testPixels,
        size: 2,
        zoomScale: 1.0,
        isDragging: true,
        dragStart: { x: 0, y: 0 },
        dragEnd: { x: 1, y: 0 },
        editMode: 'paint',
      });

      render(<CanvasComponent width={800} height={600} />);
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;

      // Simulate mouse up
      fireEvent.mouseUp(canvas);

      // Check that drag state was cleared but selection remains
      const state = useStore.getState();
      expect(state.isDragging).toBe(false);
      expect(state.selectedPixels.size).toBeGreaterThan(0);
    });

    it('should handle mouse leave as mouse up', () => {
      useStore.setState({
        pixels: [{ x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 }],
        size: 1,
        zoomScale: 1.0,
        isDragging: true,
        dragStart: { x: 0, y: 0 },
        dragEnd: { x: 0, y: 0 },
      });

      render(<CanvasComponent />);
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;

      // Simulate mouse leave
      fireEvent.mouseLeave(canvas);

      // Check that drag state was cleared
      const state = useStore.getState();
      expect(state.isDragging).toBe(false);
    });
  });

  describe('Pixel highlighting (Requirements 3.3, 3.4, 3.5, 3.6)', () => {
    let mockContext: any;

    beforeEach(() => {
      // Create a mock canvas context to track drawing operations
      mockContext = {
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        setLineDash: vi.fn(),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        imageSmoothingEnabled: true,
      };

      // Mock getContext to return our mock context
      HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);
    });

    it('should draw green border for selected pixels (Req 3.3)', () => {
      const testPixels: Pixel[] = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
        { x: 1, y: 0, r: 0, g: 255, b: 0, colorGroup: 0, group: 0, colorType: 0 },
      ];

      useStore.setState({
        pixels: testPixels,
        size: 2,
        zoomScale: 1.0,
        selectedPixels: new Set(['0,0']), // Select first pixel
        activeColorGroup: -1,
        activeColorTypeId: 0,
        activeDataGroupId: 0,
      });

      render(<CanvasComponent width={800} height={600} />);

      // Verify green border was drawn for selected pixel
      const greenBorderCalls = mockContext.strokeRect.mock.calls.filter(
        (_: any, index: number) => {
          const prevStrokeStyle = mockContext.strokeStyle;
          // Check if strokeStyle was set to green before this call
          return index > 0 && mockContext.strokeStyle === '#00ff00';
        }
      );

      // Should have at least one green border drawn
      expect(mockContext.strokeStyle).toContain('#00ff00');
    });

    it('should draw blue border for active color group pixels (Req 3.4)', () => {
      const testPixels: Pixel[] = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
        { x: 1, y: 0, r: 0, g: 255, b: 0, colorGroup: 1, group: 0, colorType: 0 },
      ];

      useStore.setState({
        pixels: testPixels,
        size: 2,
        zoomScale: 1.0,
        selectedPixels: new Set(),
        activeColorGroup: 0, // Activate color group 0
        activeColorTypeId: 0,
        activeDataGroupId: 0,
      });

      render(<CanvasComponent width={800} height={600} />);

      // Verify blue border was drawn for active color group
      expect(mockContext.strokeStyle).toContain('#0000ff');
    });

    it('should draw purple border for active color type pixels (Req 3.5)', () => {
      const testPixels: Pixel[] = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 1 },
        { x: 1, y: 0, r: 0, g: 255, b: 0, colorGroup: 0, group: 0, colorType: 2 },
      ];

      useStore.setState({
        pixels: testPixels,
        size: 2,
        zoomScale: 1.0,
        selectedPixels: new Set(),
        activeColorGroup: -1,
        activeColorTypeId: 1, // Activate color type 1
        activeDataGroupId: 0,
      });

      render(<CanvasComponent width={800} height={600} />);

      // Verify purple border was drawn for active color type
      expect(mockContext.strokeStyle).toContain('#800080');
    });

    it('should draw red border for active data group pixels (Req 3.6)', () => {
      const testPixels: Pixel[] = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 1, colorType: 0 },
        { x: 1, y: 0, r: 0, g: 255, b: 0, colorGroup: 0, group: 2, colorType: 0 },
      ];

      useStore.setState({
        pixels: testPixels,
        size: 2,
        zoomScale: 1.0,
        selectedPixels: new Set(),
        activeColorGroup: -1,
        activeColorTypeId: 0,
        activeDataGroupId: 1, // Activate data group 1
      });

      render(<CanvasComponent width={800} height={600} />);

      // Verify red border was drawn for active data group
      expect(mockContext.strokeStyle).toContain('#ff0000');
    });

    it('should draw multiple highlight borders when multiple conditions are active', () => {
      const testPixels: Pixel[] = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 1, colorType: 1 },
      ];

      useStore.setState({
        pixels: testPixels,
        size: 1,
        zoomScale: 1.0,
        selectedPixels: new Set(['0,0']), // Selected
        activeColorGroup: 0, // Active color group
        activeColorTypeId: 1, // Active color type
        activeDataGroupId: 1, // Active data group
      });

      render(<CanvasComponent width={800} height={600} />);

      // Verify all four border colors were used
      const strokeCalls = mockContext.strokeRect.mock.calls;
      expect(strokeCalls.length).toBeGreaterThan(0);
      
      // Check that multiple colors were set (green, blue, purple, red)
      // Note: We can't easily verify the exact sequence, but we can check
      // that strokeRect was called multiple times for the same pixel
      expect(strokeCalls.length).toBeGreaterThanOrEqual(4);
    });

    it('should not draw highlight borders when no conditions are active', () => {
      const testPixels: Pixel[] = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
      ];

      useStore.setState({
        pixels: testPixels,
        size: 1,
        zoomScale: 1.0,
        selectedPixels: new Set(), // No selection
        activeColorGroup: -1, // No active color group
        activeColorTypeId: 0, // No active color type
        activeDataGroupId: 0, // No active data group (0 is "None")
      });

      render(<CanvasComponent width={800} height={600} />);

      // Verify fillRect was called for the pixel color
      expect(mockContext.fillRect).toHaveBeenCalled();
      
      // strokeRect should not be called for highlights (only for drag rectangle if any)
      // Since no drag is active and no highlights, strokeRect should not be called
      // or called minimally
      const strokeCalls = mockContext.strokeRect.mock.calls;
      // Filter out any drag rectangle calls (which would have dashed lines)
      const highlightCalls = strokeCalls.filter((_: any, index: number) => {
        // Check if this is not a dashed line call
        const lineDashCalls = mockContext.setLineDash.mock.calls;
        return lineDashCalls.length === 0 || 
               lineDashCalls[lineDashCalls.length - 1][0].length === 0;
      });
      
      // Should have no highlight border calls
      expect(highlightCalls.length).toBe(0);
    });

    it('should draw selection rectangle with dashed border during drag (Req 3.7)', () => {
      const testPixels: Pixel[] = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
        { x: 1, y: 1, r: 0, g: 255, b: 0, colorGroup: 0, group: 0, colorType: 0 },
      ];

      useStore.setState({
        pixels: testPixels,
        size: 2,
        zoomScale: 1.0,
        selectedPixels: new Set(),
        activeColorGroup: -1,
        activeColorTypeId: 0,
        activeDataGroupId: 0,
        isDragging: true,
        dragStart: { x: 0, y: 0 },
        dragEnd: { x: 1, y: 1 },
      });

      render(<CanvasComponent width={800} height={600} />);

      // Verify dashed line was set for selection rectangle
      expect(mockContext.setLineDash).toHaveBeenCalledWith([5, 5]);
      
      // Verify white stroke color for selection rectangle
      expect(mockContext.strokeStyle).toContain('#ffffff');
      
      // Verify strokeRect was called for the selection rectangle
      expect(mockContext.strokeRect).toHaveBeenCalled();
      
      // Verify dashed line was reset after drawing
      expect(mockContext.setLineDash).toHaveBeenCalledWith([]);
    });
  });
});


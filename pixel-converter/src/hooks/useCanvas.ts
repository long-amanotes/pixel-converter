/**
 * useCanvas hook - Encapsulates canvas rendering logic and interaction
 * 
 * Requirements:
 * - 11.4: Use custom hooks for reusable logic (useCanvas, usePixelOperations, useUndo, etc.)
 * - 3.1: Render pixels at current zoom level with pixelated rendering
 * - 3.2: Update display scale from 10% to 200% when zoom slider is adjusted
 * - 3.7: Display selection rectangle with dashed border during drag
 * 
 * This hook encapsulates:
 * - Canvas rendering logic with zoom support
 * - Coordinate conversion between canvas and pixel space
 * - Mouse interaction handlers for drag selection
 * - Pixel highlighting based on active filters
 */

import { useCallback, useEffect, useRef } from 'react';
import { useStore } from '../store';
import type { Position } from '../types';

export interface UseCanvasOptions {
  width?: number;
  height?: number;
}

export interface UseCanvasReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  handleMouseDown: (event: React.MouseEvent) => void;
  handleMouseMove: (event: React.MouseEvent) => void;
  handleMouseUp: () => void;
}

/**
 * Custom hook for canvas rendering and interaction
 * 
 * @param options - Configuration options for canvas dimensions
 * @returns Canvas ref and mouse event handlers
 */
export const useCanvas = ({
  width = 800,
  height = 600,
}: UseCanvasOptions = {}): UseCanvasReturn => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Get state from store
  const pixels = useStore((state) => state.pixels);
  const size = useStore((state) => state.size);
  const zoomScale = useStore((state) => state.zoomScale);
  const selectedPixels = useStore((state) => state.selectedPixels);
  const activeColorGroup = useStore((state) => state.activeColorGroup);
  const activeColorTypeId = useStore((state) => state.activeColorTypeId);
  const activeDataGroupId = useStore((state) => state.activeDataGroupId);
  const isDragging = useStore((state) => state.isDragging);
  const dragStart = useStore((state) => state.dragStart);
  const dragEnd = useStore((state) => state.dragEnd);
  const editMode = useStore((state) => state.editMode);

  // Get actions from store
  const setDragState = useStore((state) => state.setDragState);
  const selectPixelsInRect = useStore((state) => state.selectPixelsInRect);
  const clearSelection = useStore((state) => state.clearSelection);
  const assignPixelsToDataGroup = useStore((state) => state.assignPixelsToDataGroup);
  const assignPixelsToColorType = useStore((state) => state.assignPixelsToColorType);
  const saveState = useStore((state) => state.saveState);

  /**
   * Calculate pixel size based on zoom scale
   * Requirement 3.2: Handle zoom calculations
   */
  const calculatePixelSize = useCallback((): number => {
    if (size === 0) return 0;
    return Math.floor((Math.min(width, height) / size) * zoomScale);
  }, [size, zoomScale, width, height]);

  /**
   * Convert canvas coordinates to pixel coordinates
   * 
   * @param canvasX - X coordinate in canvas space
   * @param canvasY - Y coordinate in canvas space
   * @returns Pixel coordinates (clamped to valid range)
   */
  const canvasToPixelCoords = useCallback(
    (canvasX: number, canvasY: number): Position | null => {
      if (size === 0) return null;

      const pixelSize = calculatePixelSize();
      if (pixelSize === 0) return null;

      const x = Math.floor(canvasX / pixelSize);
      const y = Math.floor(canvasY / pixelSize);

      // Clamp to valid pixel coordinates (allow dragging outside, but clamp to bounds)
      const clampedX = Math.max(0, Math.min(size - 1, x));
      const clampedY = Math.max(0, Math.min(size - 1, y));

      return { x: clampedX, y: clampedY };
    },
    [size, calculatePixelSize]
  );

  /**
   * Render the pixel art on the canvas
   * Requirements 3.1, 3.2, 3.7: Canvas rendering with zoom and selection
   */
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pixels.length || size === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate pixel size based on zoom (Req 3.2)
    const pixelSize = calculatePixelSize();
    if (pixelSize === 0) return;

    // Set canvas size
    const canvasWidth = size * pixelSize;
    const canvasHeight = size * pixelSize;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Disable image smoothing for pixelated rendering (Req 3.1)
    ctx.imageSmoothingEnabled = false;

    // Draw each pixel
    for (const pixel of pixels) {
      const x = pixel.x * pixelSize;
      const y = pixel.y * pixelSize;

      // Draw pixel color
      ctx.fillStyle = `rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`;
      ctx.fillRect(x, y, pixelSize, pixelSize);

      // Draw borders for highlighting
      const pixelKey = `${pixel.x},${pixel.y}`;

      // Green border for selected pixels (Req 3.3)
      if (selectedPixels.has(pixelKey)) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, pixelSize - 2, pixelSize - 2);
      }

      // Blue border for active color group (Req 3.4)
      if (activeColorGroup >= 0 && pixel.colorGroup === activeColorGroup) {
        ctx.strokeStyle = '#0000ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, pixelSize - 2, pixelSize - 2);
      }

      // Purple border for active color type (Req 3.5)
      if (activeColorTypeId > 0 && pixel.colorType === activeColorTypeId) {
        ctx.strokeStyle = '#800080';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, pixelSize - 2, pixelSize - 2);
      }

      // Red border for active data group (Req 3.6)
      if (activeDataGroupId > 0 && pixel.group === activeDataGroupId) {
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, pixelSize - 2, pixelSize - 2);
      }
    }

    // Draw selection rectangle during drag (Req 3.7)
    if (isDragging && dragStart && dragEnd) {
      const startX = dragStart.x * pixelSize;
      const startY = dragStart.y * pixelSize;
      const endX = dragEnd.x * pixelSize;
      const endY = dragEnd.y * pixelSize;

      const rectX = Math.min(startX, endX);
      const rectY = Math.min(startY, endY);
      const rectWidth = Math.abs(endX - startX) + pixelSize;
      const rectHeight = Math.abs(endY - startY) + pixelSize;

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
      ctx.setLineDash([]);
    }
  }, [
    pixels,
    size,
    zoomScale,
    selectedPixels,
    activeColorGroup,
    activeColorTypeId,
    activeDataGroupId,
    isDragging,
    dragStart,
    dragEnd,
    calculatePixelSize,
  ]);

  /**
   * Handle mouse down event - start drag selection
   * Requirement 3.7: Display selection rectangle with dashed border during drag
   */
  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas || !pixels.length) return;

      const rect = canvas.getBoundingClientRect();
      const canvasX = event.clientX - rect.left;
      const canvasY = event.clientY - rect.top;

      // Only start drag if clicking within canvas bounds
      if (canvasX < 0 || canvasY < 0 || canvasX >= canvas.width || canvasY >= canvas.height) {
        return;
      }

      const pixelCoords = canvasToPixelCoords(canvasX, canvasY);
      if (!pixelCoords) return;

      // Start dragging
      setDragState(true, pixelCoords, pixelCoords);
    },
    [canvasToPixelCoords, setDragState, pixels.length]
  );

  /**
   * Handle mouse move event - update drag selection
   * Requirement 3.7: Display selection rectangle with dashed border during drag
   */
  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!isDragging) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const canvasX = event.clientX - rect.left;
      const canvasY = event.clientY - rect.top;

      // Allow dragging outside canvas - coordinates will be clamped to image bounds
      const pixelCoords = canvasToPixelCoords(canvasX, canvasY);
      if (!pixelCoords) return;

      // Update drag end position
      setDragState(true, undefined, pixelCoords);
    },
    [isDragging, canvasToPixelCoords, setDragState]
  );

  /**
   * Handle mouse up event - complete drag selection and apply operation
   * Requirements 5.1, 5.2, 5.3, 5.4: Handle different edit modes
   */
  const handleMouseUp = useCallback(() => {
    if (!isDragging || !dragStart || !dragEnd) {
      setDragState(false, null, null);
      return;
    }

    // Save state for undo before making changes
    saveState();

    // Select pixels in the rectangle
    selectPixelsInRect(dragStart.x, dragStart.y, dragEnd.x, dragEnd.y);

    // Get the selected pixel keys
    const minX = Math.min(dragStart.x, dragEnd.x);
    const maxX = Math.max(dragStart.x, dragEnd.x);
    const minY = Math.min(dragStart.y, dragEnd.y);
    const maxY = Math.max(dragStart.y, dragEnd.y);

    const selectedKeys: string[] = [];
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        selectedKeys.push(`${x},${y}`);
      }
    }

    // Apply operation based on edit mode
    // Note: For paint and erase modes, we just select the pixels
    // The actual paint/erase operation is triggered by UI buttons
    // For group and colorType modes, we apply the assignment immediately
    if (editMode === 'group') {
      // Requirement 5.1: Assign pixels to data groups
      const currentActiveDataGroupId = useStore.getState().activeDataGroupId;
      assignPixelsToDataGroup(selectedKeys, currentActiveDataGroupId);
      clearSelection(); // Clear selection after applying
    } else if (editMode === 'colorType') {
      // Requirement 5.2: Assign pixels to color types
      const currentActiveColorTypeId = useStore.getState().activeColorTypeId;
      assignPixelsToColorType(selectedKeys, currentActiveColorTypeId);
      clearSelection(); // Clear selection after applying
    }
    // For paint and erase modes, keep the selection for the user to apply

    // End dragging
    setDragState(false, null, null);
  }, [
    isDragging,
    dragStart,
    dragEnd,
    editMode,
    setDragState,
    selectPixelsInRect,
    assignPixelsToDataGroup,
    assignPixelsToColorType,
    clearSelection,
    saveState,
  ]);

  // Re-render canvas when dependencies change
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  return {
    canvasRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};

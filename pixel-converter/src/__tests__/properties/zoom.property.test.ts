import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { useStore } from '../../store';

/**
 * Property-Based Tests for Zoom Controls
 * 
 * **Validates: Requirements 3.2**
 * 
 * Property 2: Zoom Value Clamping
 * For any zoom value input, the resulting zoom scale SHALL be clamped between 0.1 (10%) and 2.0 (200%).
 */

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 2.0;

describe('Property 2: Zoom Value Clamping', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useStore.setState({
      zoomScale: 1.0,
    });
  });

  /**
   * **Validates: Requirements 3.2**
   * 
   * Property: setZoomScale clamps values to [0.1, 2.0] range
   * For any input value, the resulting zoomScale SHALL be between MIN_ZOOM and MAX_ZOOM inclusive.
   */
  it('should clamp zoom values to valid range [0.1, 2.0]', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary numbers including edge cases
        fc.double({ min: -1000, max: 1000, noNaN: true }),
        (inputZoom) => {
          const setZoomScale = useStore.getState().setZoomScale;
          
          // Apply the zoom value
          setZoomScale(inputZoom);
          
          // Get the resulting zoom scale
          const resultZoom = useStore.getState().zoomScale;
          
          // Property: Result must be within valid range
          expect(resultZoom).toBeGreaterThanOrEqual(MIN_ZOOM);
          expect(resultZoom).toBeLessThanOrEqual(MAX_ZOOM);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 3.2**
   * 
   * Property: Values below minimum are clamped to MIN_ZOOM
   */
  it('should clamp values below minimum to 0.1', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -1000, max: MIN_ZOOM - 0.001, noNaN: true }),
        (inputZoom) => {
          const setZoomScale = useStore.getState().setZoomScale;
          
          setZoomScale(inputZoom);
          const resultZoom = useStore.getState().zoomScale;
          
          // Property: Values below minimum should be clamped to MIN_ZOOM
          expect(resultZoom).toBe(MIN_ZOOM);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 3.2**
   * 
   * Property: Values above maximum are clamped to MAX_ZOOM
   */
  it('should clamp values above maximum to 2.0', () => {
    fc.assert(
      fc.property(
        fc.double({ min: MAX_ZOOM + 0.001, max: 1000, noNaN: true }),
        (inputZoom) => {
          const setZoomScale = useStore.getState().setZoomScale;
          
          setZoomScale(inputZoom);
          const resultZoom = useStore.getState().zoomScale;
          
          // Property: Values above maximum should be clamped to MAX_ZOOM
          expect(resultZoom).toBe(MAX_ZOOM);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 3.2**
   * 
   * Property: Values within range are preserved
   */
  it('should preserve values within valid range', () => {
    fc.assert(
      fc.property(
        fc.double({ min: MIN_ZOOM, max: MAX_ZOOM, noNaN: true }),
        (inputZoom) => {
          const setZoomScale = useStore.getState().setZoomScale;
          
          setZoomScale(inputZoom);
          const resultZoom = useStore.getState().zoomScale;
          
          // Property: Valid values should be preserved
          // Use a small epsilon for floating point comparison
          expect(Math.abs(resultZoom - inputZoom)).toBeLessThan(0.0001);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 3.2**
   * 
   * Property: Boundary values are handled correctly
   */
  it('should handle exact boundary values correctly', () => {
    const setZoomScale = useStore.getState().setZoomScale;
    
    // Test minimum boundary
    setZoomScale(MIN_ZOOM);
    expect(useStore.getState().zoomScale).toBe(MIN_ZOOM);
    
    // Test maximum boundary
    setZoomScale(MAX_ZOOM);
    expect(useStore.getState().zoomScale).toBe(MAX_ZOOM);
    
    // Test midpoint
    setZoomScale(1.0);
    expect(useStore.getState().zoomScale).toBe(1.0);
  });

  /**
   * **Validates: Requirements 3.2**
   * 
   * Property: Zoom clamping is idempotent
   * Applying the same zoom value multiple times should produce the same result
   */
  it('should be idempotent - applying same value multiple times produces same result', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -100, max: 100, noNaN: true }),
        (inputZoom) => {
          const setZoomScale = useStore.getState().setZoomScale;
          
          // Apply zoom value twice
          setZoomScale(inputZoom);
          const firstResult = useStore.getState().zoomScale;
          
          setZoomScale(inputZoom);
          const secondResult = useStore.getState().zoomScale;
          
          // Property: Results should be identical
          expect(secondResult).toBe(firstResult);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 3.2**
   * 
   * Property: Zoom clamping handles edge cases
   */
  it('should handle special edge cases', () => {
    const setZoomScale = useStore.getState().setZoomScale;
    
    // Test zero
    setZoomScale(0);
    expect(useStore.getState().zoomScale).toBe(MIN_ZOOM);
    
    // Test negative values
    setZoomScale(-1);
    expect(useStore.getState().zoomScale).toBe(MIN_ZOOM);
    
    // Test very large values
    setZoomScale(1000);
    expect(useStore.getState().zoomScale).toBe(MAX_ZOOM);
    
    // Test very small positive values
    setZoomScale(0.01);
    expect(useStore.getState().zoomScale).toBe(MIN_ZOOM);
  });
});

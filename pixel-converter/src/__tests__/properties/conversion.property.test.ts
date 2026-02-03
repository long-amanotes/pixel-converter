import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { blockMajorityConvert, nearestNeighborConvert, ALPHA_CUTOFF } from '../../utils/imageConverter';

/**
 * Property-Based Tests for Image Conversion
 * 
 * **Validates: Requirements 2.4, 2.7**
 * 
 * Property 1: Image Conversion Dimension Correctness
 * For any valid image and target size between 8 and 256, converting the image SHALL
 * produce a pixel array where all pixels have coordinates within [0, size-1].
 */

/**
 * Mock ImageData class for Node.js environment
 * ImageData has:
 * - width: number
 * - height: number
 * - data: Uint8ClampedArray (RGBA values, 4 bytes per pixel)
 */
class MockImageData implements ImageData {
  readonly width: number;
  readonly height: number;
  readonly data: Uint8ClampedArray;
  readonly colorSpace: PredefinedColorSpace = 'srgb';

  constructor(width: number, height: number, data?: Uint8ClampedArray) {
    this.width = width;
    this.height = height;
    if (data) {
      this.data = data;
    } else {
      this.data = new Uint8ClampedArray(width * height * 4);
    }
  }
}

// Arbitrary generators

/**
 * Generate a valid target size between 8 and 64 (reduced for test performance)
 */
const arbitraryTargetSize = (): fc.Arbitrary<number> =>
  fc.integer({ min: 8, max: 64 });

/**
 * Generate valid image dimensions (at least 1x1, up to 64x64 for reasonable test performance)
 */
const arbitraryImageDimensions = (): fc.Arbitrary<{ width: number; height: number }> =>
  fc.record({
    width: fc.integer({ min: 1, max: 64 }),
    height: fc.integer({ min: 1, max: 64 }),
  });

/**
 * Generate a single RGBA pixel value (4 bytes)
 */
const arbitraryRgbaPixel = (): fc.Arbitrary<[number, number, number, number]> =>
  fc.tuple(
    fc.integer({ min: 0, max: 255 }), // R
    fc.integer({ min: 0, max: 255 }), // G
    fc.integer({ min: 0, max: 255 }), // B
    fc.integer({ min: 0, max: 255 })  // A
  );

/**
 * Generate a mock ImageData with random dimensions and pixel values
 */
const arbitraryImageData = (): fc.Arbitrary<MockImageData> =>
  arbitraryImageDimensions().chain(({ width, height }) => {
    const pixelCount = width * height;
    return fc.array(arbitraryRgbaPixel(), { minLength: pixelCount, maxLength: pixelCount }).map(
      (pixels) => {
        const data = new Uint8ClampedArray(pixelCount * 4);
        pixels.forEach(([r, g, b, a], i) => {
          data[i * 4] = r;
          data[i * 4 + 1] = g;
          data[i * 4 + 2] = b;
          data[i * 4 + 3] = a;
        });
        return new MockImageData(width, height, data);
      }
    );
  });

/**
 * Generate a mock ImageData with at least some opaque pixels to ensure non-empty output
 */
const arbitraryImageDataWithOpaquePixels = (): fc.Arbitrary<MockImageData> =>
  arbitraryImageDimensions().chain(({ width, height }) => {
    const pixelCount = width * height;
    // Generate pixels with alpha >= ALPHA_CUTOFF to ensure they're not transparent
    return fc.array(
      fc.tuple(
        fc.integer({ min: 0, max: 255 }), // R
        fc.integer({ min: 0, max: 255 }), // G
        fc.integer({ min: 0, max: 255 }), // B
        fc.integer({ min: ALPHA_CUTOFF, max: 255 }) // A (opaque)
      ),
      { minLength: pixelCount, maxLength: pixelCount }
    ).map((pixels) => {
      const data = new Uint8ClampedArray(pixelCount * 4);
      pixels.forEach(([r, g, b, a], i) => {
        data[i * 4] = r;
        data[i * 4 + 1] = g;
        data[i * 4 + 2] = b;
        data[i * 4 + 3] = a;
      });
      return new MockImageData(width, height, data);
    });
  });

describe('Property 1: Image Conversion Dimension Correctness', () => {
  /**
   * **Validates: Requirements 2.4, 2.7**
   * 
   * Property: blockMajorityConvert produces pixels within valid bounds
   * For any valid image and target size between 8 and 256, all output pixels
   * SHALL have x and y coordinates within [0, targetSize-1].
   */
  describe('blockMajorityConvert produces pixels within valid bounds', () => {
    it('should produce pixels with x coordinates within [0, targetSize-1]', () => {
      fc.assert(
        fc.property(arbitraryImageData(), arbitraryTargetSize(), (imageData, targetSize) => {
          const pixels = blockMajorityConvert(imageData, targetSize);
          
          for (const pixel of pixels) {
            expect(pixel.x).toBeGreaterThanOrEqual(0);
            expect(pixel.x).toBeLessThan(targetSize);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('should produce pixels with y coordinates within [0, targetSize-1]', () => {
      fc.assert(
        fc.property(arbitraryImageData(), arbitraryTargetSize(), (imageData, targetSize) => {
          const pixels = blockMajorityConvert(imageData, targetSize);
          
          for (const pixel of pixels) {
            expect(pixel.y).toBeGreaterThanOrEqual(0);
            expect(pixel.y).toBeLessThan(targetSize);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('should produce pixels with both x and y as integers', () => {
      fc.assert(
        fc.property(arbitraryImageData(), arbitraryTargetSize(), (imageData, targetSize) => {
          const pixels = blockMajorityConvert(imageData, targetSize);
          
          for (const pixel of pixels) {
            expect(Number.isInteger(pixel.x)).toBe(true);
            expect(Number.isInteger(pixel.y)).toBe(true);
          }
        }),
        { numRuns: 20 }
      );
    });
  });

  /**
   * **Validates: Requirements 2.4, 2.7**
   * 
   * Property: nearestNeighborConvert produces pixels within valid bounds
   * For any valid image and target size between 8 and 256, all output pixels
   * SHALL have x and y coordinates within [0, targetSize-1].
   */
  describe('nearestNeighborConvert produces pixels within valid bounds', () => {
    it('should produce pixels with x coordinates within [0, targetSize-1]', () => {
      fc.assert(
        fc.property(arbitraryImageData(), arbitraryTargetSize(), (imageData, targetSize) => {
          const pixels = nearestNeighborConvert(imageData, targetSize);
          
          for (const pixel of pixels) {
            expect(pixel.x).toBeGreaterThanOrEqual(0);
            expect(pixel.x).toBeLessThan(targetSize);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('should produce pixels with y coordinates within [0, targetSize-1]', () => {
      fc.assert(
        fc.property(arbitraryImageData(), arbitraryTargetSize(), (imageData, targetSize) => {
          const pixels = nearestNeighborConvert(imageData, targetSize);
          
          for (const pixel of pixels) {
            expect(pixel.y).toBeGreaterThanOrEqual(0);
            expect(pixel.y).toBeLessThan(targetSize);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('should produce pixels with both x and y as integers', () => {
      fc.assert(
        fc.property(arbitraryImageData(), arbitraryTargetSize(), (imageData, targetSize) => {
          const pixels = nearestNeighborConvert(imageData, targetSize);
          
          for (const pixel of pixels) {
            expect(Number.isInteger(pixel.x)).toBe(true);
            expect(Number.isInteger(pixel.y)).toBe(true);
          }
        }),
        { numRuns: 20 }
      );
    });
  });

  /**
   * **Validates: Requirements 2.4, 2.7**
   * 
   * Property: Both conversion methods produce unique pixel positions
   * For any valid image, no two output pixels SHALL have the same (x, y) coordinates.
   */
  describe('Both conversion methods produce unique pixel positions', () => {
    it('blockMajorityConvert should not produce duplicate pixel positions', () => {
      fc.assert(
        fc.property(arbitraryImageData(), arbitraryTargetSize(), (imageData, targetSize) => {
          const pixels = blockMajorityConvert(imageData, targetSize);
          
          const positions = new Set<string>();
          for (const pixel of pixels) {
            const key = `${pixel.x},${pixel.y}`;
            expect(positions.has(key)).toBe(false);
            positions.add(key);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('nearestNeighborConvert should not produce duplicate pixel positions', () => {
      fc.assert(
        fc.property(arbitraryImageData(), arbitraryTargetSize(), (imageData, targetSize) => {
          const pixels = nearestNeighborConvert(imageData, targetSize);
          
          const positions = new Set<string>();
          for (const pixel of pixels) {
            const key = `${pixel.x},${pixel.y}`;
            expect(positions.has(key)).toBe(false);
            positions.add(key);
          }
        }),
        { numRuns: 20 }
      );
    });
  });

  /**
   * **Validates: Requirements 2.4, 2.7**
   * 
   * Property: Conversion produces valid RGB values
   * For any valid image, all output pixels SHALL have RGB values within [0, 255].
   */
  describe('Conversion produces valid RGB values', () => {
    it('blockMajorityConvert should produce pixels with valid RGB values', () => {
      fc.assert(
        fc.property(arbitraryImageDataWithOpaquePixels(), arbitraryTargetSize(), (imageData, targetSize) => {
          const pixels = blockMajorityConvert(imageData, targetSize);
          
          for (const pixel of pixels) {
            expect(pixel.r).toBeGreaterThanOrEqual(0);
            expect(pixel.r).toBeLessThanOrEqual(255);
            expect(pixel.g).toBeGreaterThanOrEqual(0);
            expect(pixel.g).toBeLessThanOrEqual(255);
            expect(pixel.b).toBeGreaterThanOrEqual(0);
            expect(pixel.b).toBeLessThanOrEqual(255);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('nearestNeighborConvert should produce pixels with valid RGB values', () => {
      fc.assert(
        fc.property(arbitraryImageDataWithOpaquePixels(), arbitraryTargetSize(), (imageData, targetSize) => {
          const pixels = nearestNeighborConvert(imageData, targetSize);
          
          for (const pixel of pixels) {
            expect(pixel.r).toBeGreaterThanOrEqual(0);
            expect(pixel.r).toBeLessThanOrEqual(255);
            expect(pixel.g).toBeGreaterThanOrEqual(0);
            expect(pixel.g).toBeLessThanOrEqual(255);
            expect(pixel.b).toBeGreaterThanOrEqual(0);
            expect(pixel.b).toBeLessThanOrEqual(255);
          }
        }),
        { numRuns: 20 }
      );
    });
  });
});

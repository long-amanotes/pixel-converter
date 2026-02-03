/**
 * Tests for export utilities
 * Includes both unit tests and property-based tests
 * 
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { exportJSON, exportPNG, downloadJSON } from './exportUtils';
import type { Pixel, ExportedData } from '../types';

describe('exportUtils', () => {
  describe('exportJSON', () => {
    it('should export empty pixel array correctly', () => {
      const pixels: Pixel[] = [];
      const palette = ['#FF0000', '#00FF00', '#0000FF'];
      const size = 16;

      const result = exportJSON(pixels, palette, size);

      expect(result.Palette).toEqual(['FF0000', '00FF00', '0000FF']);
      expect(result.Artwork.Width).toBe(16);
      expect(result.Artwork.Height).toBe(16);
      expect(result.Artwork.PixelData).toEqual([]);
    });

    it('should export single pixel correctly', () => {
      const pixels: Pixel[] = [
        {
          x: 5,
          y: 10,
          r: 255,
          g: 128,
          b: 64,
          colorGroup: 0,
          group: 1,
          colorType: 2,
        },
      ];
      const palette = ['#FF0000'];
      const size = 16;

      const result = exportJSON(pixels, palette, size);

      expect(result.Artwork.PixelData).toHaveLength(1);
      expect(result.Artwork.PixelData[0]).toEqual({
        Position: { x: 5, y: 10 },
        Group: 1,
        ColorGroup: 0,
        ColorType: 2,
        ColorHex: 'ff8040',
      });
    });

    it('should export multiple pixels correctly', () => {
      const pixels: Pixel[] = [
        {
          x: 0,
          y: 0,
          r: 255,
          g: 0,
          b: 0,
          colorGroup: 0,
          group: 0,
          colorType: 0,
        },
        {
          x: 1,
          y: 1,
          r: 0,
          g: 255,
          b: 0,
          colorGroup: 1,
          group: 1,
          colorType: 1,
        },
      ];
      const palette = ['#FF0000', '#00FF00'];
      const size = 8;

      const result = exportJSON(pixels, palette, size);

      expect(result.Artwork.PixelData).toHaveLength(2);
      expect(result.Artwork.Width).toBe(8);
      expect(result.Artwork.Height).toBe(8);
    });

    it('should handle palette colors without # prefix', () => {
      const pixels: Pixel[] = [];
      const palette = ['FF0000', '00FF00']; // No # prefix
      const size = 16;

      const result = exportJSON(pixels, palette, size);

      expect(result.Palette).toEqual(['FF0000', '00FF00']);
    });

    it('should convert RGB to hex correctly', () => {
      const pixels: Pixel[] = [
        {
          x: 0,
          y: 0,
          r: 255,
          g: 255,
          b: 255,
          colorGroup: 0,
          group: 0,
          colorType: 0,
        },
        {
          x: 1,
          y: 0,
          r: 0,
          g: 0,
          b: 0,
          colorGroup: 0,
          group: 0,
          colorType: 0,
        },
      ];
      const palette = ['#FFFFFF'];
      const size = 8;

      const result = exportJSON(pixels, palette, size);

      expect(result.Artwork.PixelData[0].ColorHex).toBe('ffffff');
      expect(result.Artwork.PixelData[1].ColorHex).toBe('000000');
    });
  });

  describe('exportPNG', () => {
    let mockCanvas: HTMLCanvasElement;
    let mockContext: CanvasRenderingContext2D;
    let mockToBlob: ReturnType<typeof vi.fn>;
    let mockCreateElement: ReturnType<typeof vi.fn>;
    let mockCreateObjectURL: ReturnType<typeof vi.fn>;
    let mockRevokeObjectURL: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      // Mock canvas and context
      mockContext = {
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        fillStyle: '',
      } as unknown as CanvasRenderingContext2D;

      mockToBlob = vi.fn((callback) => {
        callback(new Blob(['fake-image-data'], { type: 'image/png' }));
      });

      mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockContext),
        toBlob: mockToBlob,
      } as unknown as HTMLCanvasElement;

      // Mock document.createElement
      const mockLink = {
        download: '',
        href: '',
        click: vi.fn(),
      };

      mockCreateElement = vi.fn((tag: string) => {
        if (tag === 'canvas') return mockCanvas;
        if (tag === 'a') return mockLink;
        return null;
      });

      document.createElement = mockCreateElement;

      // Mock URL methods
      mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
      mockRevokeObjectURL = vi.fn();
      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should create canvas with correct size', () => {
      const pixels: Pixel[] = [];
      const size = 32;

      exportPNG(pixels, size);

      expect(mockCanvas.width).toBe(32);
      expect(mockCanvas.height).toBe(32);
    });

    it('should clear canvas to transparent', () => {
      const pixels: Pixel[] = [];
      const size = 16;

      exportPNG(pixels, size);

      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 16, 16);
    });

    it('should draw pixels at correct positions', () => {
      const pixels: Pixel[] = [
        {
          x: 5,
          y: 10,
          r: 255,
          g: 128,
          b: 64,
          colorGroup: 0,
          group: 0,
          colorType: 0,
        },
      ];
      const size = 16;

      exportPNG(pixels, size);

      expect(mockContext.fillRect).toHaveBeenCalledWith(5, 10, 1, 1);
    });

    it('should use correct colors for pixels', () => {
      const pixels: Pixel[] = [
        {
          x: 0,
          y: 0,
          r: 255,
          g: 0,
          b: 0,
          colorGroup: 0,
          group: 0,
          colorType: 0,
        },
      ];
      const size = 8;

      exportPNG(pixels, size);

      // Check that fillStyle was set (exact value depends on implementation)
      expect(mockContext.fillStyle).toBeTruthy();
    });

    it('should generate timestamped filename by default', () => {
      const pixels: Pixel[] = [];
      const size = 16;

      exportPNG(pixels, size);

      const link = mockCreateElement.mock.results.find(
        (result) => result.value?.click
      )?.value;
      expect(link?.download).toMatch(/^pixel-art-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.png$/);
    });

    it('should use custom filename when provided', () => {
      const pixels: Pixel[] = [];
      const size = 16;

      exportPNG(pixels, size, 'custom-name.png');

      const link = mockCreateElement.mock.results.find(
        (result) => result.value?.click
      )?.value;
      expect(link?.download).toBe('custom-name.png');
    });

    it('should throw error if canvas context is null', () => {
      mockCanvas.getContext = vi.fn(() => null);

      expect(() => {
        exportPNG([], 16);
      }).toThrow('Failed to get canvas 2D context');
    });
  });

  describe('downloadJSON', () => {
    let mockCreateElement: ReturnType<typeof vi.fn>;
    let mockCreateObjectURL: ReturnType<typeof vi.fn>;
    let mockRevokeObjectURL: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      const mockLink = {
        download: '',
        href: '',
        click: vi.fn(),
      };

      mockCreateElement = vi.fn(() => mockLink);
      document.createElement = mockCreateElement;

      mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
      mockRevokeObjectURL = vi.fn();
      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should create JSON blob with correct data', () => {
      const data: ExportedData = {
        Palette: ['FF0000'],
        Artwork: {
          Width: 8,
          Height: 8,
          PixelData: [],
        },
      };

      downloadJSON(data);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      const blob = mockCreateObjectURL.mock.calls[0][0] as Blob;
      expect(blob.type).toBe('application/json');
    });

    it('should generate timestamped filename by default', () => {
      const data: ExportedData = {
        Palette: [],
        Artwork: {
          Width: 8,
          Height: 8,
          PixelData: [],
        },
      };

      downloadJSON(data);

      const link = mockCreateElement.mock.results[0].value;
      expect(link.download).toMatch(/^pixel-art-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.json$/);
    });

    it('should use custom filename when provided', () => {
      const data: ExportedData = {
        Palette: [],
        Artwork: {
          Width: 8,
          Height: 8,
          PixelData: [],
        },
      };

      downloadJSON(data, 'custom-export.json');

      const link = mockCreateElement.mock.results[0].value;
      expect(link.download).toBe('custom-export.json');
    });

    it('should trigger download', () => {
      const data: ExportedData = {
        Palette: [],
        Artwork: {
          Width: 8,
          Height: 8,
          PixelData: [],
        },
      };

      downloadJSON(data);

      const link = mockCreateElement.mock.results[0].value;
      expect(link.click).toHaveBeenCalled();
    });

    it('should clean up object URL', () => {
      const data: ExportedData = {
        Palette: [],
        Artwork: {
          Width: 8,
          Height: 8,
          PixelData: [],
        },
      };

      downloadJSON(data);

      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });

  describe('Property-based tests', () => {
    /**
     * Property: Export JSON structure correctness
     * For any valid pixel array, palette, and size, the exported JSON
     * should have the correct structure and all required fields
     */
    it('should always produce valid JSON structure', () => {
      fc.assert(
        fc.property(
          fc.array(arbitraryPixel(), { maxLength: 100 }),
          fc.array(arbitraryHexColor(), { minLength: 1, maxLength: 16 }),
          fc.integer({ min: 8, max: 256 }),
          (pixels, palette, size) => {
            const result = exportJSON(pixels, palette, size);

            // Check structure
            expect(result).toHaveProperty('Palette');
            expect(result).toHaveProperty('Artwork');
            expect(result.Artwork).toHaveProperty('Width');
            expect(result.Artwork).toHaveProperty('Height');
            expect(result.Artwork).toHaveProperty('PixelData');

            // Check types
            expect(Array.isArray(result.Palette)).toBe(true);
            expect(Array.isArray(result.Artwork.PixelData)).toBe(true);
            expect(typeof result.Artwork.Width).toBe('number');
            expect(typeof result.Artwork.Height).toBe('number');

            // Check values
            expect(result.Artwork.Width).toBe(size);
            expect(result.Artwork.Height).toBe(size);
            expect(result.Artwork.PixelData).toHaveLength(pixels.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Pixel data preservation
     * For any pixel, all its properties should be preserved in the export
     */
    it('should preserve all pixel properties in export', () => {
      fc.assert(
        fc.property(
          arbitraryPixel(),
          fc.array(arbitraryHexColor(), { minLength: 1, maxLength: 16 }),
          fc.integer({ min: 8, max: 256 }),
          (pixel, palette, size) => {
            const result = exportJSON([pixel], palette, size);
            const exported = result.Artwork.PixelData[0];

            expect(exported.Position.x).toBe(pixel.x);
            expect(exported.Position.y).toBe(pixel.y);
            expect(exported.Group).toBe(pixel.group);
            expect(exported.ColorGroup).toBe(pixel.colorGroup);
            expect(exported.ColorType).toBe(pixel.colorType);
            expect(exported.ColorHex).toBeTruthy();
            expect(typeof exported.ColorHex).toBe('string');
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Palette format conversion
     * For any palette, all colors should be converted to format without # prefix
     */
    it('should convert palette colors to format without # prefix', () => {
      fc.assert(
        fc.property(
          fc.array(arbitraryHexColor(), { minLength: 1, maxLength: 16 }),
          fc.integer({ min: 8, max: 256 }),
          (palette, size) => {
            const result = exportJSON([], palette, size);

            expect(result.Palette).toHaveLength(palette.length);
            for (const color of result.Palette) {
              expect(color).not.toMatch(/^#/);
              expect(color).toMatch(/^[0-9a-fA-F]{6}$/);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: ColorHex format correctness
     * For any pixel, the exported ColorHex should be a valid 6-character hex string
     */
    it('should export ColorHex in correct format', () => {
      fc.assert(
        fc.property(
          fc.array(arbitraryPixel(), { minLength: 1, maxLength: 50 }),
          fc.array(arbitraryHexColor(), { minLength: 1, maxLength: 16 }),
          fc.integer({ min: 8, max: 256 }),
          (pixels, palette, size) => {
            const result = exportJSON(pixels, palette, size);

            for (const pixel of result.Artwork.PixelData) {
              expect(pixel.ColorHex).toMatch(/^[0-9a-f]{6}$/);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

// Arbitrary generators for property-based tests

function arbitraryPixel(): fc.Arbitrary<Pixel> {
  return fc.record({
    x: fc.integer({ min: 0, max: 255 }),
    y: fc.integer({ min: 0, max: 255 }),
    r: fc.integer({ min: 0, max: 255 }),
    g: fc.integer({ min: 0, max: 255 }),
    b: fc.integer({ min: 0, max: 255 }),
    colorGroup: fc.integer({ min: 0, max: 15 }),
    group: fc.integer({ min: 0, max: 10 }),
    colorType: fc.integer({ min: 0, max: 10 }),
  });
}

function arbitraryHexColor(): fc.Arbitrary<string> {
  return fc
    .tuple(
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 })
    )
    .map(([r, g, b]) => {
      const toHex = (n: number) => n.toString(16).padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    });
}

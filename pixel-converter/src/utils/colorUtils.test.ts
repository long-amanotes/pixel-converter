import { describe, it, expect } from 'vitest';
import { hexToRgb, rgbToHex, colorDistance, findNearestPaletteColor } from './colorUtils';

describe('colorUtils', () => {
  describe('hexToRgb', () => {
    it('should convert white correctly', () => {
      expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should convert black correctly', () => {
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should convert red correctly', () => {
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should convert green correctly', () => {
      expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('should convert blue correctly', () => {
      expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('should handle lowercase hex', () => {
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should handle hex without # prefix', () => {
      expect(hexToRgb('FF0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should handle mixed case hex', () => {
      expect(hexToRgb('#FfAa00')).toEqual({ r: 255, g: 170, b: 0 });
    });

    it('should convert arbitrary color correctly', () => {
      expect(hexToRgb('#1A2B3C')).toEqual({ r: 26, g: 43, b: 60 });
    });
  });

  describe('rgbToHex', () => {
    it('should convert white to hex', () => {
      expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
    });

    it('should convert black to hex', () => {
      expect(rgbToHex(0, 0, 0)).toBe('#000000');
    });

    it('should convert red to hex', () => {
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
    });

    it('should convert green to hex', () => {
      expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
    });

    it('should convert blue to hex', () => {
      expect(rgbToHex(0, 0, 255)).toBe('#0000ff');
    });

    it('should convert arbitrary color to hex', () => {
      expect(rgbToHex(255, 0, 128)).toBe('#ff0080');
    });

    it('should pad single digit hex values with zero', () => {
      expect(rgbToHex(1, 2, 3)).toBe('#010203');
    });

    it('should clamp values above 255', () => {
      expect(rgbToHex(300, 256, 260)).toBe('#ffffff');
    });

    it('should clamp values below 0', () => {
      expect(rgbToHex(-10, -5, -1)).toBe('#000000');
    });

    it('should round floating point values', () => {
      expect(rgbToHex(127.4, 127.6, 128.5)).toBe('#7f8081');
    });
  });

  describe('colorDistance', () => {
    it('should return 0 for identical colors', () => {
      const color = { r: 100, g: 150, b: 200 };
      expect(colorDistance(color, color)).toBe(0);
    });

    it('should calculate Euclidean distance squared correctly', () => {
      const c1 = { r: 0, g: 0, b: 0 };
      const c2 = { r: 3, g: 4, b: 0 };
      // 3² + 4² + 0² = 9 + 16 + 0 = 25
      expect(colorDistance(c1, c2)).toBe(25);
    });

    it('should calculate distance for all components', () => {
      const c1 = { r: 0, g: 0, b: 0 };
      const c2 = { r: 1, g: 2, b: 3 };
      // 1² + 2² + 3² = 1 + 4 + 9 = 14
      expect(colorDistance(c1, c2)).toBe(14);
    });

    it('should be symmetric', () => {
      const c1 = { r: 100, g: 50, b: 200 };
      const c2 = { r: 150, g: 100, b: 150 };
      expect(colorDistance(c1, c2)).toBe(colorDistance(c2, c1));
    });

    it('should calculate maximum distance between black and white', () => {
      const black = { r: 0, g: 0, b: 0 };
      const white = { r: 255, g: 255, b: 255 };
      // 255² + 255² + 255² = 65025 * 3 = 195075
      expect(colorDistance(black, white)).toBe(195075);
    });

    it('should handle negative differences correctly', () => {
      const c1 = { r: 200, g: 200, b: 200 };
      const c2 = { r: 100, g: 100, b: 100 };
      // (-100)² + (-100)² + (-100)² = 10000 * 3 = 30000
      expect(colorDistance(c1, c2)).toBe(30000);
    });
  });

  describe('findNearestPaletteColor', () => {
    it('should return -1 for empty palette', () => {
      const color = { r: 100, g: 100, b: 100 };
      expect(findNearestPaletteColor(color, [])).toBe(-1);
    });

    it('should return 0 for single color palette', () => {
      const color = { r: 100, g: 100, b: 100 };
      expect(findNearestPaletteColor(color, ['#FF0000'])).toBe(0);
    });

    it('should find exact match', () => {
      const color = { r: 255, g: 0, b: 0 };
      const palette = ['#00FF00', '#FF0000', '#0000FF'];
      expect(findNearestPaletteColor(color, palette)).toBe(1);
    });

    it('should find nearest color when no exact match', () => {
      const color = { r: 250, g: 5, b: 5 }; // Close to red
      const palette = ['#00FF00', '#FF0000', '#0000FF'];
      expect(findNearestPaletteColor(color, palette)).toBe(1); // Red is nearest
    });

    it('should find nearest color in grayscale palette', () => {
      const color = { r: 100, g: 100, b: 100 };
      const palette = ['#000000', '#808080', '#FFFFFF']; // Black, Gray, White
      expect(findNearestPaletteColor(color, palette)).toBe(1); // Gray (128,128,128) is nearest
    });

    it('should handle palette without # prefix', () => {
      const color = { r: 255, g: 0, b: 0 };
      const palette = ['00FF00', 'FF0000', '0000FF'];
      expect(findNearestPaletteColor(color, palette)).toBe(1);
    });
  });
});

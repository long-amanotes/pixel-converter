/**
 * Unit tests for import utilities
 */

import { describe, it, expect } from 'vitest';
import {
  importJSON,
  validateImportData,
  ImportValidationError,
} from './importUtils';
import type { ExportedData } from '../types';

describe('importUtils', () => {
  describe('validateImportData', () => {
    it('should accept valid exported data', () => {
      const validData: ExportedData = {
        Palette: ['FF0000', '00FF00', '0000FF'],
        Artwork: {
          Width: 8,
          Height: 8,
          PixelData: [
            {
              Position: { x: 0, y: 0 },
              Group: 0,
              ColorGroup: 0,
              ColorType: 0,
              ColorHex: 'FF0000',
            },
          ],
        },
      };

      expect(() => validateImportData(validData)).not.toThrow();
    });

    it('should reject null data', () => {
      expect(() => validateImportData(null)).toThrow(ImportValidationError);
      expect(() => validateImportData(null)).toThrow(
        'Import data must be an object'
      );
    });

    it('should reject data without Palette', () => {
      const invalidData = {
        Artwork: {
          Width: 8,
          Height: 8,
          PixelData: [],
        },
      };

      expect(() => validateImportData(invalidData)).toThrow(
        ImportValidationError
      );
      expect(() => validateImportData(invalidData)).toThrow(
        'Missing or invalid "Palette" field'
      );
    });

    it('should reject data with non-string palette colors', () => {
      const invalidData = {
        Palette: ['FF0000', 123, '0000FF'],
        Artwork: {
          Width: 8,
          Height: 8,
          PixelData: [],
        },
      };

      expect(() => validateImportData(invalidData)).toThrow(
        ImportValidationError
      );
      expect(() => validateImportData(invalidData)).toThrow(
        'Palette color at index 1 must be a string'
      );
    });

    it('should reject data without Artwork', () => {
      const invalidData = {
        Palette: ['FF0000'],
      };

      expect(() => validateImportData(invalidData)).toThrow(
        ImportValidationError
      );
      expect(() => validateImportData(invalidData)).toThrow(
        'Missing or invalid "Artwork" field'
      );
    });

    it('should reject data with invalid Width', () => {
      const invalidData = {
        Palette: ['FF0000'],
        Artwork: {
          Width: 'invalid',
          Height: 8,
          PixelData: [],
        },
      };

      expect(() => validateImportData(invalidData)).toThrow(
        ImportValidationError
      );
      expect(() => validateImportData(invalidData)).toThrow(
        'Artwork.Width must be a positive number'
      );
    });

    it('should reject data with invalid Height', () => {
      const invalidData = {
        Palette: ['FF0000'],
        Artwork: {
          Width: 8,
          Height: -5,
          PixelData: [],
        },
      };

      expect(() => validateImportData(invalidData)).toThrow(
        ImportValidationError
      );
      expect(() => validateImportData(invalidData)).toThrow(
        'Artwork.Height must be a positive number'
      );
    });

    it('should reject data with non-array PixelData', () => {
      const invalidData = {
        Palette: ['FF0000'],
        Artwork: {
          Width: 8,
          Height: 8,
          PixelData: 'not an array',
        },
      };

      expect(() => validateImportData(invalidData)).toThrow(
        ImportValidationError
      );
      expect(() => validateImportData(invalidData)).toThrow(
        'Artwork.PixelData must be an array'
      );
    });

    it('should reject pixel with missing Position', () => {
      const invalidData = {
        Palette: ['FF0000'],
        Artwork: {
          Width: 8,
          Height: 8,
          PixelData: [
            {
              Group: 0,
              ColorGroup: 0,
              ColorType: 0,
              ColorHex: 'FF0000',
            },
          ],
        },
      };

      expect(() => validateImportData(invalidData)).toThrow(
        ImportValidationError
      );
      expect(() => validateImportData(invalidData)).toThrow(
        'Pixel at index 0 missing or invalid Position'
      );
    });

    it('should reject pixel with invalid Position coordinates', () => {
      const invalidData = {
        Palette: ['FF0000'],
        Artwork: {
          Width: 8,
          Height: 8,
          PixelData: [
            {
              Position: { x: 'invalid', y: 0 },
              Group: 0,
              ColorGroup: 0,
              ColorType: 0,
              ColorHex: 'FF0000',
            },
          ],
        },
      };

      expect(() => validateImportData(invalidData)).toThrow(
        ImportValidationError
      );
      expect(() => validateImportData(invalidData)).toThrow(
        'Pixel at index 0 Position must have numeric x and y'
      );
    });

    it('should reject pixel with missing Group', () => {
      const invalidData = {
        Palette: ['FF0000'],
        Artwork: {
          Width: 8,
          Height: 8,
          PixelData: [
            {
              Position: { x: 0, y: 0 },
              ColorGroup: 0,
              ColorType: 0,
              ColorHex: 'FF0000',
            },
          ],
        },
      };

      expect(() => validateImportData(invalidData)).toThrow(
        ImportValidationError
      );
      expect(() => validateImportData(invalidData)).toThrow(
        'Pixel at index 0 Group must be a number'
      );
    });

    it('should reject pixel with missing ColorGroup', () => {
      const invalidData = {
        Palette: ['FF0000'],
        Artwork: {
          Width: 8,
          Height: 8,
          PixelData: [
            {
              Position: { x: 0, y: 0 },
              Group: 0,
              ColorType: 0,
              ColorHex: 'FF0000',
            },
          ],
        },
      };

      expect(() => validateImportData(invalidData)).toThrow(
        ImportValidationError
      );
      expect(() => validateImportData(invalidData)).toThrow(
        'Pixel at index 0 ColorGroup must be a number'
      );
    });

    it('should reject pixel with missing ColorType', () => {
      const invalidData = {
        Palette: ['FF0000'],
        Artwork: {
          Width: 8,
          Height: 8,
          PixelData: [
            {
              Position: { x: 0, y: 0 },
              Group: 0,
              ColorGroup: 0,
              ColorHex: 'FF0000',
            },
          ],
        },
      };

      expect(() => validateImportData(invalidData)).toThrow(
        ImportValidationError
      );
      expect(() => validateImportData(invalidData)).toThrow(
        'Pixel at index 0 ColorType must be a number'
      );
    });

    it('should reject pixel with missing ColorHex', () => {
      const invalidData = {
        Palette: ['FF0000'],
        Artwork: {
          Width: 8,
          Height: 8,
          PixelData: [
            {
              Position: { x: 0, y: 0 },
              Group: 0,
              ColorGroup: 0,
              ColorType: 0,
            },
          ],
        },
      };

      expect(() => validateImportData(invalidData)).toThrow(
        ImportValidationError
      );
      expect(() => validateImportData(invalidData)).toThrow(
        'Pixel at index 0 ColorHex must be a string'
      );
    });
  });

  describe('importJSON', () => {
    it('should import valid JSON data', () => {
      const exportedData: ExportedData = {
        Palette: ['FF0000', '00FF00', '0000FF'],
        Artwork: {
          Width: 8,
          Height: 8,
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

      const result = importJSON(exportedData);

      expect(result.size).toBe(8);
      expect(result.palette).toEqual(['#FF0000', '#00FF00', '#0000FF']);
      expect(result.pixels).toHaveLength(2);
      expect(result.pixels[0]).toEqual({
        x: 0,
        y: 0,
        r: 255,
        g: 0,
        b: 0,
        colorGroup: 0,
        group: 0,
        colorType: 0,
      });
      expect(result.pixels[1]).toEqual({
        x: 1,
        y: 0,
        r: 0,
        g: 255,
        b: 0,
        colorGroup: 1,
        group: 1,
        colorType: 1,
      });
    });

    it('should handle palette colors with # prefix', () => {
      const exportedData: ExportedData = {
        Palette: ['#FF0000', '#00FF00'],
        Artwork: {
          Width: 8,
          Height: 8,
          PixelData: [],
        },
      };

      const result = importJSON(exportedData);

      expect(result.palette).toEqual(['#FF0000', '#00FF00']);
    });

    it('should handle pixel colors with # prefix', () => {
      const exportedData: ExportedData = {
        Palette: ['FF0000'],
        Artwork: {
          Width: 8,
          Height: 8,
          PixelData: [
            {
              Position: { x: 0, y: 0 },
              Group: 0,
              ColorGroup: 0,
              ColorType: 0,
              ColorHex: '#FF0000',
            },
          ],
        },
      };

      const result = importJSON(exportedData);

      expect(result.pixels[0]).toEqual({
        x: 0,
        y: 0,
        r: 255,
        g: 0,
        b: 0,
        colorGroup: 0,
        group: 0,
        colorType: 0,
      });
    });

    it('should extract data groups from pixels', () => {
      const exportedData: ExportedData = {
        Palette: ['FF0000'],
        Artwork: {
          Width: 8,
          Height: 8,
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
              ColorGroup: 0,
              ColorType: 0,
              ColorHex: 'FF0000',
            },
            {
              Position: { x: 2, y: 0 },
              Group: 3,
              ColorGroup: 0,
              ColorType: 0,
              ColorHex: 'FF0000',
            },
          ],
        },
      };

      const result = importJSON(exportedData);

      expect(result.dataGroups).toHaveLength(3);
      expect(result.dataGroups[0]).toEqual({ id: 0, name: 'None' });
      expect(result.dataGroups[1]).toEqual({ id: 1, name: 'Group 1' });
      expect(result.dataGroups[2]).toEqual({ id: 3, name: 'Group 3' });
    });

    it('should extract color types from pixels', () => {
      const exportedData: ExportedData = {
        Palette: ['FF0000'],
        Artwork: {
          Width: 8,
          Height: 8,
          PixelData: [
            {
              Position: { x: 0, y: 0 },
              Group: 0,
              ColorGroup: 0,
              ColorType: 1,
              ColorHex: 'FF0000',
            },
            {
              Position: { x: 1, y: 0 },
              Group: 0,
              ColorGroup: 0,
              ColorType: 2,
              ColorHex: '00FF00',
            },
          ],
        },
      };

      const result = importJSON(exportedData);

      expect(result.colorTypes).toHaveLength(2);
      expect(result.colorTypes[0]).toEqual({
        id: 1,
        color: '#ff0000',
        name: 'Color 1',
      });
      expect(result.colorTypes[1]).toEqual({
        id: 2,
        color: '#00ff00',
        name: 'Color 2',
      });
    });

    it('should not include color type 0 in extracted color types', () => {
      const exportedData: ExportedData = {
        Palette: ['FF0000'],
        Artwork: {
          Width: 8,
          Height: 8,
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
              Group: 0,
              ColorGroup: 0,
              ColorType: 1,
              ColorHex: '00FF00',
            },
          ],
        },
      };

      const result = importJSON(exportedData);

      expect(result.colorTypes).toHaveLength(1);
      expect(result.colorTypes[0]?.id).toBe(1);
    });

    it('should throw ImportValidationError for invalid data', () => {
      const invalidData = {
        Palette: ['FF0000'],
        // Missing Artwork
      };

      expect(() => importJSON(invalidData)).toThrow(ImportValidationError);
    });
  });
});

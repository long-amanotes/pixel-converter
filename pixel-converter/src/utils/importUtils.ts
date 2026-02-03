/**
 * Import utilities for the Pixel Converter application
 * Handles JSON import functionality with validation
 * 
 * Requirements:
 * - 10.1: Parse and load JSON data when user imports a file
 * - 10.2: Restore palette, pixel data, data groups, and color types
 * - 10.3: Display error message and reject import if JSON format is invalid
 */

import type { ExportedData, Pixel, DataGroup, ColorType } from '../types';
import { hexToRgb } from './colorUtils';

/**
 * Error class for import validation failures
 */
export class ImportValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImportValidationError';
  }
}

/**
 * Validates that the imported data has the correct structure
 * Requirement 10.3: Validate JSON format and reject if invalid
 * 
 * @param data - Unknown data to validate
 * @returns true if data is valid ExportedData
 * @throws ImportValidationError if validation fails
 */
export function validateImportData(data: unknown): data is ExportedData {
  // Check if data is an object
  if (!data || typeof data !== 'object') {
    throw new ImportValidationError('Import data must be an object');
  }

  const d = data as Record<string, unknown>;

  // Check for Palette field
  if (!Array.isArray(d.Palette)) {
    throw new ImportValidationError('Missing or invalid "Palette" field');
  }

  // Validate palette colors are strings
  for (let i = 0; i < d.Palette.length; i++) {
    if (typeof d.Palette[i] !== 'string') {
      throw new ImportValidationError(
        `Palette color at index ${i} must be a string`
      );
    }
  }

  // Check for Artwork field
  if (!d.Artwork || typeof d.Artwork !== 'object') {
    throw new ImportValidationError('Missing or invalid "Artwork" field');
  }

  const artwork = d.Artwork as Record<string, unknown>;

  // Check Width and Height
  if (typeof artwork.Width !== 'number' || artwork.Width <= 0) {
    throw new ImportValidationError(
      'Artwork.Width must be a positive number'
    );
  }

  if (typeof artwork.Height !== 'number' || artwork.Height <= 0) {
    throw new ImportValidationError(
      'Artwork.Height must be a positive number'
    );
  }

  // Check PixelData
  if (!Array.isArray(artwork.PixelData)) {
    throw new ImportValidationError('Artwork.PixelData must be an array');
  }

  // Validate each pixel
  for (let i = 0; i < artwork.PixelData.length; i++) {
    const pixel = artwork.PixelData[i];
    if (!pixel || typeof pixel !== 'object') {
      throw new ImportValidationError(
        `Pixel at index ${i} must be an object`
      );
    }

    const p = pixel as Record<string, unknown>;

    // Validate Position
    if (!p.Position || typeof p.Position !== 'object') {
      throw new ImportValidationError(
        `Pixel at index ${i} missing or invalid Position`
      );
    }

    const pos = p.Position as Record<string, unknown>;
    if (typeof pos.x !== 'number' || typeof pos.y !== 'number') {
      throw new ImportValidationError(
        `Pixel at index ${i} Position must have numeric x and y`
      );
    }

    // Validate Group
    if (typeof p.Group !== 'number') {
      throw new ImportValidationError(
        `Pixel at index ${i} Group must be a number`
      );
    }

    // Validate ColorGroup
    if (typeof p.ColorGroup !== 'number') {
      throw new ImportValidationError(
        `Pixel at index ${i} ColorGroup must be a number`
      );
    }

    // Validate ColorType
    if (typeof p.ColorType !== 'number') {
      throw new ImportValidationError(
        `Pixel at index ${i} ColorType must be a number`
      );
    }

    // Validate ColorHex
    if (typeof p.ColorHex !== 'string') {
      throw new ImportValidationError(
        `Pixel at index ${i} ColorHex must be a string`
      );
    }
  }

  return true;
}

/**
 * Extracts unique data groups from imported pixel data
 * Requirement 10.2: Restore data groups
 * 
 * @param pixels - Array of imported pixels
 * @returns Array of unique DataGroup objects
 */
function extractDataGroups(pixels: Pixel[]): DataGroup[] {
  const groupIds = new Set<number>();
  
  // Collect all unique group IDs
  for (const pixel of pixels) {
    groupIds.add(pixel.group);
  }

  // Convert to DataGroup array
  const dataGroups: DataGroup[] = [];
  
  // Always include the default "None" group (id: 0)
  dataGroups.push({ id: 0, name: 'None' });

  // Add other groups
  for (const id of groupIds) {
    if (id !== 0) {
      dataGroups.push({ id, name: `Group ${id}` });
    }
  }

  // Sort by ID for consistency
  return dataGroups.sort((a, b) => a.id - b.id);
}

/**
 * Extracts unique color types from imported pixel data
 * Requirement 10.2: Restore color types
 * 
 * @param pixels - Array of imported pixels
 * @param palette - Array of palette hex colors (with # prefix)
 * @returns Array of unique ColorType objects
 */
function extractColorTypes(pixels: Pixel[], palette: string[]): ColorType[] {
  const colorTypeMap = new Map<number, Set<string>>();

  // Collect all unique color type IDs and their associated colors
  for (const pixel of pixels) {
    if (pixel.colorType > 0) {
      if (!colorTypeMap.has(pixel.colorType)) {
        colorTypeMap.set(pixel.colorType, new Set());
      }
      const hexColor = `#${pixel.r.toString(16).padStart(2, '0')}${pixel.g
        .toString(16)
        .padStart(2, '0')}${pixel.b.toString(16).padStart(2, '0')}`;
      colorTypeMap.get(pixel.colorType)!.add(hexColor);
    }
  }

  // Convert to ColorType array
  const colorTypes: ColorType[] = [];

  for (const [id, colors] of colorTypeMap.entries()) {
    // Use the first color found for this color type
    // In practice, all pixels of the same color type should have similar colors
    const color = Array.from(colors)[0] || '#000000';
    colorTypes.push({
      id,
      color,
      name: `Color ${id}`,
    });
  }

  // Sort by ID for consistency
  return colorTypes.sort((a, b) => a.id - b.id);
}

/**
 * Import pixel art data from JSON format
 * 
 * Requirements:
 * - 10.1: Parse and load JSON data
 * - 10.2: Restore palette, pixel data, data groups, and color types
 * - 10.3: Validate JSON format and reject if invalid
 * 
 * @param data - ExportedData object from JSON file
 * @returns Object containing restored state
 * @throws ImportValidationError if validation fails
 */
export function importJSON(data: unknown): {
  pixels: Pixel[];
  palette: string[];
  size: number;
  dataGroups: DataGroup[];
  colorTypes: ColorType[];
} {
  // Validate the data structure
  // Requirement 10.3: Validate and reject invalid JSON
  validateImportData(data);

  // TypeScript now knows data is ExportedData
  const exportedData = data as ExportedData;

  // Restore palette (add # prefix if missing)
  // Requirement 10.2: Restore palette
  const palette = exportedData.Palette.map((color) =>
    color.startsWith('#') ? color : `#${color}`
  );

  // Get size from artwork dimensions
  const size = exportedData.Artwork.Width;

  // Convert exported pixels to internal Pixel format
  // Requirement 10.2: Restore pixel data
  const pixels: Pixel[] = exportedData.Artwork.PixelData.map((exportedPixel) => {
    // Parse color hex to RGB
    const colorHex = exportedPixel.ColorHex.startsWith('#')
      ? exportedPixel.ColorHex
      : `#${exportedPixel.ColorHex}`;
    const rgb = hexToRgb(colorHex);

    return {
      x: exportedPixel.Position.x,
      y: exportedPixel.Position.y,
      r: rgb.r,
      g: rgb.g,
      b: rgb.b,
      colorGroup: exportedPixel.ColorGroup,
      group: exportedPixel.Group,
      colorType: exportedPixel.ColorType,
    };
  });

  // Extract data groups from pixel data
  // Requirement 10.2: Restore data groups
  const dataGroups = extractDataGroups(pixels);

  // Extract color types from pixel data
  // Requirement 10.2: Restore color types
  const colorTypes = extractColorTypes(pixels, palette);

  return {
    pixels,
    palette,
    size,
    dataGroups,
    colorTypes,
  };
}

/**
 * Read and parse a JSON file
 * 
 * @param file - File object from file input
 * @returns Promise resolving to parsed JSON data
 * @throws ImportValidationError if file cannot be read or parsed
 */
export async function readJSONFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);
        resolve(data);
      } catch (error) {
        reject(
          new ImportValidationError(
            `Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
          )
        );
      }
    };

    reader.onerror = () => {
      reject(new ImportValidationError('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

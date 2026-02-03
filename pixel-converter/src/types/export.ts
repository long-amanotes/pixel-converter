import type { Position } from './pixel';

/**
 * ExportedPixel interface representing a pixel in the exported JSON format
 */
export interface ExportedPixel {
  Position: Position;
  Group: number;
  ColorGroup: number;
  ColorType: number;
  ColorHex: string;
}

/**
 * ExportedData interface representing the complete exported JSON structure
 */
export interface ExportedData {
  Palette: string[];  // Hex colors without #
  Artwork: {
    Width: number;
    Height: number;
    PixelData: ExportedPixel[];
  };
}

/**
 * EditMode type representing the current interaction mode
 */
export type EditMode = 'group' | 'colorType' | 'paint' | 'erase';

/**
 * ScaleMode type representing the image conversion scaling algorithm
 */
export type ScaleMode = 'majority' | 'nearest';

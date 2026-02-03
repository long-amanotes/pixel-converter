import type { Pixel, RGB } from './pixel';

/**
 * ColorGroup interface representing an automatic grouping of pixels
 * based on their proximity to palette colors
 */
export interface ColorGroup {
  index: number;
  color: RGB;
  pixels: Pixel[];
}

/**
 * DataGroup interface representing a named collection of pixels
 * assigned by the user for organizational purposes
 */
export interface DataGroup {
  id: number;
  name: string;
}

/**
 * ColorType interface representing a user-defined classification
 * system for pixels, typically parsed from color groups
 */
export interface ColorType {
  id: number;
  color: string;  // Hex color
  name: string;
}

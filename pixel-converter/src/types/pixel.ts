/**
 * Position interface representing x,y coordinates
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Pixel interface representing a single pixel in the pixel art grid
 * Contains position, RGB color values, and metadata for grouping
 */
export interface Pixel {
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
  colorGroup: number;
  group: number;        // Data group ID
  colorType: number;    // Color type ID
}

/**
 * RGB interface for color representation
 */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

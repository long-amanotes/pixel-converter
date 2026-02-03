/**
 * Barrel export for all store slices
 */

export { createPixelSlice } from './pixelSlice';
export { createPaletteSlice, DEFAULT_PALETTE } from './paletteSlice';
export { createUISlice } from './uiSlice';
export { createGroupSlice, DEFAULT_DATA_GROUP } from './groupSlice';
export { createColorTypeSlice } from './colorTypeSlice';
export { createUndoSlice, MAX_UNDO_STACK_SIZE } from './undoSlice';

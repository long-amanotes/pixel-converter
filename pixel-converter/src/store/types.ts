/**
 * Store type definitions for the Pixel Converter application
 * Implements centralized state management using Zustand
 */

import type {
  Pixel,
  Position,
  ColorGroup,
  DataGroup,
  ColorType,
  EditMode,
  ScaleMode,
} from '../types';

/**
 * UndoState interface representing a snapshot of the application state
 * for undo functionality
 */
export interface UndoState {
  pixels: Pixel[];
  palette: string[];
  dataGroups: DataGroup[];
  colorTypes: ColorType[];
}

/**
 * PixelSlice interface for pixel data management
 */
export interface PixelSlice {
  // Pixel data
  pixels: Pixel[];
  size: number;

  // Actions
  setPixels: (pixels: Pixel[]) => void;
  setSize: (size: number) => void;
  importFromJSON: (data: unknown) => void;
  applyPaintColor: (pixelKeys: string[], color: string) => void;
  eraseSelectedPixels: (pixelKeys: string[]) => void;
}

/**
 * PaletteSlice interface for palette management
 */
export interface PaletteSlice {
  // Palette
  palette: string[]; // Hex colors
  colorGroups: ColorGroup[];

  // Actions
  addPaletteColor: (color: string) => void;
  updatePaletteColor: (index: number, color: string) => void;
  setPalette: (palette: string[]) => void;
  setColorGroups: (colorGroups: ColorGroup[]) => void;
  regroup: () => void;
}

/**
 * UISlice interface for UI state management
 */
export interface UISlice {
  // UI state
  editMode: EditMode;
  scaleMode: ScaleMode;
  zoomScale: number;
  activeColorGroup: number;
  selectedPixels: Set<string>; // "x,y" keys

  // Drag state
  isDragging: boolean;
  dragStart: Position | null;
  dragEnd: Position | null;

  // Original image reference
  originalImage: HTMLImageElement | null;

  // Actions
  setEditMode: (mode: EditMode) => void;
  setScaleMode: (mode: ScaleMode) => void;
  setZoomScale: (scale: number) => void;
  setActiveColorGroup: (index: number) => void;
  togglePixelSelection: (x: number, y: number) => void;
  selectPixelsInRect: (
    x0: number,
    y0: number,
    x1: number,
    y1: number
  ) => void;
  clearSelection: () => void;
  setDragState: (
    isDragging: boolean,
    start?: Position | null,
    end?: Position | null
  ) => void;
  setOriginalImage: (image: HTMLImageElement | null) => void;
}

/**
 * GroupSlice interface for data group management
 */
export interface GroupSlice {
  // Data groups state
  dataGroups: DataGroup[];
  activeDataGroupId: number;

  // Actions
  addDataGroup: () => void;
  deleteDataGroup: () => void;
  clearDataGroup: () => void;
  updateDataGroupName: (id: number, name: string) => void;
  setActiveDataGroup: (id: number) => void;
  assignPixelsToDataGroup: (pixelKeys: string[], dataGroupId: number) => void;
}

/**
 * ColorTypeSlice interface for color type management
 */
export interface ColorTypeSlice {
  // Color types state
  colorTypes: ColorType[];
  activeColorTypeId: number;

  // Actions
  parseColorTypes: () => void;
  setActiveColorType: (id: number) => void;
  setColorTypes: (colorTypes: ColorType[]) => void;
  assignPixelsToColorType: (pixelKeys: string[], colorTypeId: number) => void;
}

/**
 * UndoSlice interface for undo functionality management
 */
export interface UndoSlice {
  // Undo stack state
  undoStack: UndoState[];

  // Actions
  saveState: () => void;
  undo: () => void;
  clearUndoStack: () => void;
}

/**
 * Complete PixelConverterState interface combining all slices
 */
export interface PixelConverterState
  extends PixelSlice,
    PaletteSlice,
    UISlice,
    GroupSlice,
    ColorTypeSlice,
    UndoSlice {}

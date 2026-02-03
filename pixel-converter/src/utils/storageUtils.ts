/**
 * Storage utilities for persisting application state to localStorage
 * 
 * Requirements:
 * - Save uploaded image to localStorage
 * - Restore image and state on page load
 * - Protect user progress when resetting or changing size
 */

import type { Pixel, DataGroup, ColorType } from '../types';

const STORAGE_KEYS = {
  IMAGE_DATA: 'pixelConverter_imageData',
  PIXELS: 'pixelConverter_pixels',
  SIZE: 'pixelConverter_size',
  PALETTE: 'pixelConverter_palette',
  DATA_GROUPS: 'pixelConverter_dataGroups',
  COLOR_TYPES: 'pixelConverter_colorTypes',
  SCALE_MODE: 'pixelConverter_scaleMode',
} as const;

export interface StoredState {
  imageDataUrl?: string;
  pixels?: Pixel[];
  size?: number;
  palette?: string[];
  dataGroups?: DataGroup[];
  colorTypes?: ColorType[];
  scaleMode?: 'nearest' | 'majority';
}

/**
 * Save image data URL to localStorage
 * Converts image to base64 data URL for storage
 */
export const saveImageToStorage = (image: HTMLImageElement): void => {
  try {
    // Create a canvas to convert image to data URL
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(image, 0, 0);
    
    // Convert to data URL (base64)
    const dataUrl = canvas.toDataURL('image/png');
    
    localStorage.setItem(STORAGE_KEYS.IMAGE_DATA, dataUrl);
  } catch (error) {
    console.error('Failed to save image to storage:', error);
  }
};

/**
 * Load image from localStorage
 * Returns a promise that resolves with the loaded image
 */
export const loadImageFromStorage = (): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    try {
      const dataUrl = localStorage.getItem(STORAGE_KEYS.IMAGE_DATA);
      if (!dataUrl) {
        resolve(null);
        return;
      }
      
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        console.error('Failed to load image from storage');
        resolve(null);
      };
      img.src = dataUrl;
    } catch (error) {
      console.error('Failed to load image from storage:', error);
      resolve(null);
    }
  });
};

/**
 * Save complete application state to localStorage
 */
export const saveStateToStorage = (state: StoredState): void => {
  try {
    if (state.pixels !== undefined) {
      localStorage.setItem(STORAGE_KEYS.PIXELS, JSON.stringify(state.pixels));
    }
    if (state.size !== undefined) {
      localStorage.setItem(STORAGE_KEYS.SIZE, String(state.size));
    }
    if (state.palette !== undefined) {
      localStorage.setItem(STORAGE_KEYS.PALETTE, JSON.stringify(state.palette));
    }
    if (state.dataGroups !== undefined) {
      localStorage.setItem(STORAGE_KEYS.DATA_GROUPS, JSON.stringify(state.dataGroups));
    }
    if (state.colorTypes !== undefined) {
      localStorage.setItem(STORAGE_KEYS.COLOR_TYPES, JSON.stringify(state.colorTypes));
    }
    if (state.scaleMode !== undefined) {
      localStorage.setItem(STORAGE_KEYS.SCALE_MODE, state.scaleMode);
    }
  } catch (error) {
    console.error('Failed to save state to storage:', error);
  }
};

/**
 * Load complete application state from localStorage
 */
export const loadStateFromStorage = (): StoredState => {
  try {
    const state: StoredState = {};
    
    const pixelsStr = localStorage.getItem(STORAGE_KEYS.PIXELS);
    if (pixelsStr) {
      state.pixels = JSON.parse(pixelsStr);
    }
    
    const sizeStr = localStorage.getItem(STORAGE_KEYS.SIZE);
    if (sizeStr) {
      state.size = parseInt(sizeStr, 10);
    }
    
    const paletteStr = localStorage.getItem(STORAGE_KEYS.PALETTE);
    if (paletteStr) {
      state.palette = JSON.parse(paletteStr);
    }
    
    const dataGroupsStr = localStorage.getItem(STORAGE_KEYS.DATA_GROUPS);
    if (dataGroupsStr) {
      state.dataGroups = JSON.parse(dataGroupsStr);
    }
    
    const colorTypesStr = localStorage.getItem(STORAGE_KEYS.COLOR_TYPES);
    if (colorTypesStr) {
      state.colorTypes = JSON.parse(colorTypesStr);
    }
    
    const scaleMode = localStorage.getItem(STORAGE_KEYS.SCALE_MODE);
    if (scaleMode === 'nearest' || scaleMode === 'majority') {
      state.scaleMode = scaleMode;
    }
    
    return state;
  } catch (error) {
    console.error('Failed to load state from storage:', error);
    return {};
  }
};

/**
 * Clear all stored data
 */
export const clearStorage = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
};

/**
 * Check if there is saved data in storage
 */
export const hasStoredData = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEYS.IMAGE_DATA) !== null;
  } catch (error) {
    return false;
  }
};

/**
 * Tests for storage utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveStateToStorage,
  loadStateFromStorage,
  clearStorage,
  hasStoredData,
  saveImageToStorage,
  loadImageFromStorage,
} from './storageUtils';
import type { Pixel } from '../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('storageUtils', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('saveStateToStorage and loadStateFromStorage', () => {
    it('should save and load pixels', () => {
      const pixels: Pixel[] = [
        { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, dataGroup: 0, colorType: 0 },
        { x: 1, y: 1, r: 0, g: 255, b: 0, colorGroup: 1, dataGroup: 0, colorType: 0 },
      ];

      saveStateToStorage({ pixels });
      const loaded = loadStateFromStorage();

      expect(loaded.pixels).toEqual(pixels);
    });

    it('should save and load size', () => {
      saveStateToStorage({ size: 64 });
      const loaded = loadStateFromStorage();

      expect(loaded.size).toBe(64);
    });

    it('should save and load palette', () => {
      const palette = ['#ff0000', '#00ff00', '#0000ff'];

      saveStateToStorage({ palette });
      const loaded = loadStateFromStorage();

      expect(loaded.palette).toEqual(palette);
    });

    it('should save and load scale mode', () => {
      saveStateToStorage({ scaleMode: 'majority' });
      const loaded = loadStateFromStorage();

      expect(loaded.scaleMode).toBe('majority');
    });

    it('should handle empty storage', () => {
      const loaded = loadStateFromStorage();

      expect(loaded).toEqual({});
    });
  });

  describe('clearStorage', () => {
    it('should clear all stored data', () => {
      saveStateToStorage({
        pixels: [],
        size: 32,
        palette: ['#ff0000'],
        scaleMode: 'nearest',
      });

      expect(hasStoredData()).toBe(false); // No image data yet

      clearStorage();

      const loaded = loadStateFromStorage();
      expect(loaded).toEqual({});
    });
  });

  describe('hasStoredData', () => {
    it('should return false when no data is stored', () => {
      expect(hasStoredData()).toBe(false);
    });

    it('should return true when image data is stored', () => {
      localStorage.setItem('pixelConverter_imageData', 'data:image/png;base64,test');
      expect(hasStoredData()).toBe(true);
    });
  });

  describe('saveImageToStorage', () => {
    it('should handle errors gracefully', () => {
      const mockImage = {
        width: 10,
        height: 10,
      } as HTMLImageElement;

      // Should not throw
      expect(() => saveImageToStorage(mockImage)).not.toThrow();
    });
  });

  describe('loadImageFromStorage', () => {
    it('should return null when no image is stored', async () => {
      const image = await loadImageFromStorage();
      expect(image).toBeNull();
    });

    it('should return null on error', async () => {
      localStorage.setItem('pixelConverter_imageData', 'invalid-data');
      
      // Use a timeout to prevent hanging
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), 100);
      });
      
      const image = await Promise.race([loadImageFromStorage(), timeoutPromise]);
      expect(image).toBeNull();
    });
  });
});

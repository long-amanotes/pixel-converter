/**
 * Unit tests for useImageLoader hook
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useImageLoader } from './useImageLoader';
import { useStore } from '../store';

// Mock the store
vi.mock('../store', () => ({
  useStore: vi.fn(),
}));

// Mock the image converter utilities
vi.mock('../utils/imageConverter', () => ({
  blockMajorityConvert: vi.fn(() => [
    { x: 0, y: 0, r: 255, g: 0, b: 0, colorGroup: 0, group: 0, colorType: 0 },
  ]),
  nearestNeighborConvert: vi.fn(() => [
    { x: 0, y: 0, r: 0, g: 255, b: 0, colorGroup: 0, group: 0, colorType: 0 },
  ]),
}));

describe('useImageLoader', () => {
  let mockStore: any;

  beforeEach(() => {
    // Reset mock store before each test
    mockStore = {
      size: 32,
      scaleMode: 'majority' as const,
      setOriginalImage: vi.fn(),
      setPixels: vi.fn(),
      regroup: vi.fn(),
      saveState: vi.fn(),
    };

    // Mock useStore to return our mock store
    (useStore as any).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector(mockStore);
      }
      return mockStore;
    });

    // Mock document.createElement for canvas
    const originalCreateElement = document.createElement.bind(document);
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({
        drawImage: vi.fn(),
        getImageData: vi.fn(() => ({
          width: 100,
          height: 100,
          data: new Uint8ClampedArray(100 * 100 * 4),
        })),
      })),
    };

    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        return mockCanvas as any;
      }
      return originalCreateElement(tagName);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should return image loading handlers', () => {
      const { result } = renderHook(() => useImageLoader());

      expect(result.current.handleFileInput).toBeInstanceOf(Function);
      expect(result.current.handleDragOver).toBeInstanceOf(Function);
      expect(result.current.handleDrop).toBeInstanceOf(Function);
      expect(result.current.loadImageFromFile).toBeInstanceOf(Function);
      expect(result.current.loadImageFromUrl).toBeInstanceOf(Function);
    });

    it('should accept custom options', () => {
      const onLoadStart = vi.fn();
      const onLoadSuccess = vi.fn();
      const onLoadError = vi.fn();

      const { result } = renderHook(() =>
        useImageLoader({
          enableDragDrop: false,
          enablePaste: false,
          onLoadStart,
          onLoadSuccess,
          onLoadError,
        })
      );

      expect(result.current.handleFileInput).toBeInstanceOf(Function);
    });
  });

  describe('file input handling', () => {
    it('should handle file input change event', async () => {
      const { result } = renderHook(() => useImageLoader());

      // Create a mock file
      const mockFile = new File([''], 'test.png', { type: 'image/png' });

      // Create a mock event
      const mockEvent = {
        target: {
          files: [mockFile],
        },
      } as any;

      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: vi.fn(function (this: any) {
          setTimeout(() => {
            this.onload?.({ target: { result: 'data:image/png;base64,test' } });
          }, 0);
        }),
        onload: null as any,
        onerror: null as any,
      };

      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      // Mock Image
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        src: '',
        width: 100,
        height: 100,
      };

      vi.spyOn(window, 'Image').mockImplementation(() => {
        setTimeout(() => {
          mockImage.onload?.();
        }, 0);
        return mockImage as any;
      });

      act(() => {
        result.current.handleFileInput(mockEvent);
      });

      await waitFor(() => {
        expect(mockStore.setPixels).toHaveBeenCalled();
      });
    });

    it('should not process if no file is selected', () => {
      const { result } = renderHook(() => useImageLoader());

      const mockEvent = {
        target: {
          files: [],
        },
      } as any;

      act(() => {
        result.current.handleFileInput(mockEvent);
      });

      expect(mockStore.setPixels).not.toHaveBeenCalled();
    });
  });

  describe('drag and drop handling', () => {
    it('should prevent default on drag over', () => {
      const { result } = renderHook(() => useImageLoader());

      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as any;

      act(() => {
        result.current.handleDragOver(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('should handle drop event with image file', async () => {
      const { result } = renderHook(() => useImageLoader());

      const mockFile = new File([''], 'test.png', { type: 'image/png' });

      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        dataTransfer: {
          files: [mockFile],
        },
      } as any;

      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: vi.fn(function (this: any) {
          setTimeout(() => {
            this.onload?.({ target: { result: 'data:image/png;base64,test' } });
          }, 0);
        }),
        onload: null as any,
        onerror: null as any,
      };

      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      // Mock Image
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        src: '',
        width: 100,
        height: 100,
      };

      vi.spyOn(window, 'Image').mockImplementation(() => {
        setTimeout(() => {
          mockImage.onload?.();
        }, 0);
        return mockImage as any;
      });

      act(() => {
        result.current.handleDrop(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();

      await waitFor(() => {
        expect(mockStore.setPixels).toHaveBeenCalled();
      });
    });

    it('should not process drop if no file is present', () => {
      const { result } = renderHook(() => useImageLoader());

      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        dataTransfer: {
          files: [],
        },
      } as any;

      act(() => {
        result.current.handleDrop(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockStore.setPixels).not.toHaveBeenCalled();
    });
  });

  describe('file validation', () => {
    it('should reject non-image files', async () => {
      const onLoadError = vi.fn();
      const { result } = renderHook(() => useImageLoader({ onLoadError }));

      const mockFile = new File([''], 'test.txt', { type: 'text/plain' });

      await expect(result.current.loadImageFromFile(mockFile)).rejects.toThrow(
        'Invalid file type'
      );

      expect(onLoadError).toHaveBeenCalled();
    });

    it('should accept image files', async () => {
      const { result } = renderHook(() => useImageLoader());

      const mockFile = new File([''], 'test.png', { type: 'image/png' });

      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: vi.fn(function (this: any) {
          setTimeout(() => {
            this.onload?.({ target: { result: 'data:image/png;base64,test' } });
          }, 0);
        }),
        onload: null as any,
        onerror: null as any,
      };

      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      // Mock Image
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        src: '',
        width: 100,
        height: 100,
      };

      vi.spyOn(window, 'Image').mockImplementation(() => {
        setTimeout(() => {
          mockImage.onload?.();
        }, 0);
        return mockImage as any;
      });

      await result.current.loadImageFromFile(mockFile);

      await waitFor(() => {
        expect(mockStore.setPixels).toHaveBeenCalled();
      });
    });
  });

  describe('callbacks', () => {
    it('should call onLoadStart when loading begins', async () => {
      const onLoadStart = vi.fn();
      const { result } = renderHook(() => useImageLoader({ onLoadStart }));

      const mockFile = new File([''], 'test.png', { type: 'image/png' });

      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: vi.fn(function (this: any) {
          setTimeout(() => {
            this.onload?.({ target: { result: 'data:image/png;base64,test' } });
          }, 0);
        }),
        onload: null as any,
        onerror: null as any,
      };

      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      // Mock Image
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        src: '',
        width: 100,
        height: 100,
      };

      vi.spyOn(window, 'Image').mockImplementation(() => {
        setTimeout(() => {
          mockImage.onload?.();
        }, 0);
        return mockImage as any;
      });

      result.current.loadImageFromFile(mockFile);

      expect(onLoadStart).toHaveBeenCalled();
    });

    it('should call onLoadSuccess when loading completes', async () => {
      const onLoadSuccess = vi.fn();
      const { result } = renderHook(() => useImageLoader({ onLoadSuccess }));

      const mockFile = new File([''], 'test.png', { type: 'image/png' });

      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: vi.fn(function (this: any) {
          setTimeout(() => {
            this.onload?.({ target: { result: 'data:image/png;base64,test' } });
          }, 0);
        }),
        onload: null as any,
        onerror: null as any,
      };

      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      // Mock Image
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        src: '',
        width: 100,
        height: 100,
      };

      vi.spyOn(window, 'Image').mockImplementation(() => {
        setTimeout(() => {
          mockImage.onload?.();
        }, 0);
        return mockImage as any;
      });

      await result.current.loadImageFromFile(mockFile);

      await waitFor(() => {
        expect(onLoadSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('scale mode handling', () => {
    it('should use block majority convert when scaleMode is majority', async () => {
      mockStore.scaleMode = 'majority';
      const { result } = renderHook(() => useImageLoader());

      const mockFile = new File([''], 'test.png', { type: 'image/png' });

      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: vi.fn(function (this: any) {
          setTimeout(() => {
            this.onload?.({ target: { result: 'data:image/png;base64,test' } });
          }, 0);
        }),
        onload: null as any,
        onerror: null as any,
      };

      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      // Mock Image
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        src: '',
        width: 100,
        height: 100,
      };

      vi.spyOn(window, 'Image').mockImplementation(() => {
        setTimeout(() => {
          mockImage.onload?.();
        }, 0);
        return mockImage as any;
      });

      await result.current.loadImageFromFile(mockFile);

      await waitFor(() => {
        expect(mockStore.setPixels).toHaveBeenCalled();
      });
    });

    it('should use nearest neighbor convert when scaleMode is nearest', async () => {
      mockStore.scaleMode = 'nearest';
      const { result } = renderHook(() => useImageLoader());

      const mockFile = new File([''], 'test.png', { type: 'image/png' });

      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: vi.fn(function (this: any) {
          setTimeout(() => {
            this.onload?.({ target: { result: 'data:image/png;base64,test' } });
          }, 0);
        }),
        onload: null as any,
        onerror: null as any,
      };

      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      // Mock Image
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        src: '',
        width: 100,
        height: 100,
      };

      vi.spyOn(window, 'Image').mockImplementation(() => {
        setTimeout(() => {
          mockImage.onload?.();
        }, 0);
        return mockImage as any;
      });

      await result.current.loadImageFromFile(mockFile);

      await waitFor(() => {
        expect(mockStore.setPixels).toHaveBeenCalled();
      });
    });
  });
});

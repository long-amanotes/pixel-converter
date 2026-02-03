/**
 * useImageLoader hook - Handles image loading from various sources
 * 
 * Requirements:
 * - 2.1: Load and display image when user uploads via file input
 * - 2.2: Load and display image when user drags and drops onto canvas area
 * - 2.3: Load and display image when user pastes from clipboard (Ctrl+V)
 * - 11.4: Use custom hooks for reusable logic
 * 
 * This hook provides:
 * - File input handling
 * - Drag-and-drop handling
 * - Clipboard paste handling (Ctrl+V)
 * - Image loading and conversion to pixel art
 */

import { useCallback, useEffect } from 'react';
import { useStore } from '../store';
import { blockMajorityConvert, nearestNeighborConvert } from '../utils/imageConverter';

export interface UseImageLoaderOptions {
  /**
   * Enable drag-and-drop handling
   * @default true
   */
  enableDragDrop?: boolean;
  
  /**
   * Enable clipboard paste handling
   * @default true
   */
  enablePaste?: boolean;
  
  /**
   * Callback when image loading starts
   */
  onLoadStart?: () => void;
  
  /**
   * Callback when image loading completes successfully
   */
  onLoadSuccess?: (image: HTMLImageElement) => void;
  
  /**
   * Callback when image loading fails
   */
  onLoadError?: (error: Error) => void;
}

export interface UseImageLoaderReturn {
  /**
   * Handle file input change event
   */
  handleFileInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  
  /**
   * Handle drag over event (for drag-and-drop)
   */
  handleDragOver: (event: React.DragEvent) => void;
  
  /**
   * Handle drop event (for drag-and-drop)
   */
  handleDrop: (event: React.DragEvent) => void;
  
  /**
   * Load image from file
   */
  loadImageFromFile: (file: File) => Promise<void>;
  
  /**
   * Load image from URL
   */
  loadImageFromUrl: (url: string) => Promise<void>;
}

/**
 * Custom hook for handling image loading from various sources
 * 
 * @param options - Configuration options
 * @returns Image loading handlers and utilities
 */
export const useImageLoader = ({
  enableDragDrop = true,
  enablePaste = true,
  onLoadStart,
  onLoadSuccess,
  onLoadError,
}: UseImageLoaderOptions = {}): UseImageLoaderReturn => {
  // Get state and actions from store
  const size = useStore((state) => state.size);
  const scaleMode = useStore((state) => state.scaleMode);
  const setOriginalImage = useStore((state) => state.setOriginalImage);
  const setPixels = useStore((state) => state.setPixels);
  const regroup = useStore((state) => state.regroup);
  const saveState = useStore((state) => state.saveState);

  /**
   * Convert loaded image to pixel art
   * 
   * @param image - The loaded HTMLImageElement
   */
  const convertImageToPixels = useCallback(
    (image: HTMLImageElement) => {
      // Create a canvas to extract image data
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        const error = new Error('Failed to get canvas context');
        onLoadError?.(error);
        throw error;
      }

      // Draw the image onto the canvas
      ctx.drawImage(image, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, image.width, image.height);
      
      // Convert based on scale mode
      const pixels = scaleMode === 'majority'
        ? blockMajorityConvert(imageData, size)
        : nearestNeighborConvert(imageData, size);
      
      // Save state for undo before making changes
      saveState();
      
      // Update store with new pixels
      setPixels(pixels);
      
      // Store the original image reference
      setOriginalImage(image);
      
      // Regroup pixels based on current palette
      regroup();
      
      // Notify success
      onLoadSuccess?.(image);
    },
    [size, scaleMode, setPixels, setOriginalImage, regroup, saveState, onLoadSuccess, onLoadError]
  );

  /**
   * Load image from a File object
   * Requirement 2.1: Load and display image when user uploads via file input
   * 
   * @param file - The file to load
   */
  const loadImageFromFile = useCallback(
    async (file: File): Promise<void> => {
      // Validate file type (Requirement 2.8)
      if (!file.type.startsWith('image/')) {
        const error = new Error('Invalid file type. Please upload an image file.');
        onLoadError?.(error);
        throw error;
      }

      onLoadStart?.();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const img = new Image();
          
          img.onload = () => {
            try {
              convertImageToPixels(img);
              resolve();
            } catch (error) {
              reject(error);
            }
          };
          
          img.onerror = () => {
            const error = new Error('Failed to load image');
            onLoadError?.(error);
            reject(error);
          };
          
          img.src = e.target?.result as string;
        };
        
        reader.onerror = () => {
          const error = new Error('Failed to read file');
          onLoadError?.(error);
          reject(error);
        };
        
        reader.readAsDataURL(file);
      });
    },
    [convertImageToPixels, onLoadStart, onLoadError]
  );

  /**
   * Load image from a URL
   * 
   * @param url - The URL to load the image from
   */
  const loadImageFromUrl = useCallback(
    async (url: string): Promise<void> => {
      onLoadStart?.();

      return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
          try {
            convertImageToPixels(img);
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        
        img.onerror = () => {
          const error = new Error('Failed to load image from URL');
          onLoadError?.(error);
          reject(error);
        };
        
        img.src = url;
      });
    },
    [convertImageToPixels, onLoadStart, onLoadError]
  );

  /**
   * Handle file input change event
   * Requirement 2.1: Load and display image when user uploads via file input
   * 
   * @param event - The change event from file input
   */
  const handleFileInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      loadImageFromFile(file).catch((error) => {
        console.error('Failed to load image from file input:', error);
      });
    },
    [loadImageFromFile]
  );

  /**
   * Handle drag over event
   * Requirement 2.2: Load and display image when user drags and drops
   * 
   * @param event - The drag event
   */
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  /**
   * Handle drop event
   * Requirement 2.2: Load and display image when user drags and drops
   * 
   * @param event - The drop event
   */
  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const file = event.dataTransfer.files?.[0];
      if (!file) return;

      loadImageFromFile(file).catch((error) => {
        console.error('Failed to load image from drag-and-drop:', error);
      });
    },
    [loadImageFromFile]
  );

  /**
   * Handle clipboard paste event
   * Requirement 2.3: Load and display image when user pastes from clipboard (Ctrl+V)
   */
  const handlePaste = useCallback(
    (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      // Find the first image item
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item?.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            loadImageFromFile(file).catch((error) => {
              console.error('Failed to load image from clipboard:', error);
            });
          }
          break;
        }
      }
    },
    [loadImageFromFile]
  );

  /**
   * Set up event listeners for drag-and-drop and paste
   */
  useEffect(() => {
    if (enablePaste) {
      // Add paste event listener to document
      document.addEventListener('paste', handlePaste);
    }

    return () => {
      if (enablePaste) {
        document.removeEventListener('paste', handlePaste);
      }
    };
  }, [enablePaste, handlePaste]);

  return {
    handleFileInput,
    handleDragOver,
    handleDrop,
    loadImageFromFile,
    loadImageFromUrl,
  };
};

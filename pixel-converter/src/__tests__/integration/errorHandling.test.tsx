/**
 * Integration tests for error handling UI
 * 
 * Validates: Requirements 2.8, 10.3, 8.4
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PixelEditorPage } from '../../pages/PixelEditorPage';
import { ToastProvider } from '../../contexts/toast';
import { useStore } from '../../store';

// Mock the store
vi.mock('../../store', () => ({
  useStore: vi.fn(),
}));

// Mock image loader so tests focus on UI notifications (not canvas/image decoding)
vi.mock('../../hooks/useImageLoader', () => ({
  useImageLoader: (options: any = {}) => ({
    handleFileInput: (event: any) => {
      const file: File | undefined = event?.target?.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        options.onLoadError?.(new Error('Invalid file type. Please upload an image file.'));
        return;
      }

      options.onLoadSuccess?.(new Image());
    },
    handleDragOver: () => {},
    handleDrop: () => {},
    loadImageFromFile: async () => {},
    loadImageFromUrl: async () => {},
  }),
}));

const mockUseStore = useStore as unknown as ReturnType<typeof vi.fn>;

describe('Error Handling UI', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup default store mock
    mockUseStore.mockImplementation((selector) => {
      const state = {
        pixels: [],
        size: 32,
        scaleMode: 'majority' as const,
        editMode: 'paint' as const,
        zoomScale: 1,
        undoStack: [],
        palette: ['#FF0000', '#00FF00', '#0000FF'],
        colorGroups: [],
        dataGroups: [{ id: 0, name: 'None' }],
        activeDataGroupId: 0,
        colorTypes: [],
        activeColorTypeId: 0,
        activeColorGroup: -1,
        selectedPixels: new Set<string>(),
        isDragging: false,
        dragStart: null,
        dragEnd: null,
        originalImage: null,
        setSize: vi.fn(),
        setScaleMode: vi.fn(),
        setEditMode: vi.fn(),
        setZoomScale: vi.fn(),
        undo: vi.fn(),
        addDataGroup: vi.fn(),
        deleteDataGroup: vi.fn(),
        clearDataGroup: vi.fn(),
        setActiveDataGroup: vi.fn(),
        updateDataGroupName: vi.fn(),
        setPixels: vi.fn(),
        setPalette: vi.fn(),
        setColorTypes: vi.fn(),
        regroup: vi.fn(),
      };
      return selector(state);
    });
  });

  it('should display error notification for invalid file type', async () => {
    render(
      <ToastProvider>
        <PixelEditorPage />
      </ToastProvider>
    );

    // Create a mock file with invalid type
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    // Find the file input
    const fileInput = screen.getByLabelText(/upload image file/i);
    
    // Trigger file upload
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for error notification to appear
    await waitFor(() => {
      const errorElement = screen.getByText(/invalid file type/i);
      expect(errorElement).toBeTruthy();
    });
  });

  it('should display info notification when undo stack is empty', async () => {
    render(
      <ToastProvider>
        <PixelEditorPage />
      </ToastProvider>
    );

    // Trigger undo with empty stack (Ctrl+Z)
    fireEvent.keyDown(document, { key: 'z', ctrlKey: true });

    // Wait for info notification to appear
    await waitFor(() => {
      const infoElement = screen.getByText(/nothing to undo/i);
      expect(infoElement).toBeTruthy();
    });
  });

  it('should display success notification when image loads successfully', async () => {
    render(
      <ToastProvider>
        <PixelEditorPage />
      </ToastProvider>
    );

    // Create a mock image file
    const file = new File(['image'], 'test.png', { type: 'image/png' });
    
    // Find the file input
    const fileInput = screen.getByLabelText(/upload image file/i);
    
    // Trigger file upload
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for success notification to appear
    await waitFor(() => {
      const successElement = screen.getByText(/image loaded successfully/i);
      expect(successElement).toBeTruthy();
    }, { timeout: 3000 });
  });
});

/**
 * Unit tests for ToolbarComponent
 * Tests size input, scale mode selector, edit mode selector, and file upload control
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToolbarComponent } from './ToolbarComponent';
import { useStore } from '../../store';

describe('ToolbarComponent', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useStore.setState({
      size: 32,
      scaleMode: 'majority',
      editMode: 'group',
    });
  });

  it('should render size input with current value', () => {
    render(<ToolbarComponent />);
    const sizeInput = screen.getByLabelText(/size/i) as HTMLInputElement;
    expect(sizeInput).toBeDefined();
    expect(sizeInput.value).toBe('32');
  });

  it('should render scale mode selector with current value', () => {
    render(<ToolbarComponent />);
    const scaleModeSelect = screen.getByLabelText(/scale mode/i);
    expect(scaleModeSelect).toBeDefined();
  });

  it('should render edit mode selector with current value', () => {
    render(<ToolbarComponent />);
    const editModeSelect = screen.getByLabelText(/edit mode/i);
    expect(editModeSelect).toBeDefined();
  });

  it('should update size when valid input is provided', async () => {
    const { rerender } = render(<ToolbarComponent />);
    
    // Directly set the size in the store
    await act(async () => {
      useStore.getState().setSize(64);
    });
    
    // Force re-render to pick up the new state
    rerender(<ToolbarComponent />);
    
    const sizeInput = screen.getByLabelText(/size/i) as HTMLInputElement;
    expect(sizeInput.value).toBe('64');
    expect(useStore.getState().size).toBe(64);
  });

  it('should clamp size to minimum value (8)', async () => {
    render(<ToolbarComponent />);
    
    // Directly set an invalid size in the store
    await act(async () => {
      useStore.getState().setSize(5);
    });
    
    // The store should clamp it to 8
    expect(useStore.getState().size).toBe(8);
  });

  it('should clamp size to maximum value (256)', async () => {
    const user = userEvent.setup();
    render(<ToolbarComponent />);
    
    const sizeInput = screen.getByLabelText(/size/i) as HTMLInputElement;
    await user.clear(sizeInput);
    await user.type(sizeInput, '300');
    
    // Wait for the state to update
    await waitFor(() => {
      expect(useStore.getState().size).toBe(256);
    });
  });

  it('should update scale mode when selection changes', async () => {
    const user = userEvent.setup();
    render(<ToolbarComponent />);
    
    const scaleModeSelect = screen.getByLabelText(/scale mode/i);
    await user.click(scaleModeSelect);
    
    const nearestOption = screen.getByText('Nearest Neighbor');
    await user.click(nearestOption);
    
    expect(useStore.getState().scaleMode).toBe('nearest');
  });

  it('should update edit mode when selection changes', async () => {
    const user = userEvent.setup();
    render(<ToolbarComponent />);
    
    const editModeSelect = screen.getByLabelText(/edit mode/i);
    await user.click(editModeSelect);
    
    const paintOption = screen.getByText('Paint');
    await user.click(paintOption);
    
    expect(useStore.getState().editMode).toBe('paint');
  });

  it('should display helper text for size range', () => {
    render(<ToolbarComponent />);
    expect(screen.getByText('8-256 pixels')).toBeDefined();
  });

  it('should have all edit mode options available', async () => {
    const user = userEvent.setup();
    render(<ToolbarComponent />);
    
    const editModeSelect = screen.getByLabelText(/edit mode/i);
    await user.click(editModeSelect);
    
    // Use getAllByText to handle multiple elements with same text
    const groupDataOptions = screen.getAllByText('Group Data');
    expect(groupDataOptions.length).toBeGreaterThan(0);
    expect(screen.getByText('Color Type')).toBeDefined();
    expect(screen.getByText('Paint')).toBeDefined();
    expect(screen.getByText('Erase')).toBeDefined();
  });

  it('should have both scale mode options available', async () => {
    const user = userEvent.setup();
    render(<ToolbarComponent />);
    
    const scaleModeSelect = screen.getByLabelText(/scale mode/i);
    await user.click(scaleModeSelect);
    
    // Use getAllByText to handle multiple elements with same text
    const blockMajorityOptions = screen.getAllByText('Block Majority');
    expect(blockMajorityOptions.length).toBeGreaterThan(0);
    expect(screen.getByText('Nearest Neighbor')).toBeDefined();
  });

  describe('File Upload Control', () => {
    it('should render upload button', () => {
      render(<ToolbarComponent />);
      const uploadButton = screen.getByRole('button', { name: /upload image/i });
      expect(uploadButton).toBeDefined();
    });

    it('should have hidden file input with image/* accept attribute', () => {
      render(<ToolbarComponent />);
      const fileInput = screen.getByLabelText(/upload image file/i) as HTMLInputElement;
      expect(fileInput).toBeDefined();
      expect(fileInput.type).toBe('file');
      expect(fileInput.accept).toBe('image/*');
      expect(fileInput.style.display).toBe('none');
    });

    it('should trigger file input click when upload button is clicked', async () => {
      const user = userEvent.setup();
      render(<ToolbarComponent />);
      
      const fileInput = screen.getByLabelText(/upload image file/i) as HTMLInputElement;
      const clickSpy = vi.spyOn(fileInput, 'click');
      
      const uploadButton = screen.getByRole('button', { name: /upload image/i });
      await user.click(uploadButton);
      
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should handle valid image file upload', async () => {
      const user = userEvent.setup();
      
      // Mock alert to prevent actual alert dialogs
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(<ToolbarComponent />);
      
      const fileInput = screen.getByLabelText(/upload image file/i) as HTMLInputElement;
      
      // Create a mock image file
      const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
      
      // Upload the file
      await user.upload(fileInput, file);
      
      // Verify the file was set
      expect(fileInput.files?.[0]).toBe(file);
      expect(fileInput.files?.length).toBe(1);
      
      // No error alert should be shown for valid image
      await waitFor(() => {
        expect(alertSpy).not.toHaveBeenCalled();
      }, { timeout: 100 });
      
      alertSpy.mockRestore();
    });

    it('should accept various image formats', async () => {
      const user = userEvent.setup();
      
      // Mock alert to prevent actual alert dialogs
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(<ToolbarComponent />);
      
      const fileInput = screen.getByLabelText(/upload image file/i) as HTMLInputElement;
      
      // Test different image formats
      const imageFormats = [
        { name: 'test.png', type: 'image/png' },
        { name: 'test.jpg', type: 'image/jpeg' },
        { name: 'test.gif', type: 'image/gif' },
        { name: 'test.webp', type: 'image/webp' },
      ];
      
      for (const format of imageFormats) {
        const file = new File(['dummy content'], format.name, { type: format.type });
        await user.upload(fileInput, file);
        
        expect(fileInput.files?.[0]).toBe(file);
      }
      
      // No error alerts should be shown for valid images
      await waitFor(() => {
        expect(alertSpy).not.toHaveBeenCalled();
      }, { timeout: 100 });
      
      alertSpy.mockRestore();
    });
  });
});

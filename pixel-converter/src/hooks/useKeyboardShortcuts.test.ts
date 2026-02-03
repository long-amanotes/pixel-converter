/**
 * Tests for useKeyboardShortcuts hook
 * 
 * Requirements:
 * - 8.2: Handle Ctrl+Z for undo
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { useStore } from '../store';

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    // Reset store state before each test
    useStore.setState({
      undoStack: [],
      pixels: [],
      palette: ['#000000'],
      dataGroups: [{ id: 0, name: 'None' }],
      colorTypes: [],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Undo shortcut (Ctrl+Z)', () => {
    it('should call undo when Ctrl+Z is pressed and undo stack is not empty', () => {
      // Setup: Add a state to the undo stack
      act(() => {
        useStore.getState().saveState();
      });

      const onUndo = vi.fn();
      const onUndoEmpty = vi.fn();

      renderHook(() =>
        useKeyboardShortcuts({
          onUndo,
          onUndoEmpty,
        })
      );

      // Simulate Ctrl+Z
      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
      });

      act(() => {
        document.dispatchEvent(event);
      });

      expect(onUndo).toHaveBeenCalledTimes(1);
      expect(onUndoEmpty).not.toHaveBeenCalled();
    });

    it('should call onUndoEmpty when Ctrl+Z is pressed and undo stack is empty', () => {
      const onUndo = vi.fn();
      const onUndoEmpty = vi.fn();

      renderHook(() =>
        useKeyboardShortcuts({
          onUndo,
          onUndoEmpty,
        })
      );

      // Simulate Ctrl+Z with empty undo stack
      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
      });

      act(() => {
        document.dispatchEvent(event);
      });

      expect(onUndoEmpty).toHaveBeenCalledTimes(1);
      expect(onUndo).not.toHaveBeenCalled();
    });

    it('should support Cmd+Z on Mac', () => {
      // Setup: Add a state to the undo stack
      act(() => {
        useStore.getState().saveState();
      });

      const onUndo = vi.fn();

      renderHook(() =>
        useKeyboardShortcuts({
          onUndo,
        })
      );

      // Simulate Cmd+Z (metaKey instead of ctrlKey)
      const event = new KeyboardEvent('keydown', {
        key: 'z',
        metaKey: true,
      });

      act(() => {
        document.dispatchEvent(event);
      });

      expect(onUndo).toHaveBeenCalledTimes(1);
    });

    it('should not trigger undo for other key combinations', () => {
      const onUndo = vi.fn();

      renderHook(() =>
        useKeyboardShortcuts({
          onUndo,
        })
      );

      // Simulate Ctrl+A (not undo)
      const event = new KeyboardEvent('keydown', {
        key: 'a',
        ctrlKey: true,
      });

      act(() => {
        document.dispatchEvent(event);
      });

      expect(onUndo).not.toHaveBeenCalled();
    });

    it('should not trigger undo when disabled', () => {
      // Setup: Add a state to the undo stack
      act(() => {
        useStore.getState().saveState();
      });

      const onUndo = vi.fn();

      renderHook(() =>
        useKeyboardShortcuts({
          enableUndo: false,
          onUndo,
        })
      );

      // Simulate Ctrl+Z
      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
      });

      act(() => {
        document.dispatchEvent(event);
      });

      expect(onUndo).not.toHaveBeenCalled();
    });
  });

  describe('Event listener cleanup', () => {
    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { unmount } = renderHook(() => useKeyboardShortcuts());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });
  });
});

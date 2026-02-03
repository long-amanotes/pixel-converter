/**
 * useKeyboardShortcuts hook - Handles keyboard shortcuts for the application
 * 
 * Requirements:
 * - 8.2: Handle Ctrl+Z for undo
 * - 2.3: Handle Ctrl+V for paste image (delegated to useImageLoader)
 * 
 * This hook provides:
 * - Ctrl+Z: Undo last operation
 * - Ctrl+V: Paste image from clipboard (handled by useImageLoader)
 * 
 * Note: Ctrl+V for paste is already handled by useImageLoader hook via
 * document-level paste event listener. This hook focuses on Ctrl+Z for undo.
 */

import { useEffect } from 'react';
import { useStore } from '../store';

export interface UseKeyboardShortcutsOptions {
  /**
   * Enable undo shortcut (Ctrl+Z)
   * @default true
   */
  enableUndo?: boolean;
  
  /**
   * Callback when undo is triggered
   */
  onUndo?: () => void;
  
  /**
   * Callback when undo stack is empty
   */
  onUndoEmpty?: () => void;
}

/**
 * Custom hook for handling keyboard shortcuts
 * 
 * @param options - Configuration options
 */
export const useKeyboardShortcuts = ({
  enableUndo = true,
  onUndo,
  onUndoEmpty,
}: UseKeyboardShortcutsOptions = {}): void => {
  // Get undo action and stack from store
  const undo = useStore((state) => state.undo);
  const undoStack = useStore((state) => state.undoStack);

  useEffect(() => {
    if (!enableUndo) return;

    /**
     * Handle keyboard events
     * Requirement 8.2: Handle Ctrl+Z for undo
     * 
     * @param event - The keyboard event
     */
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+Z (or Cmd+Z on Mac)
      const isUndo = (event.ctrlKey || event.metaKey) && event.key === 'z';
      
      if (isUndo) {
        event.preventDefault();
        
        // Check if undo stack is empty
        if (undoStack.length === 0) {
          // Requirement 8.4: If the undo stack is empty, display an alert message
          onUndoEmpty?.();
          return;
        }
        
        // Perform undo
        undo();
        onUndo?.();
      }
    };

    // Add event listener to document
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enableUndo, undo, undoStack.length, onUndo, onUndoEmpty]);
};

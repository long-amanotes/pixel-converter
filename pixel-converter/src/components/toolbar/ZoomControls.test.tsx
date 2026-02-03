/**
 * Unit tests for ZoomControls component
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ZoomControls } from './ZoomControls';
import { useStore } from '../../store';

describe('ZoomControls', () => {
  beforeEach(() => {
    // Reset store to initial state
    useStore.setState({
      zoomScale: 1.0,
    });
  });

  it('should render zoom slider and percentage display', () => {
    render(<ZoomControls />);
    
    // Check for zoom label
    expect(screen.getByText('Zoom:')).toBeTruthy();
    
    // Check for percentage display (default 100%)
    // MUI slider shows the value in multiple places (slider tooltip and display)
    const percentageElements = screen.getAllByText('100%');
    expect(percentageElements.length).toBeGreaterThan(0);
    
    // Check for slider
    const slider = screen.getByRole('slider', { name: /zoom level/i });
    expect(slider).toBeTruthy();
  });

  it('should display correct percentage for different zoom scales', () => {
    // Test 50% zoom
    useStore.setState({ zoomScale: 0.5 });
    const { rerender } = render(<ZoomControls />);
    // Use getAllByText since MUI slider shows the value in multiple places
    const percentageElements = screen.getAllByText('50%');
    expect(percentageElements.length).toBeGreaterThan(0);
    
    // Test 150% zoom
    useStore.setState({ zoomScale: 1.5 });
    rerender(<ZoomControls />);
    const percentage150 = screen.getAllByText('150%');
    expect(percentage150.length).toBeGreaterThan(0);
    
    // Test 200% zoom
    useStore.setState({ zoomScale: 2.0 });
    rerender(<ZoomControls />);
    const percentage200 = screen.getAllByText('200%');
    expect(percentage200.length).toBeGreaterThan(0);
    
    // Test 10% zoom
    useStore.setState({ zoomScale: 0.1 });
    rerender(<ZoomControls />);
    const percentage10 = screen.getAllByText('10%');
    expect(percentage10.length).toBeGreaterThan(0);
  });

  it('should have correct slider min and max values', () => {
    render(<ZoomControls />);
    
    const slider = screen.getByRole('slider', { name: /zoom level/i });
    expect(slider.getAttribute('aria-valuemin')).toBe('10');
    expect(slider.getAttribute('aria-valuemax')).toBe('200');
  });

  it('should display default zoom of 100%', () => {
    render(<ZoomControls />);
    
    const slider = screen.getByRole('slider', { name: /zoom level/i });
    expect(slider.getAttribute('aria-valuenow')).toBe('100');
  });
});

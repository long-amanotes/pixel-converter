/**
 * Sidebar components barrel export
 * Note: Individual panels are lazy-loaded in PixelEditorPage for better code splitting
 */

export { SidebarComponent } from './SidebarComponent';
export { TabbedSidebar } from './TabbedSidebar';

// Re-export panel types for consumers who need them
export type { SidebarTabItem } from './TabbedSidebar';

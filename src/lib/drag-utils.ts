/**
 * Utility functions for optimized drag-and-drop operations
 */

export interface Position {
  x: number;
  y: number;
}

export interface DragConstraints {
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
}

/**
 * Applies position constraints to ensure component stays within bounds
 */
export const constrainPosition = (
  position: Position, 
  elementSize: { width: number; height: number },
  containerSize: { width: number; height: number },
  customConstraints?: DragConstraints
): Position => {
  const constraints = {
    minX: customConstraints?.minX ?? 0,
    maxX: customConstraints?.maxX ?? containerSize.width - elementSize.width,
    minY: customConstraints?.minY ?? 0,
    maxY: customConstraints?.maxY ?? containerSize.height - elementSize.height,
  };
  
  return {
    x: Math.max(constraints.minX, Math.min(position.x, constraints.maxX)),
    y: Math.max(constraints.minY, Math.min(position.y, constraints.maxY))
  };
};

/**
 * Calculates snap-to-grid position for better alignment
 */
export const snapToGrid = (position: Position, gridSize: number = 20): Position => {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize
  };
};

/**
 * Optimized transform application using GPU-accelerated CSS
 */
export const applyTransform = (
  element: HTMLElement, 
  x: number, 
  y: number, 
  scale: number = 1,
  rotation: number = 0
): void => {
  // Use transform3d for hardware acceleration
  const transform = `translate3d(${x}px, ${y}px, 0) scale(${scale}) rotate(${rotation}deg)`;
  element.style.transform = transform;
  element.style.willChange = 'transform';
};

/**
 * Resets element styles after drag operation
 */
export const resetDragStyles = (element: HTMLElement): void => {
  element.style.transform = '';
  element.style.willChange = '';
  element.style.zIndex = '';
  element.style.cursor = '';
  element.style.transition = 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)';
};

/**
 * Prevents text selection and other interfering behaviors during drag
 */
export const preventDragInterference = (): void => {
  document.body.style.userSelect = 'none';
  document.body.style.webkitUserSelect = 'none';
  document.body.style.pointerEvents = 'none';
  
  // Re-enable for canvas area
  const canvas = document.querySelector('[data-canvas="true"]');
  if (canvas) {
    (canvas as HTMLElement).style.pointerEvents = 'auto';
  }
};

/**
 * Restores normal interaction after drag ends
 */
export const restoreDragInterference = (): void => {
  document.body.style.userSelect = '';
  document.body.style.webkitUserSelect = '';
  document.body.style.pointerEvents = '';
};
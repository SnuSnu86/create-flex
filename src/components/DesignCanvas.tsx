import { useState, useRef, useCallback } from 'react';
import { DesignButton } from './design-components/DesignButton';
import { DesignCard } from './design-components/DesignCard';
import { DesignBentoGrid } from './design-components/DesignBentoGrid';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Move, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { constrainPosition, applyTransform, resetDragStyles, preventDragInterference, restoreDragInterference } from '@/lib/drag-utils';
import { useOptimizedDrag } from '@/hooks/use-performance';
import type { DesignComponent } from './DesignTool';

interface DesignCanvasProps {
  components: DesignComponent[];
  selectedComponent: string | null;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (id: string, updates: Partial<DesignComponent>) => void;
  onDeleteComponent: (id: string) => void;
}

interface DragState {
  isDragging: boolean;
  componentId: string | null;
  startPos: { x: number; y: number };
  elementOffset: { x: number; y: number };
  element: HTMLElement | null;
}

export const DesignCanvas = ({
  components,
  selectedComponent,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent
}: DesignCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { throttledUpdate, cleanup } = useOptimizedDrag();
  const dragStateRef = useRef<DragState>({
    isDragging: false,
    componentId: null,
    startPos: { x: 0, y: 0 },
    elementOffset: { x: 0, y: 0 },
    element: null
  });
  const animationFrameRef = useRef<number | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  // Optimized mouse tracking with RAF
  const updateComponentPosition = useCallback((clientX: number, clientY: number, useSnapping: boolean = false) => {
    const dragState = dragStateRef.current;
    if (!dragState.isDragging || !dragState.element || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    // Calculate new position relative to canvas
    const newX = clientX - canvasRect.left - dragState.elementOffset.x;
    const newY = clientY - canvasRect.top - dragState.elementOffset.y;
    
    // Get element dimensions
    const elementRect = dragState.element.getBoundingClientRect();
    
    // Apply constraints
    const constrainedPos = constrainPosition(
      { x: newX, y: newY },
      { width: elementRect.width, height: elementRect.height },
      { width: canvasRect.width, height: canvasRect.height }
    );
    
    // Apply snap-to-grid if shift key is held
    // const finalPos = useSnapping ? snapToGrid(constrainedPos, 20) : constrainedPos;
    
    // Use optimized transform for immediate visual feedback
    applyTransform(dragState.element, constrainedPos.x, constrainedPos.y, 1.05, 2);
    
    // Store final position for React state update
    dragState.element.dataset.finalX = constrainedPos.x.toString();
    dragState.element.dataset.finalY = constrainedPos.y.toString();
  }, []);

  // RAF-optimized mouse move handler
  const handlePointerMove = useCallback((e: PointerEvent) => {
    e.preventDefault();
    
    // Use throttled RAF updates for 60fps performance
    throttledUpdate(() => {
      updateComponentPosition(e.clientX, e.clientY, e.shiftKey);
    });
  }, [updateComponentPosition, throttledUpdate]);

  // Start drag operation
  const handlePointerDown = useCallback((e: React.PointerEvent, componentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = e.currentTarget as HTMLElement;
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    // Calculate where within the element the user clicked
    const elementRect = element.getBoundingClientRect();
    const offsetX = e.clientX - elementRect.left;
    const offsetY = e.clientY - elementRect.top;
    
    dragStateRef.current = {
      isDragging: true,
      componentId,
      startPos: { x: e.clientX, y: e.clientY },
      elementOffset: { x: offsetX, y: offsetY },
      element
    };
    
    setIsDragActive(true);
    onSelectComponent(componentId);
    
    // Set pointer capture for better tracking
    element.setPointerCapture(e.pointerId);
    
    // Prevent interference
    preventDragInterference();
    
    // Add global event listeners
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    
    // Visual feedback
    element.style.transition = 'none';
    element.style.zIndex = '1000';
    element.style.filter = 'drop-shadow(0 20px 25px rgba(0,0,0,0.3))';
  }, [handlePointerMove, onSelectComponent, components]);

  // End drag operation
  const handlePointerUp = useCallback((e: PointerEvent) => {
    const dragState = dragStateRef.current;
    
    if (dragState.isDragging && dragState.componentId && dragState.element) {
      // Get final position from transform
      const finalX = parseInt(dragState.element.dataset.finalX || '0');
      const finalY = parseInt(dragState.element.dataset.finalY || '0');
      
      // Update React state with final position
      onUpdateComponent(dragState.componentId, {
        position: { x: finalX, y: finalY }
      });
      
      // Reset element styles
      resetDragStyles(dragState.element);
      
      // Clean up dataset
      delete dragState.element.dataset.finalX;
      delete dragState.element.dataset.finalY;
    }
    
    // Reset drag state
    dragStateRef.current = {
      isDragging: false,
      componentId: null,
      startPos: { x: 0, y: 0 },
      elementOffset: { x: 0, y: 0 },
      element: null
    };
    
    setIsDragActive(false);
    
    // Remove global event listeners
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
    
    // Cleanup performance optimizations
    cleanup();
    
    // Restore normal interaction
    restoreDragInterference();
  }, [handlePointerMove, onUpdateComponent, cleanup]);

  const renderComponent = (component: DesignComponent) => {
    const commonProps = {
      ...component.props,
      isSelected: selectedComponent === component.id
    };

    switch (component.type) {
      case 'button':
        return <DesignButton {...commonProps} />;
      case 'card':
        return <DesignCard {...commonProps} />;
      case 'bento-grid':
        return <DesignBentoGrid {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 bg-canvas relative overflow-hidden">
      {/* Canvas Header */}
      <div className="absolute top-0 left-0 right-0 bg-surface/90 backdrop-blur-sm border-b border-border z-10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              Canvas
            </Badge>
            <span className="text-sm text-muted-foreground">
              1200 × 800px
            </span>
            {isDragActive && (
              <Badge variant="secondary" className="text-xs animate-pulse">
                Dragging...
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        ref={canvasRef}
        data-canvas="true"
        className={cn(
          "absolute inset-0 top-16 select-none",
          isDragActive && "cursor-grabbing"
        )}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onSelectComponent(null);
          }
        }}
      >
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />

        {/* Components */}
        {components.map(component => {
          const isSelected = selectedComponent === component.id;
          const isDragging = dragStateRef.current.componentId === component.id;
          
          return (
            <div
              key={component.id}
              className={cn(
                'absolute transition-all duration-300 transform-gpu group',
                'cursor-grab active:cursor-grabbing',
                isSelected && !isDragging && 'ring-2 ring-accent ring-offset-2',
                'hover:shadow-xl hover:shadow-primary/20',
                !isDragging && 'hover:scale-[1.02]',
                isDragging && 'scale-110 rotate-2 shadow-2xl'
              )}
              style={{
                left: component.position.x,
                top: component.position.y,
                zIndex: isSelected ? 20 : 10,
                touchAction: 'none' // Prevent touch scrolling during drag
              }}
              onPointerDown={(e) => handlePointerDown(e, component.id)}
              onClick={(e) => {
                e.stopPropagation();
                if (!dragStateRef.current.isDragging) {
                  onSelectComponent(component.id);
                }
              }}
            >
              {/* Component Content */}
              <div className="pointer-events-none">
                {renderComponent(component)}
              </div>
              
              {/* Selection Controls */}
              {isSelected && !isDragging && (
                <div className="absolute -top-12 left-0 flex items-center gap-1 bg-primary rounded-lg p-1 animate-slide-up shadow-lg">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-primary-foreground hover:bg-primary-foreground/20 hover:scale-110 transition-all duration-200 pointer-events-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onDeleteComponent(component.id);
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation(); // Prevent drag initiation
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                  <div className="w-px h-4 bg-primary-foreground/30" />
                  <div className="px-3 text-xs text-primary-foreground font-medium">
                    {component.type}
                  </div>
                  <Move className="w-3 h-3 text-primary-foreground/60 ml-1" />
                </div>
              )}
              
              {/* Drag Handle Indicator */}
              {isSelected && !isDragging && (
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent rounded-full border-2 border-background animate-bounce-gentle opacity-80" />
              )}
            </div>
          );
        })}

        {/* Empty State */}
        {components.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6 animate-float">
                <Move className="w-10 h-10 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3 bg-gradient-primary bg-clip-text text-transparent">
                Start Building
              </h3>
              <p className="text-muted-foreground max-w-sm leading-relaxed">
                Drag components from the library to start designing your interface. 
                Click to select and customize their properties.
              </p>
            </div>
          </div>
        )}
        
        {/* Drag Overlay for Better Performance */}
        {isDragActive && (
          <div className="absolute inset-0 bg-transparent z-50 pointer-events-none" />
        )}
      </div>
    </div>
  );
};
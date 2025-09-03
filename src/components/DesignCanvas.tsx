import { useState, useRef, useCallback } from 'react';
import { DesignButton } from './design-components/DesignButton';
import { DesignCard } from './design-components/DesignCard';
import { DesignBentoGrid } from './design-components/DesignBentoGrid';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Move, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  // Offset from mouse to component's top-left corner
  dragOffset: { x: number; y: number };
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
  const dragStateRef = useRef<DragState>({
    isDragging: false,
    componentId: null,
    dragOffset: { x: 0, y: 0 },
    element: null
  });
  const [isDragActive, setIsDragActive] = useState(false);

  // Get canvas-relative coordinates from mouse position
  const getCanvasCoordinates = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    return {
      x: clientX - canvasRect.left,
      y: clientY - canvasRect.top
    };
  }, []);

  // Update component position with smooth transform
  const updateComponentPosition = useCallback((clientX: number, clientY: number) => {
    const dragState = dragStateRef.current;
    if (!dragState.isDragging || !dragState.element || !canvasRef.current) return;

    // Get mouse position relative to canvas
    const mouseCanvasPos = getCanvasCoordinates(clientX, clientY);
    
    // Calculate new component position (mouse position minus click offset)
    const newPosition = {
      x: mouseCanvasPos.x - dragState.dragOffset.x,
      y: mouseCanvasPos.y - dragState.dragOffset.y
    };
    
    // Apply constraints to keep component within canvas
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const elementRect = dragState.element.getBoundingClientRect();
    
    const constrainedPosition = {
      x: Math.max(0, Math.min(newPosition.x, canvasRect.width - elementRect.width)),
      y: Math.max(0, Math.min(newPosition.y, canvasRect.height - elementRect.height))
    };
    
    // Apply transform for immediate visual feedback (GPU accelerated)
    dragState.element.style.transform = `translate3d(${constrainedPosition.x}px, ${constrainedPosition.y}px, 0) scale(1.05)`;
    dragState.element.style.zIndex = '1000';
    dragState.element.style.filter = 'drop-shadow(0 20px 25px rgba(0,0,0,0.3))';
    
    // Update React state immediately to prevent position jumping
    if (dragState.componentId) {
      onUpdateComponent(dragState.componentId, {
        position: constrainedPosition
      });
    }
  }, [getCanvasCoordinates]);

  // Optimized mouse move handler using RAF
  const handlePointerMove = useCallback((e: PointerEvent) => {
    e.preventDefault();
    
    requestAnimationFrame(() => {
      updateComponentPosition(e.clientX, e.clientY);
    });
  }, [updateComponentPosition]);

  // Start drag operation
  const handlePointerDown = useCallback((e: React.PointerEvent, componentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const componentWrapper = e.currentTarget as HTMLElement;
    if (!canvasRef.current) return;
    
    // Get current component data
    const component = components.find(c => c.id === componentId);
    if (!component) return;
    
    // Get mouse position relative to canvas
    const mouseCanvasPos = getCanvasCoordinates(e.clientX, e.clientY);
    
    // Calculate offset: where within the component did the user click?
    // This is the distance from the component's top-left corner to the click point
    const dragOffset = {
      x: mouseCanvasPos.x - component.position.x,
      y: mouseCanvasPos.y - component.position.y
    };
    
    // Set up drag state
    dragStateRef.current = {
      isDragging: true,
      componentId,
      dragOffset,
      element: componentWrapper
    };
    
    setIsDragActive(true);
    onSelectComponent(componentId);
    
    // Set pointer capture for reliable tracking
    componentWrapper.setPointerCapture(e.pointerId);
    
    // Prevent text selection and other interference
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    
    // Add global event listeners
    document.addEventListener('pointermove', handlePointerMove, { passive: false });
    document.addEventListener('pointerup', handlePointerUp);
    
    // Initial transform setup
    componentWrapper.style.transition = 'none';
    componentWrapper.style.willChange = 'transform';
    componentWrapper.style.cursor = 'grabbing';
    
  }, [components, getCanvasCoordinates, handlePointerMove, onSelectComponent]);

  // End drag operation
  const handlePointerUp = useCallback((e: PointerEvent) => {
    const dragState = dragStateRef.current;
    
    if (dragState.isDragging && dragState.componentId && dragState.element) {
      // Get current component state to maintain position
      const component = components.find(c => c.id === dragState.componentId);
      if (component) {
        const finalPosition = component.position;
        
        // Reset element styles with smooth transition back to current state position
        dragState.element.style.transition = 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)';
        dragState.element.style.transform = `translate3d(${finalPosition.x}px, ${finalPosition.y}px, 0) scale(1)`;
      }
    } else {
      // Reset styles if no successful drag
      dragState.element.style.transition = 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)';
      dragState.element.style.transform = '';
    }
    
    // Reset common drag styles
    if (dragState.element) {
      dragState.element.style.filter = '';
      dragState.element.style.zIndex = '';
      dragState.element.style.cursor = '';
      dragState.element.style.willChange = '';
    }
    
    // Reset drag state
    dragStateRef.current = {
      isDragging: false,
      componentId: null,
      dragOffset: { x: 0, y: 0 },
      element: null
    };
    
    setIsDragActive(false);
    
    // Remove global event listeners
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
    
    // Restore normal interaction
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';

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
        className={cn(
          "absolute inset-0 top-16",
          isDragActive && "cursor-grabbing"
        )}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onSelectComponent(null);
          }
        }}
        style={{ touchAction: 'none' }}
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
                'absolute cursor-grab group select-none',
                isSelected && !isDragging && 'ring-2 ring-accent ring-offset-2 ring-offset-canvas',
                isDragging && 'cursor-grabbing',
                !isDragging && 'transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20'
              )}
              style={{
                transform: `translate3d(${component.position.x}px, ${component.position.y}px, 0)`,
                transformOrigin: 'top left',
                touchAction: 'none'
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
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent rounded-full border-2 border-canvas animate-bounce-gentle opacity-80" />
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
      </div>
    </div>
  );
};
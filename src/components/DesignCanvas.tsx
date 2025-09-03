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
  startMousePos: { x: number; y: number };
  startComponentPos: { x: number; y: number };
  dragOffset: { x: number; y: number };
}

export const DesignCanvas = ({
  components,
  selectedComponent,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent
}: DesignCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    componentId: null,
    startMousePos: { x: 0, y: 0 },
    startComponentPos: { x: 0, y: 0 },
    dragOffset: { x: 0, y: 0 }
  });

  // Convert mouse coordinates to canvas-relative coordinates
  const getCanvasCoordinates = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    return {
      x: clientX - canvasRect.left,
      y: clientY - canvasRect.top
    };
  }, []);

  // Start dragging
  const handleMouseDown = useCallback((e: React.MouseEvent, componentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const component = components.find(c => c.id === componentId);
    if (!component) return;
    
    // Get mouse position in canvas coordinates
    const mouseCanvasPos = getCanvasCoordinates(e.clientX, e.clientY);
    
    // Calculate offset from component's top-left to mouse position
    const offset = {
      x: mouseCanvasPos.x - component.position.x,
      y: mouseCanvasPos.y - component.position.y
    };
    
    console.log('Starting drag:', {
      componentId,
      mouseCanvasPos,
      componentPos: component.position,
      offset
    });
    
    setDragState({
      isDragging: true,
      componentId,
      startMousePos: mouseCanvasPos,
      startComponentPos: component.position,
      dragOffset: offset
    });
    
    onSelectComponent(componentId);
    
    // Add global mouse event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Prevent text selection
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
  }, [components, getCanvasCoordinates, onSelectComponent]);

  // Handle mouse move during drag
  const handleMouseMove = (e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.componentId) return;
    
    e.preventDefault();
    
    // Get current mouse position in canvas coordinates
    const mouseCanvasPos = getCanvasCoordinates(e.clientX, e.clientY);
    
    // Calculate new component position
    const newPosition = {
      x: mouseCanvasPos.x - dragState.dragOffset.x,
      y: mouseCanvasPos.y - dragState.dragOffset.y
    };
    
    // Apply constraints to keep component in canvas bounds
    const constrainedPosition = {
      x: Math.max(0, Math.min(newPosition.x, 1200 - 200)), // Assume 200px component width
      y: Math.max(0, Math.min(newPosition.y, 800 - 100))   // Assume 100px component height
    };
    
    console.log('Dragging:', {
      mouseCanvasPos,
      newPosition,
      constrainedPosition,
      offset: dragState.dragOffset
    });
    
    // Update component position immediately
    onUpdateComponent(dragState.componentId, {
      position: constrainedPosition
    });
  };

  // End dragging
  const handleMouseUp = (e: MouseEvent) => {
    console.log('Drag ended');
    
    // Clean up global event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    // Restore text selection
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    
    // Reset drag state
    setDragState({
      isDragging: false,
      componentId: null,
      startMousePos: { x: 0, y: 0 },
      startComponentPos: { x: 0, y: 0 },
      dragOffset: { x: 0, y: 0 }
    });
  };

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
            {dragState.isDragging && (
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
          dragState.isDragging && "cursor-grabbing"
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

        {/* Debug Info */}
        <div className="absolute top-4 left-4 bg-black/70 text-white p-2 rounded text-xs font-mono z-10 pointer-events-none">
          <div>Components: {components.length}</div>
          <div>Selected: {selectedComponent || 'none'}</div>
          <div>Dragging: {dragState.isDragging ? dragState.componentId : 'none'}</div>
        </div>

        {/* Components */}
        {components.map(component => {
          const isSelected = selectedComponent === component.id;
          const isDragging = dragState.componentId === component.id && dragState.isDragging;
          
          // Validate position to prevent invalid rendering
          const validPosition = {
            x: typeof component.position.x === 'number' && !isNaN(component.position.x) ? component.position.x : 50,
            y: typeof component.position.y === 'number' && !isNaN(component.position.y) ? component.position.y : 50
          };
          
          return (
            <div
              key={component.id}
              className={cn(
                'absolute cursor-grab group select-none',
                isSelected && !isDragging && 'ring-2 ring-accent ring-offset-2 ring-offset-canvas',
                isDragging && 'cursor-grabbing z-50',
                !isDragging && 'transition-all duration-200 hover:scale-[1.02] hover:shadow-lg'
              )}
              style={{
                left: `${validPosition.x}px`,
                top: `${validPosition.y}px`,
                zIndex: isDragging ? 1000 : isSelected ? 100 : 'auto'
              }}
              onMouseDown={(e) => handleMouseDown(e, component.id)}
              onClick={(e) => {
                e.stopPropagation();
                if (!dragState.isDragging) {
                  onSelectComponent(component.id);
                }
              }}
            >
              {/* Component Content */}
              <div className={isDragging ? 'pointer-events-none' : 'pointer-events-auto'}>
                {renderComponent(component)}
              </div>
              
              {/* Selection Controls */}
              {isSelected && !isDragging && (
                <div className="absolute -top-12 left-0 flex items-center gap-1 bg-primary rounded-lg p-1 animate-slide-up shadow-lg z-20">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-primary-foreground hover:bg-primary-foreground/20 hover:scale-110 transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onDeleteComponent(component.id);
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
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent rounded-full border-2 border-canvas animate-bounce-gentle opacity-80 pointer-events-none" />
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
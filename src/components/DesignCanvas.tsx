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
  initialMouseX: number;
  initialMouseY: number;
  initialComponentX: number;
  initialComponentY: number;
  offsetX: number;
  offsetY: number;
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
    initialMouseX: 0,
    initialMouseY: 0,
    initialComponentX: 0,
    initialComponentY: 0,
    offsetX: 0,
    offsetY: 0
  });

  const getCanvasCoordinates = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: clientX, y: clientY };
    
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent, componentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const component = components.find(c => c.id === componentId);
    if (!component) return;

    const canvasPos = getCanvasCoordinates(e.clientX, e.clientY);
    
    // Calculate offset from component top-left to mouse position
    const offsetX = canvasPos.x - component.position.x;
    const offsetY = canvasPos.y - component.position.y;

    console.log('Mouse Down:', {
      componentId,
      canvasPos,
      componentPos: component.position,
      offset: { offsetX, offsetY }
    });

    setDragState({
      isDragging: true,
      componentId,
      initialMouseX: canvasPos.x,
      initialMouseY: canvasPos.y,
      initialComponentX: component.position.x,
      initialComponentY: component.position.y,
      offsetX,
      offsetY
    });

    onSelectComponent(componentId);

    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.componentId) return;

    e.preventDefault();
    
    const canvasPos = getCanvasCoordinates(e.clientX, e.clientY);
    
    // Calculate new position: mouse position minus the original click offset
    const newX = canvasPos.x - dragState.offsetX;
    const newY = canvasPos.y - dragState.offsetY;

    // Apply constraints to keep component in bounds
    const constrainedX = Math.max(0, Math.min(newX, 1200 - 200));
    const constrainedY = Math.max(0, Math.min(newY, 800 - 100));

    console.log('Mouse Move:', {
      canvasPos,
      newPos: { x: newX, y: newY },
      constrainedPos: { x: constrainedX, y: constrainedY },
      offset: { x: dragState.offsetX, y: dragState.offsetY }
    });

    // Update component position immediately
    onUpdateComponent(dragState.componentId, {
      position: { x: constrainedX, y: constrainedY }
    });
  }, [dragState, onUpdateComponent]);

  const handleMouseUp = useCallback(() => {
    console.log('Mouse Up - Ending drag');
    
    setDragState({
      isDragging: false,
      componentId: null,
      initialMouseX: 0,
      initialMouseY: 0,
      initialComponentX: 0,
      initialComponentY: 0,
      offsetX: 0,
      offsetY: 0
    });

    // Restore text selection
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
  }, []);

  // Add/remove global event listeners
  React.useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

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
                Dragging {dragState.componentId}...
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
        <div className="absolute top-4 left-4 bg-black/70 text-white p-2 rounded text-xs font-mono z-[5] pointer-events-none">
          <div>Components: {components.length}</div>
          <div>Selected: {selectedComponent || 'none'}</div>
          <div>Dragging: {dragState.isDragging ? dragState.componentId : 'none'}</div>
        </div>

        {/* Components */}
        {components.map(component => {
          const isSelected = selectedComponent === component.id;
          const isDragging = dragState.componentId === component.id && dragState.isDragging;
          
          // Ensure valid position
          const position = {
            x: typeof component.position?.x === 'number' && !isNaN(component.position.x) ? component.position.x : 50,
            y: typeof component.position?.y === 'number' && !isNaN(component.position.y) ? component.position.y : 50
          };
          
          console.log(`Rendering component ${component.id}:`, { position, isDragging, isSelected });
          
          return (
            <div
              key={component.id}
              className={cn(
                'absolute group select-none',
                isDragging ? 'cursor-grabbing z-50' : 'cursor-grab',
                isSelected && !isDragging && 'ring-2 ring-accent ring-offset-2 ring-offset-canvas',
                !isDragging && 'transition-all duration-200 hover:scale-[1.02] hover:shadow-lg'
              )}
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                zIndex: isDragging ? 1000 : isSelected ? 100 : 10
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
              <div>
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
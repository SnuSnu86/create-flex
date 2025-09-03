import { useState, useRef } from 'react';
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

export const DesignCanvas = ({
  components,
  selectedComponent,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent
}: DesignCanvasProps) => {
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, componentId: string) => {
    if (e.target !== e.currentTarget) return;
    
    const component = components.find(c => c.id === componentId);
    if (!component) return;

    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setDraggedComponent(componentId);
    onSelectComponent(componentId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedComponent || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;

    onUpdateComponent(draggedComponent, {
      position: { 
        x: Math.max(0, Math.min(newX, canvasRect.width - 200)), 
        y: Math.max(0, Math.min(newY, canvasRect.height - 100))
      }
    });
  };

  const handleMouseUp = () => {
    setDraggedComponent(null);
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
        className="absolute inset-0 top-16"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onSelectComponent(null);
          }
        }}
      >
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
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
          const isDragging = draggedComponent === component.id;
          
          return (
            <div
              key={component.id}
              className={cn(
                'absolute cursor-move transition-all duration-300 transform-gpu',
                selectedComponent === component.id && 'ring-2 ring-accent ring-offset-2 animate-pulse-soft',
                'hover:shadow-xl hover:shadow-primary/10 hover:scale-105',
                isDragging && 'scale-110 rotate-2 shadow-2xl z-50'
              )}
              style={{
                left: component.position.x,
                top: component.position.y,
                zIndex: selectedComponent === component.id ? 20 : (isDragging ? 50 : 10)
              }}
              onMouseDown={(e) => handleMouseDown(e, component.id)}
            >
              {renderComponent(component)}
              
              {/* Selection Controls */}
              {selectedComponent === component.id && (
                <div className="absolute -top-10 left-0 flex items-center gap-1 bg-primary rounded-md p-1 animate-slide-up">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary-foreground/20 hover:scale-110 transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteComponent(component.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                  <div className="w-px h-4 bg-primary-foreground/20" />
                  <div className="px-2 text-xs text-primary-foreground font-medium">
                    {component.type}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Empty State */}
        {components.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Move className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Start Building
              </h3>
              <p className="text-muted-foreground max-w-sm">
                Drag components from the library to start designing your interface
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
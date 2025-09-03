import { useState } from 'react';
import { ComponentLibrary } from './ComponentLibrary';
import { DesignCanvas } from './DesignCanvas';
import { PropertiesPanel } from './PropertiesPanel';
import { ToolHeader } from './ToolHeader';
import { ThemeProvider } from './ThemeProvider';

export interface DesignComponent {
  id: string;
  type: 'button' | 'card' | 'bento-grid';
  props: Record<string, any>;
  position: { x: number; y: number };
}

export const DesignTool = () => {
  const [components, setComponents] = useState<DesignComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState('dark-pro');

  const addComponent = (type: DesignComponent['type']) => {
    const newComponent: DesignComponent = {
      id: `${type}-${Date.now()}`,
      type,
      props: getDefaultProps(type),
      position: { x: 50, y: 50 }
    };
    setComponents([...components, newComponent]);
    setSelectedComponent(newComponent.id);
  };

  const updateComponent = (id: string, updates: Partial<DesignComponent>) => {
    setComponents(components.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    ));
  };

  const deleteComponent = (id: string) => {
    setComponents(components.filter(comp => comp.id !== id));
    if (selectedComponent === id) {
      setSelectedComponent(null);
    }
  };

  const getDefaultProps = (type: DesignComponent['type']) => {
    switch (type) {
      case 'button':
        return {
          variant: 'primary',
          size: 'md',
          children: 'Button Text',
          disabled: false
        };
      case 'card':
        return {
          title: 'Card Title',
          description: 'Card description goes here',
          showImage: false
        };
      case 'bento-grid':
        return {
          columns: 3,
          rows: 2,
          items: [
            { id: 1, title: 'Item 1', span: { col: 1, row: 1 } },
            { id: 2, title: 'Item 2', span: { col: 1, row: 1 } },
            { id: 3, title: 'Item 3', span: { col: 1, row: 1 } }
          ]
        };
      default:
        return {};
    }
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <div className="min-h-screen bg-background font-sans">
        <ToolHeader 
          currentTheme={currentTheme}
          onThemeChange={setCurrentTheme}
          components={components}
        />
        
        <div className="flex h-[calc(100vh-4rem)]">
          <ComponentLibrary onAddComponent={addComponent} />
          
          <DesignCanvas
            components={components}
            selectedComponent={selectedComponent}
            onSelectComponent={setSelectedComponent}
            onUpdateComponent={updateComponent}
            onDeleteComponent={deleteComponent}
          />
          
          <PropertiesPanel
            selectedComponent={selectedComponent ? 
              components.find(c => c.id === selectedComponent) : null
            }
            onUpdateComponent={updateComponent}
          />
        </div>
      </div>
    </ThemeProvider>
  );
};
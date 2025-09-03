import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings, Palette, Type, Layout, Move } from 'lucide-react';
import type { DesignComponent } from './DesignTool';

interface PropertiesPanelProps {
  selectedComponent: DesignComponent | null;
  onUpdateComponent: (id: string, updates: Partial<DesignComponent>) => void;
}

export const PropertiesPanel = ({ selectedComponent, onUpdateComponent }: PropertiesPanelProps) => {
  const [activeTab, setActiveTab] = useState<'style' | 'layout' | 'content'>('style');

  if (!selectedComponent) {
    return (
      <div className="w-80 bg-panel border-l border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Properties</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">
              Select a component to edit its properties
            </p>
          </div>
        </div>
      </div>
    );
  }

  const updateProps = (newProps: Record<string, any>) => {
    onUpdateComponent(selectedComponent.id, {
      props: { ...selectedComponent.props, ...newProps }
    });
  };

  const updatePosition = (newPosition: { x: number; y: number }) => {
    onUpdateComponent(selectedComponent.id, { position: newPosition });
  };

  const tabs = [
    { id: 'style' as const, label: 'Style', icon: Palette },
    { id: 'layout' as const, label: 'Layout', icon: Layout },
    { id: 'content' as const, label: 'Content', icon: Type }
  ];

  return (
    <div className="w-80 bg-panel border-l border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Properties</h2>
          <Badge variant="outline" className="text-xs">
            {selectedComponent.type}
          </Badge>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-muted rounded-lg p-1">
          {tabs.map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 text-xs h-8"
            >
              <tab.icon className="w-3 h-3 mr-1" />
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === 'style' && (
          <>
            {selectedComponent.type === 'button' && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Button Style</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs font-medium mb-2 block">Variant</Label>
                    <Select 
                      value={selectedComponent.props.variant || 'primary'} 
                      onValueChange={(value) => updateProps({ variant: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary</SelectItem>
                        <SelectItem value="secondary">Secondary</SelectItem>
                        <SelectItem value="outline">Outline</SelectItem>
                        <SelectItem value="ghost">Ghost</SelectItem>
                        <SelectItem value="destructive">Destructive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-xs font-medium mb-2 block">Size</Label>
                    <Select 
                      value={selectedComponent.props.size || 'md'} 
                      onValueChange={(value) => updateProps({ size: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sm">Small</SelectItem>
                        <SelectItem value="md">Medium</SelectItem>
                        <SelectItem value="lg">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Disabled</Label>
                    <Switch
                      checked={selectedComponent.props.disabled || false}
                      onCheckedChange={(checked) => updateProps({ disabled: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedComponent.type === 'card' && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Card Style</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Show Image</Label>
                    <Switch
                      checked={selectedComponent.props.showImage || false}
                      onCheckedChange={(checked) => updateProps({ showImage: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {activeTab === 'layout' && (
          <>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Move className="w-4 h-4" />
                  Position
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium mb-2 block">X</Label>
                    <Input
                      type="number"
                      value={selectedComponent.position.x}
                      onChange={(e) => updatePosition({
                        ...selectedComponent.position,
                        x: parseInt(e.target.value) || 0
                      })}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium mb-2 block">Y</Label>
                    <Input
                      type="number"
                      value={selectedComponent.position.y}
                      onChange={(e) => updatePosition({
                        ...selectedComponent.position,
                        y: parseInt(e.target.value) || 0
                      })}
                      className="h-8"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedComponent.type === 'bento-grid' && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Grid Layout</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs font-medium mb-2 block">
                      Columns: {selectedComponent.props.columns || 3}
                    </Label>
                    <Slider
                      value={[selectedComponent.props.columns || 3]}
                      onValueChange={([value]) => updateProps({ columns: value })}
                      min={2}
                      max={6}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs font-medium mb-2 block">
                      Rows: {selectedComponent.props.rows || 2}
                    </Label>
                    <Slider
                      value={[selectedComponent.props.rows || 2]}
                      onValueChange={([value]) => updateProps({ rows: value })}
                      min={1}
                      max={4}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {activeTab === 'content' && (
          <>
            {selectedComponent.type === 'button' && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Button Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label className="text-xs font-medium mb-2 block">Text</Label>
                    <Input
                      value={selectedComponent.props.children || ''}
                      onChange={(e) => updateProps({ children: e.target.value })}
                      placeholder="Button text"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedComponent.type === 'card' && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Card Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs font-medium mb-2 block">Title</Label>
                    <Input
                      value={selectedComponent.props.title || ''}
                      onChange={(e) => updateProps({ title: e.target.value })}
                      placeholder="Card title"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs font-medium mb-2 block">Description</Label>
                    <Textarea
                      value={selectedComponent.props.description || ''}
                      onChange={(e) => updateProps({ description: e.target.value })}
                      placeholder="Card description"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};
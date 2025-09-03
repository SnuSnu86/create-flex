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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Palette, Type, Layout, Paintbrush, ListOrdered as BorderAll, Move, Zap } from 'lucide-react';
import type { DesignComponent } from './DesignTool';

interface PropertiesPanelProps {
  selectedComponent: DesignComponent | null;
  onUpdateComponent: (id: string, updates: Partial<DesignComponent>) => void;
}

export const PropertiesPanel = ({ selectedComponent, onUpdateComponent }: PropertiesPanelProps) => {
  const [activeTab, setActiveTab] = useState<'style' | 'layout' | 'content'>('style');
  const [colorMode, setColorMode] = useState<'hex' | 'rgb' | 'hsl'>('hex');

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

  const updateStyle = (styleUpdates: Record<string, any>) => {
    const currentStyle = selectedComponent.props.customStyle || {};
    updateProps({
      customStyle: { ...currentStyle, ...styleUpdates }
    });
  };

  const tabs = [
    { id: 'style' as const, label: 'Style', icon: Palette },
    { id: 'layout' as const, label: 'Layout', icon: Layout },
    { id: 'content' as const, label: 'Content', icon: Type }
  ];

  const ColorPicker = ({ 
    label, 
    value, 
    onChange 
  }: { 
    label: string; 
    value?: string; 
    onChange: (color: string) => void;
  }) => (
    <div className="space-y-2">
      <Label className="text-xs font-medium">{label}</Label>
      <div className="flex items-center gap-2">
        <div 
          className="w-8 h-8 rounded border border-border cursor-pointer relative hover:scale-110 transition-transform"
          style={{ backgroundColor: value || '#8b5cf6' }}
          onClick={(event) => {
            const clickedElement = event.currentTarget as HTMLElement;
            const rect = clickedElement.getBoundingClientRect();
            
            // Create color input with proper positioning
            const colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.value = value || '#8b5cf6';
            
            // Critical: Make input visible but positioned correctly
            colorInput.style.position = 'fixed';
            colorInput.style.zIndex = '9999';
            colorInput.style.opacity = '0.01'; // Nearly invisible but not 0
            colorInput.style.width = '40px';
            colorInput.style.height = '40px';
            colorInput.style.border = 'none';
            colorInput.style.outline = 'none';
            colorInput.style.cursor = 'pointer';
            
            // Calculate optimal position
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const pickerWidth = 300; // Estimated color picker width
            const pickerHeight = 400; // Estimated color picker height
            
            // Position relative to clicked element, but handle screen boundaries
            let left = rect.left + rect.width / 2 - 20; // Center on the color square
            let top = rect.top + rect.height / 2 - 20;
            
            // Handle right edge overflow
            if (left + pickerWidth > viewportWidth) {
              left = viewportWidth - pickerWidth - 20;
            }
            
            // Handle left edge overflow
            if (left < 20) {
              left = 20;
            }
            
            // Handle bottom edge overflow
            if (top + pickerHeight > viewportHeight) {
              top = rect.top - pickerHeight - 10; // Position above the element
            }
            
            // Handle top edge overflow
            if (top < 20) {
              top = 20;
            }
            
            // Apply calculated position
            colorInput.style.left = `${left}px`;
            colorInput.style.top = `${top}px`;
            
            // Append to body and trigger
            document.body.appendChild(colorInput);
            
            // Small delay to ensure proper positioning before opening
            requestAnimationFrame(() => {
              colorInput.click();
              colorInput.focus();
            });
            
            // Handle color change
            const handleChange = (e: Event) => {
              const newColor = (e.target as HTMLInputElement).value;
              onChange(newColor);
              cleanup();
            };
            
            // Handle real-time input changes (while dragging in color picker)
            const handleInput = (e: Event) => {
              const newColor = (e.target as HTMLInputElement).value;
              onChange(newColor);
            };
            
            // Handle cleanup
            const cleanup = () => {
              colorInput.removeEventListener('change', handleChange);
              colorInput.removeEventListener('input', handleInput);
              colorInput.removeEventListener('blur', handleBlur);
              if (colorInput.parentElement) {
                colorInput.remove();
              }
            };
            
            // Handle blur (when user clicks outside or closes picker)
            const handleBlur = () => {
              setTimeout(cleanup, 100); // Small delay to allow change event
            };
            
            colorInput.addEventListener('change', handleChange);
            colorInput.addEventListener('input', handleInput);
            colorInput.addEventListener('blur', handleBlur);
            
            // Fallback cleanup after 10 seconds
            setTimeout(() => {
              if (colorInput.parentElement) {
                cleanup();
              }
            }, 10000);
          }}
        />
        <Input
          value={value || '#8b5cf6'}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#8b5cf6"
          className="flex-1 h-8 text-xs font-mono focus:ring-2 focus:ring-primary focus:outline-none"
        />
      </div>
      <Tabs value={colorMode} onValueChange={(v) => setColorMode(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-7">
          <TabsTrigger value="hex" className="text-xs">HEX</TabsTrigger>
          <TabsTrigger value="rgb" className="text-xs">RGB</TabsTrigger>
          <TabsTrigger value="hsl" className="text-xs">HSL</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );

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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'style' && (
          <>
            {/* Basic Styling */}
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

            {/* Colors */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Paintbrush className="w-4 h-4" />
                  Colors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ColorPicker
                  label="Text Color"
                  value={selectedComponent.props.customStyle?.color}
                  onChange={(color) => updateStyle({ color })}
                />
                <ColorPicker
                  label="Background Color"
                  value={selectedComponent.props.customStyle?.backgroundColor}
                  onChange={(backgroundColor) => updateStyle({ backgroundColor })}
                />
                <ColorPicker
                  label="Border Color"
                  value={selectedComponent.props.customStyle?.borderColor}
                  onChange={(borderColor) => updateStyle({ borderColor })}
                />
                
                {selectedComponent.type === 'card' && (
                  <div className="pt-2 border-t border-border/30">
                    <p className="text-xs text-muted-foreground mb-2">
                      💡 Background replaces the gradient effect
                    </p>
                  </div>
                )}
                
                {selectedComponent.type === 'bento-grid' && (
                  <div className="pt-2 border-t border-border/30">
                    <p className="text-xs text-muted-foreground mb-2">
                      💡 Background applies to all grid items
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Border Controls */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BorderAll className="w-4 h-4" />
                  Border & Effects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs font-medium mb-2 block">
                    Border Width: {selectedComponent.props.customStyle?.borderWidth || 1}px
                  </Label>
                  <Slider
                    value={[parseInt(selectedComponent.props.customStyle?.borderWidth) || 1]}
                    onValueChange={([value]) => updateStyle({ borderWidth: `${value}px` })}
                    min={0}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium mb-2 block">Border Style</Label>
                  <Select 
                    value={selectedComponent.props.customStyle?.borderStyle || 'solid'} 
                    onValueChange={(value) => updateStyle({ borderStyle: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="dashed">Dashed</SelectItem>
                      <SelectItem value="dotted">Dotted</SelectItem>
                      <SelectItem value="double">Double</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-medium mb-2 block">
                    Border Radius: {selectedComponent.props.customStyle?.borderRadius || 8}px
                  </Label>
                  <Slider
                    value={[parseInt(selectedComponent.props.customStyle?.borderRadius) || 8]}
                    onValueChange={([value]) => updateStyle({ borderRadius: `${value}px` })}
                    min={0}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium mb-2 block">
                    Box Shadow: {selectedComponent.props.customStyle?.boxShadowIntensity || 0}
                  </Label>
                  <Slider
                    value={[selectedComponent.props.customStyle?.boxShadowIntensity || 0]}
                    onValueChange={([value]) => {
                      const shadows = [
                        'none',
                        '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                        '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                        '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                      ];
                      updateStyle({ 
                        boxShadow: shadows[value],
                        boxShadowIntensity: value 
                      });
                    }}
                    min={0}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Typography */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Typography
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs font-medium mb-2 block">Font Family</Label>
                  <Select 
                    value={selectedComponent.props.customStyle?.fontFamily || 'inherit'} 
                    onValueChange={(value) => updateStyle({ fontFamily: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inherit">Inherit</SelectItem>
                      <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                      <SelectItem value="system-ui, sans-serif">System UI</SelectItem>
                      <SelectItem value="Georgia, serif">Georgia</SelectItem>
                      <SelectItem value="Monaco, monospace">Monaco</SelectItem>
                      <SelectItem value="Comic Sans MS, cursive">Comic Sans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-medium mb-2 block">
                    Font Size: {selectedComponent.props.customStyle?.fontSize || 14}px
                  </Label>
                  <Slider
                    value={[parseInt(selectedComponent.props.customStyle?.fontSize) || 14]}
                    onValueChange={([value]) => updateStyle({ fontSize: `${value}px` })}
                    min={8}
                    max={72}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium mb-2 block">Font Weight</Label>
                  <Select 
                    value={selectedComponent.props.customStyle?.fontWeight || 'normal'} 
                    onValueChange={(value) => updateStyle({ fontWeight: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="300">Light</SelectItem>
                      <SelectItem value="400">Normal</SelectItem>
                      <SelectItem value="500">Medium</SelectItem>
                      <SelectItem value="600">Semi Bold</SelectItem>
                      <SelectItem value="700">Bold</SelectItem>
                      <SelectItem value="800">Extra Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-medium mb-2 block">
                    Letter Spacing: {selectedComponent.props.customStyle?.letterSpacing || 0}px
                  </Label>
                  <Slider
                    value={[parseFloat(selectedComponent.props.customStyle?.letterSpacing) || 0]}
                    onValueChange={([value]) => updateStyle({ letterSpacing: `${value}px` })}
                    min={-2}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium mb-2 block">
                    Line Height: {selectedComponent.props.customStyle?.lineHeight || 1.5}
                  </Label>
                  <Slider
                    value={[parseFloat(selectedComponent.props.customStyle?.lineHeight) || 1.5]}
                    onValueChange={([value]) => updateStyle({ lineHeight: value.toFixed(1) })}
                    min={1}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Motion Effects */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Motion & Effects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs font-medium mb-2 block">Hover Effect</Label>
                  <Select 
                    value={selectedComponent.props.hoverEffect || 'none'} 
                    onValueChange={(value) => updateProps({ hoverEffect: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="lift">Lift</SelectItem>
                      <SelectItem value="glow">Glow</SelectItem>
                      <SelectItem value="bounce">Bounce</SelectItem>
                      <SelectItem value="rotate">Rotate</SelectItem>
                      <SelectItem value="scale">Scale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-medium mb-2 block">
                    Transition Duration: {selectedComponent.props.customStyle?.transitionDuration || 300}ms
                  </Label>
                  <Slider
                    value={[parseInt(selectedComponent.props.customStyle?.transitionDuration) || 300]}
                    onValueChange={([value]) => updateStyle({ 
                      transitionDuration: `${value}ms`,
                      transition: `all ${value}ms cubic-bezier(0.4, 0, 0.2, 1)`
                    })}
                    min={100}
                    max={1000}
                    step={50}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium mb-2 block">Animation</Label>
                  <Select 
                    value={selectedComponent.props.animation || 'none'} 
                    onValueChange={(value) => updateProps({ animation: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="pulse">Pulse</SelectItem>
                      <SelectItem value="bounce">Bounce</SelectItem>
                      <SelectItem value="fade">Fade In</SelectItem>
                      <SelectItem value="slide">Slide In</SelectItem>
                      <SelectItem value="zoom">Zoom In</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-medium mb-2 block">
                    Opacity: {Math.round((selectedComponent.props.customStyle?.opacity || 1) * 100)}%
                  </Label>
                  <Slider
                    value={[parseFloat(selectedComponent.props.customStyle?.opacity) || 1]}
                    onValueChange={([value]) => updateStyle({ opacity: value.toFixed(2) })}
                    min={0}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

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
            {/* Sizing */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Move className="w-4 h-4" />
                  Size & Dimensions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium mb-2 block">Width</Label>
                    <Input
                      type="text"
                      value={selectedComponent.props.customStyle?.width || 'auto'}
                      onChange={(e) => updateStyle({ width: e.target.value })}
                      placeholder="auto"
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium mb-2 block">Height</Label>
                    <Input
                      type="text"
                      value={selectedComponent.props.customStyle?.height || 'auto'}
                      onChange={(e) => updateStyle({ height: e.target.value })}
                      placeholder="auto"
                      className="h-8"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium mb-2 block">Min Width</Label>
                    <Input
                      type="text"
                      value={selectedComponent.props.customStyle?.minWidth || ''}
                      onChange={(e) => updateStyle({ minWidth: e.target.value })}
                      placeholder="0"
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium mb-2 block">Max Width</Label>
                    <Input
                      type="text"
                      value={selectedComponent.props.customStyle?.maxWidth || ''}
                      onChange={(e) => updateStyle({ maxWidth: e.target.value })}
                      placeholder="none"
                      className="h-8"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Spacing */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Spacing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs font-medium mb-2 block">
                    Padding: {selectedComponent.props.customStyle?.padding || 16}px
                  </Label>
                  <Slider
                    value={[parseInt(selectedComponent.props.customStyle?.padding) || 16]}
                    onValueChange={([value]) => updateStyle({ padding: `${value}px` })}
                    min={0}
                    max={100}
                    step={4}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium mb-2 block">Padding X</Label>
                    <Input
                      type="number"
                      value={parseInt(selectedComponent.props.customStyle?.paddingLeft) || 0}
                      onChange={(e) => updateStyle({ 
                        paddingLeft: `${e.target.value}px`,
                        paddingRight: `${e.target.value}px`
                      })}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium mb-2 block">Padding Y</Label>
                    <Input
                      type="number"
                      value={parseInt(selectedComponent.props.customStyle?.paddingTop) || 0}
                      onChange={(e) => updateStyle({ 
                        paddingTop: `${e.target.value}px`,
                        paddingBottom: `${e.target.value}px`
                      })}
                      className="h-8"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium mb-2 block">
                    Margin: {selectedComponent.props.customStyle?.margin || 0}px
                  </Label>
                  <Slider
                    value={[parseInt(selectedComponent.props.customStyle?.margin) || 0]}
                    onValueChange={([value]) => updateStyle({ margin: `${value}px` })}
                    min={0}
                    max={50}
                    step={2}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Display & Flexbox */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Display & Alignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs font-medium mb-2 block">Display</Label>
                  <Select 
                    value={selectedComponent.props.customStyle?.display || 'flex'} 
                    onValueChange={(value) => updateStyle({ display: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="block">Block</SelectItem>
                      <SelectItem value="flex">Flex</SelectItem>
                      <SelectItem value="inline-flex">Inline Flex</SelectItem>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="inline">Inline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(selectedComponent.props.customStyle?.display === 'flex' || selectedComponent.props.customStyle?.display === 'inline-flex' || !selectedComponent.props.customStyle?.display) && (
                  <>
                    <div>
                      <Label className="text-xs font-medium mb-2 block">Justify Content</Label>
                      <Select 
                        value={selectedComponent.props.customStyle?.justifyContent || 'center'} 
                        onValueChange={(value) => updateStyle({ justifyContent: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flex-start">Start</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="flex-end">End</SelectItem>
                          <SelectItem value="space-between">Space Between</SelectItem>
                          <SelectItem value="space-around">Space Around</SelectItem>
                          <SelectItem value="space-evenly">Space Evenly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs font-medium mb-2 block">Align Items</Label>
                      <Select 
                        value={selectedComponent.props.customStyle?.alignItems || 'center'} 
                        onValueChange={(value) => updateStyle({ alignItems: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flex-start">Start</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="flex-end">End</SelectItem>
                          <SelectItem value="stretch">Stretch</SelectItem>
                          <SelectItem value="baseline">Baseline</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
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

                  <div>
                    <Label className="text-xs font-medium mb-2 block">
                      Gap: {selectedComponent.props.customStyle?.gap || 16}px
                    </Label>
                    <Slider
                      value={[parseInt(selectedComponent.props.customStyle?.gap) || 16]}
                      onValueChange={([value]) => updateStyle({ gap: `${value}px` })}
                      min={0}
                      max={50}
                      step={2}
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

            {selectedComponent.type === 'bento-grid' && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Grid Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs font-medium mb-2 block">Number of Items</Label>
                    <Slider
                      value={[selectedComponent.props.items?.length || 5]}
                      onValueChange={([value]) => {
                        const currentItems = selectedComponent.props.items || [];
                        const newItems = Array.from({ length: value }, (_, i) => 
                          currentItems[i] || { 
                            id: i + 1, 
                            title: `Item ${i + 1}`, 
                            span: { col: 1, row: 1 } 
                          }
                        );
                        updateProps({ items: newItems });
                      }}
                      min={1}
                      max={12}
                      step={1}
                      className="w-full"
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
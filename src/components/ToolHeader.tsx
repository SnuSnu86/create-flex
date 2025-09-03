import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CodeViewer } from './CodeViewer';
import { Palette, Code, Download, Eye, Smartphone, Tablet, Monitor } from 'lucide-react';
import type { DesignComponent } from './DesignTool';

interface ToolHeaderProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  components: DesignComponent[];
}

const themes = [
  { value: 'dark-pro', label: 'Dark Pro', color: 'bg-gradient-primary' },
  { value: 'light', label: 'Light Elegant', color: 'bg-gradient-accent' },
  { value: 'brutalist', label: 'Neo Brutalism', color: 'bg-black' },
  { value: 'luxury', label: 'Luxury Gold', color: 'bg-gradient-to-r from-yellow-400 to-purple-600' }
];

const viewports = [
  { value: 'desktop', label: 'Desktop', icon: Monitor },
  { value: 'tablet', label: 'Tablet', icon: Tablet },
  { value: 'mobile', label: 'Mobile', icon: Smartphone }
];

export const ToolHeader = ({ currentTheme, onThemeChange, components }: ToolHeaderProps) => {
  const [currentViewport, setCurrentViewport] = useState('desktop');
  const [showCodeDialog, setShowCodeDialog] = useState(false);

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Palette className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-foreground">ComponentCraft</h1>
        </div>
        
        <Badge variant="secondary" className="text-xs">
          {components.length} components
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        {/* Viewport Selector */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {viewports.map(({ value, icon: Icon }) => (
            <Button
              key={value}
              variant={currentViewport === value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentViewport(value)}
              className="h-8 w-8 p-0"
            >
              <Icon className="w-4 h-4" />
            </Button>
          ))}
        </div>

        {/* Theme Selector */}
        <Select value={currentTheme} onValueChange={onThemeChange}>
          <SelectTrigger className="w-48">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${themes.find(t => t.value === currentTheme)?.color || 'bg-primary'}`} />
              <SelectValue placeholder="Select theme" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {themes.map(theme => (
              <SelectItem key={theme.value} value={theme.value}>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${theme.color}`} />
                  {theme.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Code Preview */}
        <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Code className="w-4 h-4 mr-2" />
              View Code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Generated Component Code</DialogTitle>
            </DialogHeader>
            <CodeViewer components={components} />
          </DialogContent>
        </Dialog>

        {/* Export */}
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>

        {/* Preview */}
        <Button variant="default" size="sm">
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
      </div>
    </header>
  );
};
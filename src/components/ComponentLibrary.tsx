import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Square, CreditCard, Grid3X3, Plus } from 'lucide-react';
import { useState } from 'react';

interface ComponentLibraryProps {
  onAddComponent: (type: 'button' | 'card' | 'bento-grid') => void;
}

const componentTypes = [
  {
    type: 'button' as const,
    name: 'Button',
    description: 'Interactive buttons with multiple variants and states',
    icon: Square,
    category: 'Forms'
  },
  {
    type: 'card' as const,
    name: 'Card',
    description: 'Content containers with optional headers and media',
    icon: CreditCard,
    category: 'Layout'
  },
  {
    type: 'bento-grid' as const,
    name: 'Bento Grid',
    description: 'Flexible grid layouts with variable sized items',
    icon: Grid3X3,
    category: 'Layout'
  }
];

const categories = ['All', 'Layout', 'Forms', 'Media', 'Navigation'];

export const ComponentLibrary = ({ onAddComponent }: ComponentLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredComponents = componentTypes.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || component.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-lg font-semibold text-sidebar-foreground mb-3">Components</h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {filteredComponents.map(component => (
            <Card 
              key={component.type} 
              className="cursor-pointer hover:shadow-md transition-all duration-fast hover:border-primary/50 group"
              onClick={() => onAddComponent(component.type)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <component.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-card-foreground text-sm mb-1">
                        {component.name}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {component.description}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredComponents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No components found</p>
          </div>
        )}
      </div>
    </div>
  );
};
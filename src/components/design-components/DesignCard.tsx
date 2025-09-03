import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DesignCardProps {
  title?: string;
  description?: string;
  showImage?: boolean;
  isSelected?: boolean;
}

export const DesignCard = ({ 
  title = 'Card Title', 
  description = 'This is a beautiful card component with customizable content and styling options.',
  showImage = false,
  isSelected = false 
}: DesignCardProps) => {
  return (
    <Card className={cn(
      'w-80 transition-all duration-normal hover:shadow-lg',
      'bg-gradient-surface border-border/50 backdrop-blur-sm',
      isSelected && 'ring-2 ring-accent ring-offset-2'
    )}>
      {showImage && (
        <div className="h-48 bg-gradient-accent rounded-t-lg flex items-center justify-center">
          <div className="text-accent-foreground/60 text-sm font-medium">
            Image Placeholder
          </div>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-card-foreground">
              {title}
            </CardTitle>
            <CardDescription className="text-muted-foreground leading-relaxed">
              {description}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="ml-2 text-xs">
            New
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-sm text-muted-foreground">Active status</span>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground">
              Last updated: 2 min ago
            </span>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-primary rounded-full"></div>
              <div className="w-1 h-1 bg-primary/60 rounded-full"></div>
              <div className="w-1 h-1 bg-primary/40 rounded-full"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
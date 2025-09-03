import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DesignCardProps {
  title?: string;
  description?: string;
  showImage?: boolean;
  isSelected?: boolean;
  customStyle?: Record<string, any>;
  hoverEffect?: string;
  animation?: string;
}

export const DesignCard = ({ 
  title = 'Card Title', 
  description = 'This is a beautiful card component with customizable content and styling options.',
  showImage = false,
  isSelected = false,
  customStyle = {},
  hoverEffect = 'none',
  animation = 'none'
}: DesignCardProps) => {
  const getHoverEffectClass = () => {
    switch (hoverEffect) {
      case 'lift': return 'hover:-translate-y-3 hover:shadow-2xl';
      case 'glow': return 'hover:shadow-glow hover:shadow-primary/30';
      case 'bounce': return 'hover:animate-bounce-gentle';
      case 'rotate': return 'hover:rotate-2';
      case 'scale': return 'hover:scale-105';
      default: return 'hover:shadow-xl hover:border-accent/30 hover:-translate-y-1';
    }
  };

  const getAnimationClass = () => {
    switch (animation) {
      case 'pulse': return 'animate-pulse-soft';
      case 'bounce': return 'animate-bounce-gentle';
      case 'fade': return 'animate-fade-in';
      case 'slide': return 'animate-slide-up';
      case 'zoom': return 'animate-zoom-in';
      default: return '';
    }
  };

  return (
    <Card className={cn(
      'bg-gradient-surface border-border/50 backdrop-blur-sm transition-all duration-300 group will-change-transform focus:outline-none',
      getHoverEffectClass(),
      getAnimationClass(),
      'transform-gpu',
      'pointer-events-auto select-none cursor-pointer', // Allow hover effects
      'before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-primary/5 before:to-accent/5',
      'before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500'
    )}
    style={customStyle}
    onMouseEnter={(e) => {
      // Force hover effects to trigger
      e.currentTarget.classList.add('hover');
    }}
    onMouseLeave={(e) => {
      // Remove forced hover state
      e.currentTarget.classList.remove('hover');
    }}
    >
      {showImage && (
        <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden group-hover:scale-110 transition-transform duration-700">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 20 0 L 0 0 0 20' fill='none' stroke='%23ffffff' stroke-width='0.5' opacity='0.1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E")`
          }} />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent group-hover:from-card/60" />
          <div className="absolute top-4 right-4 w-2 h-2 bg-accent rounded-full animate-pulse" />
        </div>
      )}
      
      <CardContent className="p-6 relative">
        <CardTitle className="text-lg font-semibold text-card-foreground mb-2 group-hover:text-primary transition-all duration-300 group-hover:translate-x-1">
          {title}
        </CardTitle>
        
        <p className="text-muted-foreground text-sm leading-relaxed group-hover:text-foreground transition-colors duration-300">
          {description}
        </p>
        
        <div className="mt-4 flex items-center justify-between">
          <Badge variant="secondary" className="text-xs group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300 group-hover:scale-110">
            Feature
          </Badge>
          
          <div className="text-xs text-muted-foreground group-hover:text-accent transition-colors duration-300 flex items-center gap-1">
            <div className="w-1 h-1 bg-current rounded-full animate-pulse" />
            2 min read
          </div>
        </div>
        
        {/* Decorative corner element */}
        <div className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-br from-primary/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-bounce-gentle" />
      </CardContent>
    </Card>
  );
};
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TrendingUp, Users, DollarSign, Activity, Star, Zap } from 'lucide-react';

interface BentoItem {
  id: number;
  title: string;
  span: { col: number; row: number };
  icon?: React.ComponentType<any>;
  value?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface DesignBentoGridProps {
  columns?: number;
  rows?: number;
  items?: BentoItem[];
  isSelected?: boolean;
  customStyle?: Record<string, any>;
}

const defaultItems: BentoItem[] = [
  {
    id: 1,
    title: 'Total Revenue',
    span: { col: 2, row: 1 },
    icon: DollarSign,
    value: '$45,231',
    change: '+20.1%',
    trend: 'up'
  },
  {
    id: 2,
    title: 'Active Users',
    span: { col: 1, row: 1 },
    icon: Users,
    value: '2,350',
    change: '+180',
    trend: 'up'
  },
  {
    id: 3,
    title: 'Performance',
    span: { col: 1, row: 2 },
    icon: Activity,
    value: '98.5%',
    change: '+2.5%',
    trend: 'up'
  },
  {
    id: 4,
    title: 'Growth Rate',
    span: { col: 1, row: 1 },
    icon: TrendingUp,
    value: '12.5%',
    change: '+1.2%',
    trend: 'up'
  },
  {
    id: 5,
    title: 'Premium Users',
    span: { col: 1, row: 1 },
    icon: Star,
    value: '1,234',
    change: '+89',
    trend: 'up'
  }
];

export const DesignBentoGrid = ({ 
  columns = 3, 
  rows = 2, 
  items = defaultItems,
  isSelected = false,
  customStyle = {}
}: DesignBentoGridProps) => {
  return (
    <div 
      className={cn(
        'grid gap-4 transition-all duration-300 will-change-transform',
        'pointer-events-none select-none' // Prevent interference with drag system
      )}
      style={{ 
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 180px)`,
        width: `${columns * 200 + (columns - 1) * 16}px`,
        ...customStyle
      }}
    >
      {items.slice(0, columns * rows).map((item, index) => {
        const IconComponent = item.icon || Zap;
        
        return (
            <Card
              key={item.id}
              className={cn(
                'p-6 bg-gradient-surface border-border/50 backdrop-blur-sm transform-gpu will-change-transform',
                'hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group',
                'hover:-translate-y-2 hover:rotate-1 hover:scale-[1.02]',
                'before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:via-transparent before:to-accent/5',
                'before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500',
                'relative overflow-hidden'
              )}
              style={{
                gridColumn: `span ${Math.min(item.span.col, columns)}`,
                gridRow: `span ${Math.min(item.span.row, rows)}`
              }}
            >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03]">
              <div 
                className="w-full h-full"
                style={{
                  backgroundImage: `radial-gradient(circle at 20% 50%, hsl(var(--primary)) 0%, transparent 50%),
                                   radial-gradient(circle at 80% 20%, hsl(var(--accent)) 0%, transparent 50%)`
                }}
              />
            </div>
            
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                  <IconComponent className="w-5 h-5 text-primary group-hover:animate-bounce-gentle" />
                </div>
                
                {item.change && (
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      'text-xs font-medium',
                      item.trend === 'up' && 'bg-success/10 text-success border-success/20',
                      item.trend === 'down' && 'bg-destructive/10 text-destructive border-destructive/20'
                    )}
                  >
                    {item.change}
                  </Badge>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  {item.title}
                </h3>
                
                {item.value && (
                  <div className="text-2xl font-bold text-card-foreground mb-1 group-hover:text-primary transition-colors duration-300 group-hover:scale-105 transform-gpu">
                    {item.value}
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground">
                  vs last month
                </div>
              </div>
              
              {/* Decorative elements for larger cards */}
              {item.span.col > 1 && (
                <div className="absolute bottom-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full blur-xl group-hover:animate-pulse-soft" />
                </div>
              )}
              
              {/* Animated corner decoration */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100" />
            </div>
          </Card>
        );
      })}
    </div>
  );
};
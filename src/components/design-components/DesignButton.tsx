import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DesignButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  children?: string;
  disabled?: boolean;
  isSelected?: boolean;
  customStyle?: Record<string, any>;
  hoverEffect?: string;
  animation?: string;
}

const variantStyles = {
  primary: 'bg-gradient-primary text-primary-foreground shadow-glow border-0 hover:shadow-xl',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground',
  ghost: 'text-primary hover:bg-primary/10 hover:text-primary',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
};

const sizeStyles = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-8 text-base'
};

export const DesignButton = ({ 
  variant = 'primary', 
  size = 'md', 
  children = 'Button', 
  disabled = false,
  isSelected = false,
  customStyle = {},
  hoverEffect = 'none',
  animation = 'none'
}: DesignButtonProps) => {
  const getHoverEffectClass = () => {
    switch (hoverEffect) {
      case 'lift': return 'hover:-translate-y-2 hover:shadow-xl';
      case 'glow': return 'hover:shadow-glow hover:shadow-primary/50';
      case 'bounce': return 'hover:animate-bounce-gentle';
      case 'rotate': return 'hover:rotate-3';
      case 'scale': return 'hover:scale-110';
      default: return 'hover:scale-105';
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
    <Button
      className={cn(
        'transition-all duration-300 font-medium relative overflow-hidden will-change-transform',
        getHoverEffectClass(),
        getAnimationClass(),
        'transform-gpu',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
        'before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700',
        'pointer-events-none select-none', // Prevent interference with drag system
        variantStyles[variant],
        sizeStyles[size],
        disabled && 'opacity-50 hover:scale-100 hover:translate-y-0',
        hoverEffect === 'none' && 'hover:scale-105 hover:shadow-lg hover:-translate-y-0.5'
      )}
      disabled={disabled}
      style={customStyle}
    >
      <span className="relative z-10">{children}</span>
    </Button>
  );
};
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DesignButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  children?: string;
  disabled?: boolean;
  isSelected?: boolean;
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
  isSelected = false 
}: DesignButtonProps) => {
  return (
    <Button
      className={cn(
        'transition-all duration-normal font-medium relative',
        'hover:scale-105 active:scale-95',
        variantStyles[variant],
        sizeStyles[size],
        disabled && 'opacity-50 cursor-not-allowed hover:scale-100',
        isSelected && 'ring-2 ring-accent ring-offset-2'
      )}
      disabled={disabled}
    >
      {children}
    </Button>
  );
};
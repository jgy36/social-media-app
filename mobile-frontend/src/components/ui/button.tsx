// src/components/ui/button.tsx
import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';
import { cn } from '@/lib/utils';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<TouchableOpacity, ButtonProps>(
  ({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
    return (
      <TouchableOpacity
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
          'disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-slate-900 text-slate-50 active:bg-slate-900/90': variant === 'default',
            'bg-red-500 text-slate-50 active:bg-red-500/90': variant === 'destructive',
            'border border-slate-200 bg-white active:bg-slate-100': variant === 'outline',
            'bg-slate-100 text-slate-900 active:bg-slate-100/80': variant === 'secondary',
            'active:bg-slate-100': variant === 'ghost',
            'text-slate-900 underline-offset-4 active:underline': variant === 'link',
          },
          {
            'h-10 px-4 py-2': size === 'default',
            'h-9 rounded-md px-3': size === 'sm',
            'h-11 rounded-md px-8': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        {...props}
      >
        <Text
          className={cn(
            'text-sm font-medium',
            {
              'text-slate-50': variant === 'default' || variant === 'destructive',
              'text-slate-900': variant === 'outline' || variant === 'secondary' || variant === 'ghost',
            }
          )}
        >
          {children}
        </Text>
      </TouchableOpacity>
    );
  }
);
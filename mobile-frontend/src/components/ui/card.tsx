// src/components/ui/card.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<View, React.ComponentProps<typeof View>>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn(
        'rounded-lg border border-slate-200 bg-white text-slate-950 shadow-sm',
        className
      )}
      {...props}
    />
  )
);

const CardHeader = React.forwardRef<View, React.ComponentProps<typeof View>>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
);

const CardTitle = React.forwardRef<Text, React.ComponentProps<typeof Text>>(
  ({ className, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
);

const CardDescription = React.forwardRef<Text, React.ComponentProps<typeof Text>>(
  ({ className, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn('text-sm text-slate-500', className)}
      {...props}
    />
  )
);

const CardContent = React.forwardRef<View, React.ComponentProps<typeof View>>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn('p-6 pt-0', className)}
      {...props}
    />
  )
);

const CardFooter = React.forwardRef<View, React.ComponentProps<typeof View>>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
);

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
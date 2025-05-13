// src/components/ui/input.tsx
import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { cn } from '@/lib/utils';

export interface InputProps extends TextInputProps {
  error?: boolean;
}

const Input = React.forwardRef<TextInput, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        className={cn(
          'h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm',
          'placeholder:text-slate-500 focus:border-slate-900 focus:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500',
          className
        )}
        placeholderTextColor="#64748b"
        {...props}
      />
    );
  }
);

export { Input };
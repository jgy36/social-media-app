import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Badge: React.FC<BadgeProps> = ({ 
  variant = 'default', 
  className,
  children,
  style,
  textStyle
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-secondary border-secondary';
      case 'destructive':
        return 'bg-destructive border-destructive';
      case 'outline':
        return 'bg-transparent border-border';
      default:
        return 'bg-primary border-primary';
    }
  };

  const getTextClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'text-secondary-foreground';
      case 'destructive':
        return 'text-destructive-foreground';
      case 'outline':
        return 'text-foreground';
      default:
        return 'text-primary-foreground';
    }
  };

  return (
    <View 
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 ${getVariantClasses()} ${className}`}
      style={style}
    >
      <Text 
        className={`text-xs font-semibold ${getTextClasses()}`}
        style={textStyle}
      >
        {children}
      </Text>
    </View>
  );
};

export { Badge };
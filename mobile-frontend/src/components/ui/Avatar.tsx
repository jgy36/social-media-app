import React from 'react';
import { View, Image, Text } from 'react-native';

interface AvatarProps {
  className?: string;
  style?: any;
  children?: React.ReactNode;
}

interface AvatarImageProps {
  src?: string;
  alt?: string;
  className?: string;
  onError?: () => void;
}

interface AvatarFallbackProps {
  className?: string;
  children: React.ReactNode;
}

const Avatar: React.FC<AvatarProps> = ({ className = '', style, children }) => {
  return (
    <View 
      className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}
      style={style}
    >
      {children}
    </View>
  );
};

const AvatarImage: React.FC<AvatarImageProps> = ({ src, alt, className = '', onError }) => {
  if (!src) return null;
  
  return (
    <Image
      source={{ uri: src }}
      className={`aspect-square h-full w-full ${className}`}
      resizeMode="cover"
      onError={onError}
    />
  );
};

const AvatarFallback: React.FC<AvatarFallbackProps> = ({ className = '', children }) => {
  return (
    <View className={`flex h-full w-full items-center justify-center rounded-full bg-muted ${className}`}>
      <Text className="text-foreground">{children}</Text>
    </View>
  );
};

export { Avatar, AvatarImage, AvatarFallback };
// src/utils/iconMappings.ts - Icon mapping from Lucide to Expo Vector Icons

import React from 'react';
import { 
  MaterialIcons, 
  FontAwesome, 
  Ionicons, 
  Feather,
  MaterialCommunityIcons 
} from '@expo/vector-icons';

// Common icon mappings from Lucide to Expo Vector Icons
export const iconMap = {
  // Your specific icons
  MessagesSquare: { 
    component: MaterialIcons, 
    name: 'chat-bubble-outline' as any,
    fallback: { component: Ionicons, name: 'chatbubbles-outline' as any }
  },
  Users: { 
    component: MaterialIcons, 
    name: 'group' as any,
    fallback: { component: Ionicons, name: 'people-outline' as any }
  },
  User: { 
    component: MaterialIcons, 
    name: 'person' as any,
    fallback: { component: Ionicons, name: 'person-outline' as any }
  },
  
  // Other common icons
  Check: { component: MaterialIcons, name: 'check' as any },
  X: { component: MaterialIcons, name: 'close' as any },
  Loader2: { component: MaterialIcons, name: 'refresh' as any },
  Settings: { component: MaterialIcons, name: 'settings' as any },
  ExternalLink: { component: MaterialIcons, name: 'open-in-new' as any },
  Lock: { component: MaterialIcons, name: 'lock' as any },
  Camera: { component: MaterialIcons, name: 'camera-alt' as any },
  Save: { component: MaterialIcons, name: 'save' as any },
  AlertCircle: { component: MaterialIcons, name: 'error-outline' as any },
  
  // Navigation icons
  Home: { component: MaterialIcons, name: 'home' as any },
  Search: { component: MaterialIcons, name: 'search' as any },
  Bell: { component: MaterialIcons, name: 'notifications' as any },
  
  // Social icons
  Heart: { component: MaterialIcons, name: 'favorite-border' as any },
  MessageSquare: { component: MaterialIcons, name: 'chat-bubble-outline' as any },
  Share: { component: MaterialIcons, name: 'share' as any },
  Bookmark: { component: MaterialIcons, name: 'bookmark-border' as any },
  
  // Arrow icons
  ChevronRight: { component: MaterialIcons, name: 'chevron-right' as any },
  ChevronLeft: { component: MaterialIcons, name: 'chevron-left' as any },
  ChevronUp: { component: MaterialIcons, name: 'expand-less' as any },
  ChevronDown: { component: MaterialIcons, name: 'expand-more' as any },
  
  // Theme icons
  Moon: { component: MaterialIcons, name: 'dark-mode' as any },
  Sun: { component: MaterialIcons, name: 'light-mode' as any },
  
  // User related
  UserPlus: { component: MaterialIcons, name: 'person-add' as any },
  UserCheck: { component: MaterialIcons, name: 'person-pin' as any },
  UserX: { component: MaterialIcons, name: 'person-off' as any },
  UserCog: { component: MaterialIcons, name: 'manage-accounts' as any },
  
  // Other
  LogOut: { component: MaterialIcons, name: 'logout' as any },
  HelpCircle: { component: MaterialIcons, name: 'help-outline' as any },
  Shield: { component: MaterialIcons, name: 'security' as any },
  Eye: { component: MaterialIcons, name: 'visibility' as any },
  
  // Add more as needed
};

// Helper type for icon props
export interface ExpoIconProps {
  size?: number;
  color?: string;
  style?: any;
}

// Generic icon component
export const Icon = ({ 
  name, 
  size = 24, 
  color = '#000', 
  style 
}: { 
  name: keyof typeof iconMap;
  size?: number;
  color?: string;
  style?: any;
}) => {
  const iconConfig = iconMap[name];
  if (!iconConfig) {
    console.warn(`Icon "${name}" not found in iconMap`);
    return null;
  }
  
  const IconComponent = iconConfig.component;
  return React.createElement(IconComponent as any, {
    name: iconConfig.name,
    size: size,
    color: color,
    style: style
  });
};
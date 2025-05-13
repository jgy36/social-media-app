/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/componentProps.ts

import { PostType } from "./post";
import { StyleProp, ViewStyle, TextStyle } from "react-native";

// Common loading/error state props
export interface LoadingProps {
  isLoading: boolean;
}

export interface ErrorProps {
  error: string | null;
}

export interface LoadingErrorProps extends LoadingProps, ErrorProps {}

// Common callback props
export interface CallbackProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// Common pagination props
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Common card props for React Native
export interface CardProps {
  title?: string;
  description?: string;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<TextStyle>;
}

// Common button action props
export interface ActionProps {
  onAction: () => void;
  isDisabled?: boolean;
  actionLabel?: string;
}

// Common modal props
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

// Standard post-related props
export interface PostProps {
  post: PostType;
  onLike?: (postId: number) => void;
  onComment?: (postId: number) => void;
  onShare?: (postId: number) => void;
  onSave?: (postId: number, isSaved: boolean) => void;
}

// Standard community props
export interface CommunityCardProps {
  community: {
    id: string;
    name: string;
    description: string;
    members: number;
    color?: string;
    isJoined?: boolean;
  };
  onJoin: (communityId: string) => void;
}

// Standard form props
export interface FormProps extends LoadingErrorProps {
  onSubmit: (data: any) => Promise<void>;
  submitLabel?: string;
}

// Standard list props
export interface ListProps<T> extends LoadingErrorProps {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
}

// React Native specific props
export interface TouchableProps {
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

// Text input props
export interface TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  style?: StyleProp<TextStyle>;
}

// Image props
export interface ImageProps {
  uri?: string;
  style?: StyleProp<any>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
}
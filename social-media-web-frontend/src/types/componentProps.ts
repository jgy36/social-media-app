/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/componentProps.ts

import { PostType } from "./post";

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

// Common card props
export interface CardProps {
  title?: string;
  description?: string;
  className?: string;
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

// src/types/componentProps.ts (continued)

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
  onJoin: (e: React.MouseEvent, communityId: string) => void;
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
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/ui/LoadingState.tsx
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading..." 
}) => (
  <div className="flex flex-col items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <p className="mt-4 text-muted-foreground">{message}</p>
  </div>
);


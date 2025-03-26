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

// src/components/ui/ErrorState.tsx
import { AlertCircle } from "lucide-react";
import { Button } from "./button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  message, 
  onRetry 
}) => (
  <div className="bg-destructive/10 text-destructive p-4 rounded-md">
    <div className="flex items-start">
      <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
      <div className="flex-1">
        <p>{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="mt-2">
            Try Again
          </Button>
        )}
      </div>
    </div>
  </div>
);
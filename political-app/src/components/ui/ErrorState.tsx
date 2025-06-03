// src/components/ui/ErrorState.tsx
import { AlertCircle } from "lucide-react";
import { Button } from "./button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void; // Make this optional
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
        {onRetry && ( // Only render if onRetry exists
          <Button onClick={onRetry} variant="outline" className="mt-2">
            Try Again
          </Button>
        )}
      </div>
    </div>
  </div>
);
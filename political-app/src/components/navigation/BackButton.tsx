/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/navigation/BackButton.tsx
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

interface BackButtonProps {
  fallbackUrl?: string;
  className?: string;
}

/**
 * A navigation back button that intelligently handles navigation history
 * based on the section context.
 */
const BackButton = ({ fallbackUrl = '/community', className = '' }: BackButtonProps) => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  
  const handleBack = () => {
    // Use browser history back if available
    if (window.history.length > 1) {
      router.back();
    } else {
      // If no history, navigate to fallback
      router.push(fallbackUrl);
    }
  };
  
  return (
    <Button
      onClick={handleBack}
      variant="ghost"
      className={`flex items-center ${className}`}
    >
      <ArrowLeft className="mr-2 h-4 w-4" /> Back
    </Button>
  );
};

export default BackButton;
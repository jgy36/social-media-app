/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/navigation/BackButton.tsx
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { goBackInTab, getPreviousUrlInTab } from '@/utils/routerHistoryManager';
import { detectSectionFromPath } from '@/utils/navigationStateManager';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

interface BackButtonProps {
  fallbackUrl?: string;
  className?: string;
}

const BackButton = ({ fallbackUrl = '/community', className = '' }: BackButtonProps) => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  
  const handleBack = () => {
    // Get the current section
    const currentPath = router.asPath;
    const pathParts = currentPath.split('/');
    let section = pathParts[1] || '';
    
    // Handle special case for other user profiles
    if (section === 'profile' && pathParts.length > 2) {
      const profileUsername = pathParts[2];
      if (user.username && profileUsername !== user.username) {
        section = 'community';
      }
    }
    
    // If no section detected, default to first part of path
    const currentSection = section || pathParts[1] || 'feed';
    
    // Try to get the previous URL in this section
    const previousUrl = getPreviousUrlInTab(currentSection);
    
    if (previousUrl) {
      // Navigate to the previous URL in this section
      router.push(previousUrl);
    } else {
      // Fallback to the section root if no history exists
      const sectionRoot = `/${currentSection}`;
      
      // If we're already at the section root, use the provided fallback
      if (currentPath === sectionRoot) {
        router.push(fallbackUrl);
      } else {
        router.push(sectionRoot);
      }
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
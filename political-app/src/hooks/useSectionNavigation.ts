// src/hooks/useSectionNavigation.ts
import { useRouter } from 'next/router';
import { useEffect, useCallback } from 'react';
import { getLastPath, saveNavigationState, useNavigationStateTracker } from '@/utils/navigationStateManager';

/**
 * Custom hook to handle section-based navigation
 * @returns Object containing the handleSectionClick function
 */
export const useSectionNavigation = () => {
  const router = useRouter();
  
  // Automatically track navigation state when navigating
  useNavigationStateTracker();
  
  // Determine current section based on path
  const getCurrentSection = useCallback(() => {
    const path = router.asPath;
    const firstSegment = path.split('/')[1] || '';
    return firstSegment;
  }, [router.asPath]);
  
  // Save current path when component mounts or path changes
  useEffect(() => {
    const currentSection = getCurrentSection();
    if (currentSection) {
      saveNavigationState(currentSection, router.asPath);
    }
  }, [router.asPath, getCurrentSection]);
  
  // Handler for section navigation
  const handleSectionClick = useCallback((section: string) => {
    const currentSection = getCurrentSection();
    
    // If we're already in this section, do nothing
    if (section === currentSection) {
      return;
    }
    
    // Navigate to the last path in the requested section
    const lastPath = getLastPath(section);
    router.push(lastPath);
  }, [getCurrentSection, router]);
  
  return {
    handleSectionClick,
    currentSection: getCurrentSection()
  };
};
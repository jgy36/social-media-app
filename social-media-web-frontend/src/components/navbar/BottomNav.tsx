// src/components/navbar/BottomNav.tsx
import { useSectionNavigation } from '@/hooks/useSectionNavigation';
import { Button } from '@/components/ui/button';
import { Home, Users, Map, User, MapPin } from 'lucide-react';

const BottomNav = () => {
  const { handleSectionClick, currentSection } = useSectionNavigation();
  
  // Function to determine if a section is active
  const isActive = (section: string) => section === currentSection;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t flex justify-around py-2 z-50">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleSectionClick('feed')}
        className={`flex flex-col items-center ${isActive('feed') ? 'text-primary' : ''}`}
      >
        <Home className="h-5 w-5" />
        <span className="text-xs mt-1">Feed</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleSectionClick('community')}
        className={`flex flex-col items-center ${isActive('community') ? 'text-primary' : ''}`}
      >
        <Users className="h-5 w-5" />
        <span className="text-xs mt-1">Community</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleSectionClick('map')}
        className={`flex flex-col items-center ${isActive('map') ? 'text-primary' : ''}`}
      >
        <Map className="h-5 w-5" />
        <span className="text-xs mt-1">Map</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleSectionClick('politicians')}
        className={`flex flex-col items-center ${isActive('politicians') ? 'text-primary' : ''}`}
      >
        <MapPin className="h-5 w-5" />
        <span className="text-xs mt-1">Politicians</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleSectionClick('profile')}
        className={`flex flex-col items-center ${isActive('profile') ? 'text-primary' : ''}`}
      >
        <User className="h-5 w-5" />
        <span className="text-xs mt-1">Profile</span>
      </Button>
    </div>
  );
};

export default BottomNav;
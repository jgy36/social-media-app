// src/components/navbar/Navbar.tsx - Fixed MessageIcon integration
import { useSectionNavigation } from '@/hooks/useSectionNavigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Link from 'next/link';
import SearchComponent from '@/components/search/SearchComponent';
import SettingsDropdown from '@/components/profile/SettingsDropdown';
import { Button } from '@/components/ui/button';
import { 
  Home,
  Users,
  Map,
  User,
  LogIn,
  MapPin
} from 'lucide-react';
import NotificationIcon from './NotificationIcon';
import MessageIcon from './MessageIcon'; // Import the MessageIcon component

const Navbar = () => {
  const { handleSectionClick, currentSection } = useSectionNavigation();
  // KEY FIX: Check isAuthenticated flag instead of token
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  
  // Function to determine if a section is active
  const isActive = (section: string) => {
    return section === currentSection;
  };

  return (
    <nav className="sticky top-0 z-50 w-full px-4 py-3 bg-background border-b shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Brand & Navigation */}
        <div className="flex items-center space-x-6">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-xl font-bold flex items-center"
          >
            <span>PoliticalApp</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Button
              variant={isActive('feed') ? 'default' : 'ghost'}
              onClick={() => handleSectionClick('feed')}
              className="flex items-center gap-1.5"
            >
              <Home className="h-4 w-4" />
              <span>Feed</span>
            </Button>
            
            <Button
              variant={isActive('community') ? 'default' : 'ghost'}
              onClick={() => handleSectionClick('community')}
              className="flex items-center gap-1.5"
            >
              <Users className="h-4 w-4" />
              <span>Community</span>
            </Button>
            
            <Button
              variant={isActive('map') ? 'default' : 'ghost'}
              onClick={() => handleSectionClick('map')}
              className="flex items-center gap-1.5"
            >
              <Map className="h-4 w-4" />
              <span>Map</span>
            </Button>
            
            <Button
              variant={isActive('politicians') ? 'default' : 'ghost'}
              onClick={() => handleSectionClick('politicians')}
              className="flex items-center gap-1.5"
            >
              <MapPin className="h-4 w-4" />
              <span>Politicians</span>
            </Button>
          </div>
        </div>

        {/* Search & User Actions */}
        <div className="flex items-center space-x-4">
          {/* Search Component (medium screens and up) */}
          <div className="hidden md:block w-64">
            <SearchComponent />
          </div>
          
          <div className="flex items-center space-x-4">
            <NotificationIcon />
            
            {/* Use the MessageIcon component directly */}
            {isAuthenticated && <MessageIcon />}

            {/* Profile or Login */}
            {isAuthenticated ? (
              <Button
                variant={isActive('profile') ? 'default' : 'ghost'}
                onClick={() => handleSectionClick('profile')}
                className="flex items-center gap-1.5"
              >
                <User className="h-4 w-4" />
                <span className="hidden md:inline">Profile</span>
              </Button>
            ) : (
              <Link href="/login">
                <Button variant="ghost" className="flex items-center gap-1.5">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden md:inline">Login</span>
                </Button>
              </Link>
            )}
          </div>
          
          {/* Settings (if authenticated) */}
          {isAuthenticated && (
            <SettingsDropdown variant="icon" />
          )}
        </div>
      </div>
      
      {/* Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t flex justify-around py-2 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSectionClick('feed')}
          className={isActive('feed') ? 'text-primary' : ''}
        >
          <Home className="h-5 w-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSectionClick('community')}
          className={isActive('community') ? 'text-primary' : ''}
        >
          <Users className="h-5 w-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSectionClick('map')}
          className={isActive('map') ? 'text-primary' : ''}
        >
          <Map className="h-5 w-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSectionClick('politicians')}
          className={isActive('politicians') ? 'text-primary' : ''}
        >
          <MapPin className="h-5 w-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSectionClick('profile')}
          className={isActive('profile') ? 'text-primary' : ''}
        >
          <User className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
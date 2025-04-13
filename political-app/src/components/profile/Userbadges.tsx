// src/components/profile/UserBadges.tsx - Fixed to properly handle user-specific badges
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getBadgeById } from '@/types/badges';
import BadgeSelector from './BadgeSelector';
import { Button } from '@/components/ui/button';
import { clearBadges } from '@/redux/slices/badgeSlice';

interface UserBadgesProps {
  userId?: number;
  isCurrentUser?: boolean;
  badges?: string[];
}

const UserBadges: React.FC<UserBadgesProps> = ({ 
  userId, 
  isCurrentUser = false,
  badges: propBadges
}) => {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const userBadges = useSelector((state: RootState) => state.badges.badges);
  const [displayBadges, setDisplayBadges] = useState<string[]>([]);
  const dispatch = useDispatch();
  const currentUserId = useSelector((state: RootState) => state.user.id);
  
  // Reset badges when user changes (to avoid showing previous user's badges)
  useEffect(() => {
    if (isCurrentUser && userId && currentUserId && userId !== currentUserId) {
      console.log('Current user changed, clearing badges');
      dispatch(clearBadges());
    }
  }, [userId, currentUserId, isCurrentUser, dispatch]);
  
  // Determine which badges to display - from props if provided, otherwise from Redux
  useEffect(() => {
    if (propBadges) {
      setDisplayBadges(propBadges);
    } else {
      // Only show badges if we're looking at the current user's profile
      // or if badges were explicitly provided via props
      if (isCurrentUser && userId === currentUserId) {
        setDisplayBadges(userBadges);
      } else {
        // For other users' profiles, we'd need to fetch their badges from the API
        // but for now we'll just show empty
        setDisplayBadges([]);
      }
    }
  }, [propBadges, userBadges, isCurrentUser, userId, currentUserId]);
  
  // If no badges and not current user's profile, don't render anything
  if (displayBadges.length === 0 && !isCurrentUser) {
    return null;
  }
  
  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2 mb-2">
        {displayBadges.length > 0 ? (
          displayBadges.map(badgeId => {
            const badge = getBadgeById(badgeId);
            if (!badge) return null;
            
            return (
              <TooltipProvider key={badgeId}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant="secondary" 
                      className="cursor-help hover:bg-secondary/80"
                    >
                      {badge.name}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{badge.category}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })
        ) : isCurrentUser ? (
          <div className="text-sm text-muted-foreground italic">
            No badges selected yet. Add some to show your positions.
          </div>
        ) : null}
      </div>
      
      {isCurrentUser && userId === currentUserId && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsSelectorOpen(true)}
          className="mt-2"
        >
          {displayBadges.length > 0 ? 'Edit Badges' : 'Add Badges'}
        </Button>
      )}
      
      <BadgeSelector 
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        selectedBadges={displayBadges}
      />
    </div>
  );
};

export default UserBadges;
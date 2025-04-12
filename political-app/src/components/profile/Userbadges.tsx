// src/components/profile/UserBadges.tsx
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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

interface UserBadgesProps {
  userId?: number;
  isCurrentUser?: boolean;
  badges?: string[];
}

const UserBadges: React.FC<UserBadgesProps> = ({ 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userId, 
  isCurrentUser = false,
  badges: propBadges
}) => {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const userBadges = useSelector((state: RootState) => state.badges.badges);
  const [displayBadges, setDisplayBadges] = useState<string[]>([]);
  
  // Determine which badges to display - from props if provided, otherwise from Redux
  useEffect(() => {
    if (propBadges) {
      setDisplayBadges(propBadges);
    } else {
      setDisplayBadges(userBadges);
    }
  }, [propBadges, userBadges]);
  
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
      
      {isCurrentUser && (
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
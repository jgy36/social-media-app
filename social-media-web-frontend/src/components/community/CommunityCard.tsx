// Updated CommunityCard.tsx
import { useRouter } from "next/router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp } from "lucide-react";
import { safeNavigate } from "@/utils/routerHistoryManager";
import { CommunityCardProps } from "@/types/componentProps";

interface ExtendedCommunityCardProps extends CommunityCardProps {
  community: CommunityCardProps["community"] & { trending?: boolean };
}

const CommunityCard: React.FC<ExtendedCommunityCardProps> = ({
  community,
  onJoin,
}) => {
  const router = useRouter();

  // Navigate to community page
  const handleNavigate = () => {
    safeNavigate(router, `/community/${community.id}`);
  };

  return (
    <div
      key={community.id}
      className="block cursor-pointer"
      onClick={handleNavigate}
      data-testid={`community-card-${community.id}`}
    >
      <Card
        className="shadow-sm hover:shadow-md transition-shadow border-l-4 h-[170px]"
        style={{ borderLeftColor: community.color || "var(--primary)" }}
      >
        <CardContent className="p-4 h-full flex flex-col">
          {/* Top row with name and join button */}
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-base font-medium truncate pr-2">{community.name}</h3>
            
            <Button
              variant={community.isJoined ? "outline" : "default"}
              size="sm"
              className={community.isJoined ? "border-primary/50" : ""}
              onClick={(e) => {
                e.stopPropagation();
                onJoin(e, community.id);
              }}
            >
              {community.isJoined ? "Joined" : "Join"}
            </Button>
          </div>
          
          {/* Trending badge */}
          <div className="h-6 mb-2">
            {community.trending && (
              <Badge
                variant="outline"
                className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
              >
                <TrendingUp className="h-3 w-3 mr-1" /> Trending
              </Badge>
            )}
          </div>
          
          {/* Description with fixed height */}
          <div className="h-14 mb-2">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {community.description}
            </p>
          </div>
          
          {/* Members count at bottom */}
          <div className="mt-auto flex items-center text-xs text-muted-foreground">
            <Users className="h-3 w-3 mr-1" />
            <span>{community.members.toLocaleString()} members</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityCard;
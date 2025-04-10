// src/components/community/CommunityHeader.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar } from "lucide-react";
import { CommunityData } from "@/types/community";
import NotificationToggle from "./NotificationToggle";

interface CommunityHeaderProps {
  community: CommunityData;
  isJoined: boolean;
  memberCount: number;
  onToggleMembership: () => void;
}

const CommunityHeader = ({
  community,
  isJoined,
  memberCount,
  onToggleMembership
}: CommunityHeaderProps) => {
  return (
    <Card className="shadow-lg border border-border mb-6">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl flex items-center">
              {community.name}
              <Badge
                variant="outline"
                className="ml-2 bg-primary/10 text-primary"
              >
                {memberCount.toLocaleString()} members
              </Badge>
            </CardTitle>
            <CardDescription className="mt-1">
              {community.description}
            </CardDescription>
          </div>

          <div className="flex space-x-2">
            <Button
              variant={isJoined ? "outline" : "default"}
              className={`${
                isJoined ? "border-primary/50 text-primary" : ""
              }`}
              onClick={onToggleMembership}
            >
              <Users className="h-4 w-4 mr-2" />
              {isJoined ? "Joined" : "Join"}
            </Button>

            {/* Only show notification toggle if joined */}
            {isJoined && (
              <NotificationToggle 
                communityId={community.id} 
                initialState={community.isNotificationsOn}
              />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-1" />
          <span>
            Created {new Date(community.created).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunityHeader;
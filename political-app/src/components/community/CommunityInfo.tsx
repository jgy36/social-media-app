// src/components/community/CommunityInfo.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Info, Shield, Users, User, Calendar } from "lucide-react";
import { CommunityData } from "@/types/community";
import Link from "next/link";

interface CommunityInfoProps {
  community: CommunityData;
  memberCount: number;
  onJoin: () => void;
}

const CommunityInfo = ({ community, memberCount, onJoin }: CommunityInfoProps) => {
  const { rules, moderators, isJoined } = community;

  return (
    <>
      {/* About Community */}
      <Card className="shadow-sm border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Info className="h-4 w-4 mr-2" />
            About Community
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>{community.description}</p>

          <div>
            <div className="flex items-center mb-1">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">
                {memberCount.toLocaleString()} members
              </span>
            </div>

            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>
                Created {new Date(community.created).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Only show Join button if user has not joined the community */}
          {!isJoined && (
            <Button className="w-full" onClick={onJoin}>
              Join Community
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Community Rules */}
      <Card className="shadow-sm border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Community Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rules && rules.length > 0 ? (
              rules.map((rule, index) => (
                <div key={index} className="pb-2">
                  <div className="font-medium">
                    {index + 1}. {rule}
                  </div>
                  {index < rules.length - 1 && <Separator className="mt-2" />}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">
                No specific rules have been set for this community.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Moderators */}
      <Card className="shadow-sm border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Moderators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {moderators && moderators.length > 0 ? (
              moderators.map((mod, index) => (
                <div key={index} className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Link href={`/profile/${mod}`}>
                    <span className="text-primary hover:underline cursor-pointer">
                      {mod}
                    </span>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">
                No moderators listed for this community.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default CommunityInfo;
// src/components/settings/PrivacySettings.tsx
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const PrivacySettings: React.FC = () => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Privacy Settings</CardTitle>
        <CardDescription>
          Control your profile visibility and data sharing preferences.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Public Profile</Label>
              <p className="text-sm text-muted-foreground">
                Allow your profile to be visible to everyone
              </p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Political Affiliation</Label>
              <p className="text-sm text-muted-foreground">
                Display your political preferences on your profile
              </p>
            </div>
            <Switch defaultChecked={false} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Post History</Label>
              <p className="text-sm text-muted-foreground">
                Allow others to see your posting history
              </p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Voting Record</Label>
              <p className="text-sm text-muted-foreground">
                Show your voting record on your profile
              </p>
            </div>
            <Switch defaultChecked={false} />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button>Save Privacy Settings</Button>
      </CardFooter>
    </Card>
  );
};

export default PrivacySettings;
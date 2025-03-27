// src/components/settings/NotificationSettings.tsx
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

const NotificationSettings: React.FC = () => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Manage how and when you receive notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notification emails
              </p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>New Comment Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone comments on your post
              </p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mention Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone mentions you
              </p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Political Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about politicians you follow
              </p>
            </div>
            <Switch defaultChecked={false} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Community Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates from your communities
              </p>
            </div>
            <Switch defaultChecked={true} />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button>Save Notification Settings</Button>
      </CardFooter>
    </Card>
  );
};

export default NotificationSettings;
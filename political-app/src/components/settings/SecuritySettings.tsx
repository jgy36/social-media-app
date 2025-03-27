// src/components/settings/SecuritySettings.tsx
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SecuritySettings: React.FC = () => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>
          Manage your account security and authentication settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">
              Confirm New Password
            </Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">
            Two-Factor Authentication
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Enhance your account security with 2FA
            </p>
            <Button variant="outline" size="sm">
              Enable 2FA
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Session Management</h3>
          <div className="p-4 border rounded-md bg-muted/10">
            <h4 className="font-medium">Current Session</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Browser: Chrome on macOS
            </p>
            <Button variant="destructive" size="sm">
              Sign Out All Devices
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button>Update Password</Button>
      </CardFooter>
    </Card>
  );
};

export default SecuritySettings;
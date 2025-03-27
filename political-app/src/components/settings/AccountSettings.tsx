// src/components/settings/AccountSettings.tsx
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AccountSettings: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Manage your account settings and preferences.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            value={user.email || ""}
            disabled
            className="bg-muted/50"
          />
          <p className="text-sm text-muted-foreground">
            Your email address is used for login and notifications.
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-base">Account Type</Label>
          <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/20">
            <div className="bg-primary h-2 w-2 rounded-full"></div>
            <span>Standard User Account</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-base">Connected Accounts</Label>
          <div className="p-4 border rounded-md">
            <p className="text-sm text-muted-foreground">
              No connected accounts. Link your social accounts for
              easier login.
            </p>
            <Button variant="outline" className="mt-2">
              Connect Account
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSettings;
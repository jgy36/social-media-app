// src/components/settings/NotificationSettings.tsx
import React, { useState, useEffect } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/api/apiClient";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";

// Define the notification preferences interface
interface NotificationPreferences {
  emailNotifications: boolean;
  newCommentNotifications: boolean;
  mentionNotifications: boolean;
  politicalUpdates: boolean;
  communityUpdates: boolean;
  directMessageNotifications: boolean;
  followNotifications: boolean;
  likeNotifications: boolean;
}

const NotificationSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    newCommentNotifications: true,
    mentionNotifications: true,
    politicalUpdates: false,
    communityUpdates: true,
    directMessageNotifications: true,
    followNotifications: true,
    likeNotifications: true,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const userId = useSelector((state: RootState) => state.user.id);
  
  // Fetch current notification settings
  useEffect(() => {
    const fetchNotificationPreferences = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.get('/users/notification-preferences');
        setPreferences(response.data || {});
        setHasChanges(false);
      } catch (error) {
        console.error('Error fetching notification preferences:', error);
        setError('Failed to load notification preferences');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotificationPreferences();
  }, [userId]);
  
  // Handle preference toggling
  const handleTogglePreference = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setHasChanges(true);
    setSaveSuccess(false);
  };
  
  // Save preferences
  const handleSavePreferences = async () => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);
    
    try {
      await apiClient.put('/users/notification-preferences', preferences);
      
      setSaveSuccess(true);
      setHasChanges(false);
      
      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated",
        duration: 3000,
      });
      
      // Update Redux store if needed
      // dispatch(updateNotificationPreferences(preferences));
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      setError('Failed to save notification preferences');
      
      toast({
        title: "Error",
        description: "Failed to save your notification preferences",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Manage how and when you receive notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Manage how and when you receive notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {saveSuccess && (
          <Alert variant="default" className="bg-green-50 border-green-300 text-green-800">
            <Check className="h-4 w-4" />
            <AlertDescription>Notification preferences saved successfully!</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive important notifications via email
              </p>
            </div>
            <Switch 
              id="email-notifications"
              checked={preferences.emailNotifications}
              onCheckedChange={() => handleTogglePreference('emailNotifications')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="comment-notifications">New Comment Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone comments on your post
              </p>
            </div>
            <Switch 
              id="comment-notifications"
              checked={preferences.newCommentNotifications}
              onCheckedChange={() => handleTogglePreference('newCommentNotifications')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="mention-notifications">Mention Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone mentions you
              </p>
            </div>
            <Switch 
              id="mention-notifications"
              checked={preferences.mentionNotifications}
              onCheckedChange={() => handleTogglePreference('mentionNotifications')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="like-notifications">Like Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone likes your post
              </p>
            </div>
            <Switch 
              id="like-notifications"
              checked={preferences.likeNotifications}
              onCheckedChange={() => handleTogglePreference('likeNotifications')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="follow-notifications">Follow Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone follows you
              </p>
            </div>
            <Switch 
              id="follow-notifications"
              checked={preferences.followNotifications}
              onCheckedChange={() => handleTogglePreference('followNotifications')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="message-notifications">Direct Message Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when you receive a direct message
              </p>
            </div>
            <Switch 
              id="message-notifications"
              checked={preferences.directMessageNotifications}
              onCheckedChange={() => handleTogglePreference('directMessageNotifications')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="political-updates">Political Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about politicians you follow
              </p>
            </div>
            <Switch 
              id="political-updates"
              checked={preferences.politicalUpdates}
              onCheckedChange={() => handleTogglePreference('politicalUpdates')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="community-updates">Community Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates from your communities
              </p>
            </div>
            <Switch 
              id="community-updates"
              checked={preferences.communityUpdates}
              onCheckedChange={() => handleTogglePreference('communityUpdates')}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSavePreferences} 
          disabled={isSaving || !hasChanges}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Notification Settings"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotificationSettings;
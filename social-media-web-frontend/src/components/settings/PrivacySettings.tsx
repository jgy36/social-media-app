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
import { Loader2, AlertCircle, Check, Info, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/api/apiClient";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

// Define simplified privacy settings interface
interface PrivacySettings {
  privateAccount: boolean;
}

// Define the API response interface
interface PrivacySettingsResponse {
  publicProfile: boolean;
  showPoliticalAffiliation?: boolean;
  showPostHistory?: boolean;
  showVotingRecord?: boolean;
  allowDirectMessages?: boolean;
  allowFollowers?: boolean;
  allowSearchIndexing?: boolean;
  dataSharing?: boolean;
}

const PrivacySettings: React.FC = () => {
  const [settings, setSettings] = useState<PrivacySettings>({
    privateAccount: false,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const { toast } = useToast();
  const userId = useSelector((state: RootState) => state.user.id);
  
  // Fetch current privacy settings
  useEffect(() => {
    const fetchPrivacySettings = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.get<PrivacySettingsResponse>('/users/privacy-settings');
        
        // Map the existing privacy settings to our simplified model
        // We'll use publicProfile (inverted) as the privateAccount setting
        setSettings({
          privateAccount: response.data.publicProfile === false
        });
        
        setHasChanges(false);
      } catch (error) {
        console.error('Error fetching privacy settings:', error);
        setError('Failed to load privacy settings');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPrivacySettings();
  }, [userId]);
  
  // Handle setting toggling
  const togglePrivateAccount = () => {
    setSettings(prev => ({
      privateAccount: !prev.privateAccount
    }));
    setHasChanges(true);
    setSaveSuccess(false);
  };
  
  // Save settings
  const handleSaveSettings = async () => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);
    
    try {
      // Map our simplified settings back to what the API expects
      // The API expects the full privacy settings object
      await apiClient.put('/users/privacy-settings', {
        // Invert privateAccount to get publicProfile
        publicProfile: !settings.privateAccount,
        // Keep other settings with sensible privacy-oriented defaults
        showPoliticalAffiliation: false,
        showPostHistory: !settings.privateAccount, // Hide post history if account is private
        showVotingRecord: false,
        allowDirectMessages: true, // Allow DMs by default
        allowFollowers: true, // We need this to be true for follow requests to work
        allowSearchIndexing: !settings.privateAccount, // Don't index private accounts
        dataSharing: false,
      });
      
      setSaveSuccess(true);
      setHasChanges(false);
      
      toast({
        title: "Settings Saved",
        description: "Your privacy settings have been updated",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      setError('Failed to save privacy settings');
      
      toast({
        title: "Error",
        description: "Failed to save your privacy settings",
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
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>
            Control your profile visibility and post privacy.
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
        <CardTitle>Privacy Settings</CardTitle>
        <CardDescription>
          Control who can see your content and how they can interact with you.
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
          <Alert variant="default" className="bg-green-50 border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
            <Check className="h-4 w-4" />
            <AlertDescription>Privacy settings saved successfully!</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          <div className="bg-muted/30 p-4 rounded-md mb-2">
            <div className="flex items-start">
              <Info className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                When your account is private, only your followers can see your posts. 
                People must send a follow request which you can approve or deny.
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="space-y-0.5">
                  <Label htmlFor="private-account" className="text-base font-medium">Private Account</Label>
                  <p className="text-sm text-muted-foreground">
                    Only approved followers can see your posts and activity
                  </p>
                </div>
                
                {settings.privateAccount && (
                  <div className="mt-2 p-3 bg-primary/10 rounded-md text-xs">
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Your posts are only visible to your followers</li>
                      <li>People must request to follow you</li>
                      <li>Your profile won&apos;t appear in search results</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            <Switch 
              id="private-account"
              checked={settings.privateAccount}
              onCheckedChange={togglePrivateAccount}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSaveSettings} 
          disabled={isSaving || !hasChanges}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Privacy Settings"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PrivacySettings;
// src/components/settings/PrivacySettings.tsx
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
import { Loader2, AlertCircle, Check, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/api/apiClient";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

// Define the privacy settings interface
interface PrivacySettings {
  publicProfile: boolean;
  showPoliticalAffiliation: boolean;
  showPostHistory: boolean;
  showVotingRecord: boolean;
  allowDirectMessages: boolean;
  allowFollowers: boolean;
  allowSearchIndexing: boolean;
  dataSharing: boolean;
}

const PrivacySettings: React.FC = () => {
  const [settings, setSettings] = useState<PrivacySettings>({
    publicProfile: true,
    showPoliticalAffiliation: false,
    showPostHistory: true,
    showVotingRecord: false,
    allowDirectMessages: true,
    allowFollowers: true,
    allowSearchIndexing: true,
    dataSharing: false,
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
        const response = await apiClient.get('/users/privacy-settings');
        setSettings(response.data);
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
  const handleToggleSetting = (key: keyof PrivacySettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
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
      await apiClient.put('/users/privacy-settings', settings);
      
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
            Control your profile visibility and data sharing preferences.
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
          Control your profile visibility and data sharing preferences.
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
            <AlertDescription>Privacy settings saved successfully!</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          <div className="bg-muted/30 p-4 rounded-md mb-2">
            <div className="flex items-start">
              <Info className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                These settings control who can see your profile information and how your data is used.
                Review them carefully to ensure they match your privacy preferences.
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="public-profile">Public Profile</Label>
                <p className="text-sm text-muted-foreground">
                  Allow your profile to be visible to everyone
                </p>
              </div>
              <Switch 
                id="public-profile"
                checked={settings.publicProfile}
                onCheckedChange={() => handleToggleSetting('publicProfile')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="political-affiliation">Show Political Affiliation</Label>
                <p className="text-sm text-muted-foreground">
                  Display your political preferences on your profile
                </p>
              </div>
              <Switch 
                id="political-affiliation"
                checked={settings.showPoliticalAffiliation}
                onCheckedChange={() => handleToggleSetting('showPoliticalAffiliation')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="post-history">Post History</Label>
                <p className="text-sm text-muted-foreground">
                  Allow others to see your posting history
                </p>
              </div>
              <Switch 
                id="post-history"
                checked={settings.showPostHistory}
                onCheckedChange={() => handleToggleSetting('showPostHistory')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="voting-record">Voting Record</Label>
                <p className="text-sm text-muted-foreground">
                  Show your voting record on your profile
                </p>
              </div>
              <Switch 
                id="voting-record"
                checked={settings.showVotingRecord}
                onCheckedChange={() => handleToggleSetting('showVotingRecord')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="direct-messages">Allow Direct Messages</Label>
                <p className="text-sm text-muted-foreground">
                  Let other users send you direct messages
                </p>
              </div>
              <Switch 
                id="direct-messages"
                checked={settings.allowDirectMessages}
                onCheckedChange={() => handleToggleSetting('allowDirectMessages')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allow-followers">Allow Followers</Label>
                <p className="text-sm text-muted-foreground">
                  Let other users follow your profile
                </p>
              </div>
              <Switch 
                id="allow-followers"
                checked={settings.allowFollowers}
                onCheckedChange={() => handleToggleSetting('allowFollowers')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="search-indexing">Allow Search Indexing</Label>
                <p className="text-sm text-muted-foreground">
                  Allow your profile to appear in search results
                </p>
              </div>
              <Switch 
                id="search-indexing"
                checked={settings.allowSearchIndexing}
                onCheckedChange={() => handleToggleSetting('allowSearchIndexing')}
              />
            </div>
            
            <div className="pt-4 border-t mt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="data-sharing" className="font-medium">Data Sharing</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow anonymous data sharing for platform improvements
                  </p>
                </div>
                <Switch 
                  id="data-sharing"
                  checked={settings.dataSharing}
                  onCheckedChange={() => handleToggleSetting('dataSharing')}
                />
              </div>
              
              <div className="mt-2 p-3 bg-muted/20 rounded-md text-xs text-muted-foreground">
                <p>
                  When enabled, we may use anonymized data about your app usage to improve our services.
                  This data cannot be traced back to you personally. We never share your personal data
                  with third parties without your explicit consent.
                </p>
              </div>
            </div>
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
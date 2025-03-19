// political-app/src/pages/settings.tsx
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Check, Save, ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MainLayout from "@/components/layout/MainLayout";
import { updateUsername } from "@/utils/api";
import { updateUserProfile } from "@/redux/slices/userSlice";

const SettingsPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Initialize form with current username
  useEffect(() => {
    if (user.username) {
      setUsername(user.username);
    }
  }, [user.username]);

  // Handle username validation
  const validateUsername = (value: string): boolean => {
    // Reset previous errors
    setUsernameError(null);

    // Username requirements: 3-20 characters, alphanumeric, underscores, hyphens
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    
    if (!value.trim()) {
      setUsernameError("Username is required");
      return false;
    }
    
    if (value.includes(" ")) {
      setUsernameError("Username cannot contain spaces");
      return false;
    }
    
    if (!usernameRegex.test(value)) {
      setUsernameError("Username can only contain letters, numbers, underscores, and hyphens (3-20 characters)");
      return false;
    }
    
    return true;
  };

  // Handle username update
  const handleUpdateUsername = async () => {
    // Validate input
    if (!validateUsername(username)) {
      return;
    }

    setIsSubmitting(true);
    setSuccess(false);
    
    try {
      // Call API to update username
      const result = await updateUsername(username);
      
      if (result.success) {
        setSuccess(true);
        // Refresh user profile to get updated username
        await dispatch(updateUserProfile());
        // Success message will show automatically
      } else {
        setUsernameError(result.message || "Failed to update username");
      }
    } catch (error) {
      console.error("Error updating username:", error);
      setUsernameError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push("/profile");
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="max-w-3xl mx-auto p-6">
          <Button 
            onClick={handleBack} 
            variant="ghost" 
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
          </Button>

          <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Edit Username</CardTitle>
                  <CardDescription>
                    Change your username. This will affect how others can mention you in posts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {success && (
                    <Alert className="mb-4 bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300">
                      <Check className="h-4 w-4" />
                      <AlertTitle>Success!</AlertTitle>
                      <AlertDescription>
                        Your username has been updated successfully. You can now be mentioned as @{username}.
                      </AlertDescription>
                    </Alert>
                  )}

                  {usernameError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{usernameError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="flex items-center">
                      <span className="mr-2 text-muted-foreground">@</span>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="your-username"
                        className={usernameError ? "border-destructive" : ""}
                        disabled={isSubmitting}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your username must be 3-20 characters and can only contain letters, 
                      numbers, underscores, and hyphens. No spaces allowed.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    onClick={handleUpdateUsername}
                    disabled={isSubmitting || username === user.username}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account settings and preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Account settings will be available in a future update.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Manage how and when you receive notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Notification settings will be available in a future update.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default SettingsPage;
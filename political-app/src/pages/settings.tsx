// political-app/src/pages/settings.tsx
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
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
import { Switch } from "@/components/ui/switch";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Check,
  Save,
  ArrowLeft,
  Shield,
  Bell,
  Eye,
  User,
  Camera,
  X,
} from "lucide-react";
import { useRouter } from "next/router";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MainLayout from "@/components/layout/MainLayout";
import { updateUsername } from "@/api/users"; // Update import
import { updateUserProfile } from "@/redux/slices/userSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";

const SettingsPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user);
  
  // Original username state
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // New profile fields
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);
  const [bioError, setBioError] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  
  // File input ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Get active tab from URL query or default to "profile"
  const [activeTab, setActiveTab] = useState("profile");

  // Initialize form with current username
  useEffect(() => {
    if (user.username) {
      setUsername(user.username);
    }
    if (user.displayName) {
      setDisplayName(user.displayName);
    }
    if (user.bio) {
      setBio(user.bio || "");
    }
    
    // Set default image preview
    if (user.profileImageUrl) {
      setImagePreview(user.profileImageUrl);
    } else if (user.username) {
      // Use default avatar service as fallback
      setImagePreview(`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`);
    }
  }, [user.username, user.displayName, user.bio, user.profileImageUrl]);

  // Set the active tab from URL query parameter (if present)
  useEffect(() => {
    const { tab } = router.query;
    if (tab && typeof tab === "string") {
      setActiveTab(tab);
    }
  }, [router.query]);

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
      setUsernameError(
        "Username can only contain letters, numbers, underscores, and hyphens (3-20 characters)"
      );
      return false;
    }

    return true;
  };
  
  // Handle display name validation
  const validateDisplayName = (value: string): boolean => {
    setDisplayNameError(null);
    
    if (!value.trim()) {
      setDisplayNameError("Name is required");
      return false;
    }
    
    if (value.length > 50) {
      setDisplayNameError("Name must be less than 50 characters");
      return false;
    }
    
    return true;
  };
  
  // Handle bio validation
  const validateBio = (value: string): boolean => {
    setBioError(null);
    
    if (value.length > 250) {
      setBioError("Bio must be less than 250 characters");
      return false;
    }
    
    return true;
  };
  
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image size must be less than 5MB");
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setImageError("File must be an image");
      return;
    }
    
    // Set file and preview
    setProfileImageFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  // Trigger file input click
  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  // Clear selected image
  const handleClearImage = () => {
    setProfileImageFile(null);
    setImagePreview(user.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Original username update handler
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
  
  // New profile update handler
  const handleUpdateProfile = async () => {
    // Reset states
    setSuccess(false);
    
    // Validate all fields
    const isUsernameValid = validateUsername(username);
    const isDisplayNameValid = validateDisplayName(displayName);
    const isBioValid = validateBio(bio);
    
    if (!isUsernameValid || !isDisplayNameValid || !isBioValid) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // First update username if it changed
      if (username !== user.username) {
        const result = await updateUsername(username);
        if (!result.success) {
          setUsernameError(result.message || "Failed to update username");
          setIsSubmitting(false);
          return;
        }
      }
      
      // Then update profile information
      let updatedImageUrl = user.profileImageUrl;
      if (profileImageFile) {
        // In a real app, you would upload the image here
        // For now, we'll just simulate a successful upload
        updatedImageUrl = URL.createObjectURL(profileImageFile);
      }
      
      // Update Redux state
      dispatch(updateUserProfile({
        username,
        displayName,
        bio,
        profileImageUrl: updatedImageUrl
      }));
      
      setSuccess(true);
    } catch (error) {
      console.error("Error updating profile:", error);
      setUsernameError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push("/profile");
  };

  // Handle tab change (update URL)
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(
      {
        pathname: "/settings",
        query: { tab: value },
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="max-w-3xl mx-auto p-6">
          <Button onClick={handleBack} variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
          </Button>

          <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-6">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Profile
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Account
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Eye className="h-4 w-4" /> Privacy
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-2"
              >
                <Bell className="h-4 w-4" /> Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>
                    Update your profile information and appearance.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {success && (
                    <Alert className="mb-4 bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300">
                      <Check className="h-4 w-4" />
                      <AlertTitle>Success!</AlertTitle>
                      <AlertDescription>
                        Your profile has been updated successfully.
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
                  
                  {/* Profile Image Section */}
                  <div className="flex flex-col items-center space-y-4">
                    <Label htmlFor="profile-image">Profile Photo</Label>
                    
                    <div className="relative">
                      <Avatar className="h-24 w-24 border-2 border-primary/20">
                        {imagePreview ? (
                          <AvatarImage src={imagePreview} alt="Profile" />
                        ) : (
                          <AvatarFallback>
                            {username ? username.charAt(0).toUpperCase() : 'U'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      
                      <div className="absolute -bottom-2 -right-2 flex space-x-1">
                        <Button 
                          type="button"
                          size="icon"
                          variant="default"
                          className="h-8 w-8 rounded-full"
                          onClick={handleImageButtonClick}
                          title="Upload image"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                        
                        {profileImageFile && (
                          <Button 
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8 rounded-full"
                            onClick={handleClearImage}
                            title="Remove new image"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                    
                    {imageError && (
                      <p className="text-sm text-destructive">{imageError}</p>
                    )}
                    
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                      Upload a profile picture. JPG, PNG or GIF. Max 5MB.
                    </p>
                  </div>
                  
                  {/* Name Section */}
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Full Name</Label>
                    <Input
                      id="display-name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      className={displayNameError ? "border-destructive" : ""}
                      disabled={isSubmitting}
                    />
                    {displayNameError && (
                      <p className="text-sm text-destructive">{displayNameError}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      This is your public display name. It can be your real name or any name you'd like to be called.
                    </p>
                  </div>
                  
                  {/* Username Section */}
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="flex items-center">
                      <span className="mr-2 text-muted-foreground">@</span>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="username"
                        className={usernameError ? "border-destructive" : ""}
                        disabled={isSubmitting}
                      />
                    </div>
                    {usernameError && (
                      <p className="text-sm text-destructive">{usernameError}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Your username must be 3-20 characters and can only contain
                      letters, numbers, underscores, and hyphens. No spaces allowed.
                    </p>
                  </div>
                  
                  {/* Bio Section */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us a little about yourself"
                      className={bioError ? "border-destructive" : ""}
                      disabled={isSubmitting}
                      rows={4}
                    />
                    {bioError && (
                      <p className="text-sm text-destructive">{bioError}</p>
                    )}
                    <div className="flex justify-between">
                      <p className="text-sm text-muted-foreground">
                        Brief description for your profile. Maximum 250 characters.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {bio.length}/250
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleUpdateProfile}
                    disabled={isSubmitting || (
                      username === user.username && 
                      displayName === user.displayName &&
                      bio === user.bio &&
                      !profileImageFile
                    )}
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
            </TabsContent>

            <TabsContent value="privacy">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>
                    Control your profile visibility and data sharing
                    preferences.
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
                      <Switch checked={true} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Political Affiliation</Label>
                        <p className="text-sm text-muted-foreground">
                          Display your political preferences on your profile
                        </p>
                      </div>
                      <Switch checked={false} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Post History</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow others to see your posting history
                        </p>
                      </div>
                      <Switch checked={true} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Voting Record</Label>
                        <p className="text-sm text-muted-foreground">
                          Show your voting record on your profile
                        </p>
                      </div>
                      <Switch checked={false} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Privacy Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
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
                      <Switch checked={true} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>New Comment Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when someone comments on your post
                        </p>
                      </div>
                      <Switch checked={true} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Mention Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when someone mentions you
                        </p>
                      </div>
                      <Switch checked={true} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Political Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive updates about politicians you follow
                        </p>
                      </div>
                      <Switch checked={false} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Community Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive updates from your communities
                        </p>
                      </div>
                      <Switch checked={true} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Notification Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="security">
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
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default SettingsPage;
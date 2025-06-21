// src/components/profile/ProfileSettingsForm.tsx
import { useState, useEffect, useRef, useCallback } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, AlertCircle, Camera, X, Save } from "lucide-react";
import { updateUserProfile } from "@/redux/slices/userSlice";
import { getProfileImageUrl, getFullImageUrl } from "@/utils/imageUtils";
import { updateProfile } from "@/api/users";

interface ProfileSettingsFormProps {
  onSuccess?: () => void;
}

const ProfileSettingsForm: React.FC<ProfileSettingsFormProps> = ({
  onSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user);

  // Form states
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // UI states
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);
  const [bioError, setBioError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(Date.now());

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with current user data
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setDisplayName(user.displayName || "");
      setBio(user.bio || "");

      // Set initial image preview
      if (user.profileImageUrl) {
        setImagePreview(getProfileImageUrl(user.profileImageUrl, user.username));
      }
    }
  }, [user]);

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
    if (!file.type.startsWith("image/")) {
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
    // Use the existing profile image or fallback
    setImagePreview(
      user.profileImageUrl 
        ? getProfileImageUrl(user.profileImageUrl, user.username)
        : null
    );
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Success notification for image update
  const notifyImageUpdate = useCallback((imageUrl: string) => {
    console.log("Dispatching profileImageUpdated event with:", imageUrl);
    window.dispatchEvent(
      new CustomEvent("profileImageUpdated", {
        detail: imageUrl,
      })
    );
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Reset validation errors
    setUsernameError(null);
    setDisplayNameError(null);
    setBioError(null);
    setImageError(null);
    setGeneralError(null);
    
    // Validate form fields
    const isUsernameValid = validateUsername(username);
    const isDisplayNameValid = validateDisplayName(displayName);
    const isBioValid = validateBio(bio);
    
    if (!isUsernameValid || !isDisplayNameValid || !isBioValid) {
      return; // Don't submit if validation fails
    }

    setIsSubmitting(true);

    try {
      // Call the API to update profile
      const profileResult = await updateProfile({
        displayName,
        bio,
        profileImage: profileImageFile || undefined,
      });

      // Log the complete response for debugging
      console.log("Profile update response:", profileResult);

      if (!profileResult.success) {
        setGeneralError(profileResult.message || "Failed to update profile");
        setIsSubmitting(false);
        return;
      }

      // Handle the updated profile image URL
      if (profileResult.profileImageUrl) {
        console.log("New profile image URL:", profileResult.profileImageUrl);
        
        // Notify components about the image update with the raw URL
        notifyImageUpdate(profileResult.profileImageUrl);
        
        // You need to update Redux after the image is successfully uploaded
        dispatch(
          updateUserProfile({
            username,
            displayName,
            bio,
            profileImageUrl: profileResult.profileImageUrl,
          })
        );
      } else {
        // Update Redux without changing the profile image
        dispatch(
          updateUserProfile({
            username,
            displayName,
            bio,
          })
        );
      }

      setSuccess(true);
      setFormKey(Date.now()); // Reset form state to force re-render

      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setGeneralError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-md" key={formKey}>
      <form onSubmit={handleSubmit}>
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

          {generalError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          )}

          {/* Profile Image Section */}
          <div className="flex flex-col items-center space-y-4">
            <Label htmlFor="profile-image">Profile Photo</Label>

            <div className="relative">
              <Avatar className="h-24 w-24 border-2 border-primary/20">
                {imagePreview ? (
                  <AvatarImage
                    src={imagePreview}
                    alt={user.username || "User"}
                    onError={(e) => {
                      console.error("Failed to load profile image preview:", e);
                      
                      // Only fall back to default if not showing preview of new image
                      if (!profileImageFile) {
                        // Try the image proxy directly as a fallback
                        if (user.profileImageUrl) {
                          e.currentTarget.src = getFullImageUrl(user.profileImageUrl);
                        } else {
                          // Last resort: default avatar
                          e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${
                            user.username || "default"
                          }`;
                        }
                      }
                    }}
                  />
                ) : (
                  <AvatarFallback>
                    {username ? username.charAt(0).toUpperCase() : "U"}
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
              This is your public display name. It can be your real name or any
              name you&apos;d like to be called.
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
            {bioError && <p className="text-sm text-destructive">{bioError}</p>}
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                Brief description for your profile. Maximum 250 characters.
              </p>
              <p className="text-sm text-muted-foreground">{bio.length}/250</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              (username === user.username &&
                displayName === user.displayName &&
                bio === user.bio &&
                !profileImageFile)
            }
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
      </form>
    </Card>
  );
};

export default ProfileSettingsForm;
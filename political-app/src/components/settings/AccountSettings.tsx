// src/components/settings/AccountSettings.tsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Loader2,
  AlertCircle,
  Check,
  Mail,
  Shield,
  ArrowRight,
  Download,
  Trash2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/api/apiClient";
import { useRouter } from "next/router";

const AccountSettings: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const { toast } = useToast();

  // Email states
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isChangeEmailDialogOpen, setIsChangeEmailDialogOpen] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  // Account management states
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] =
    useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );

  // Account deletion states
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] =
    useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Data export states
  const [isExportingData, setIsExportingData] = useState(false);

  // Connected accounts state
  const [connectedAccounts, setConnectedAccounts] = useState<{
    google?: boolean;
    facebook?: boolean;
    twitter?: boolean;
    apple?: boolean;
  }>({});

  // Add this function to your AccountSettings.tsx component
  const fetchConnectedAccounts = async () => {
    try {
      // Optional: add loading state if you want to show a loading indicator
      // setLoading(true);

      const accountsResponse = await apiClient.get("/users/connected-accounts");
      setConnectedAccounts(accountsResponse.data || {});
    } catch (error) {
      console.error("Error fetching connected accounts:", error);
      toast({
        title: "Error",
        description: "Failed to refresh connected accounts",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      // If you added loading state, reset it here
      // setLoading(false);
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch email verification status
        const verificationResponse = await apiClient.get(
          "/users/email/verification-status"
        );
        setIsEmailVerified(verificationResponse.data?.isVerified || false);

        // Fetch email
        setEmail(user.email || "");

        // Fetch connected accounts
        const accountsResponse = await apiClient.get(
          "/users/connected-accounts"
        );
        setConnectedAccounts(accountsResponse.data || {});
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [user.email]);

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle email change request
  const handleChangeEmail = async () => {
    // Validate email
    if (!validateEmail(newEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsChangingEmail(true);
    setEmailError(null);

    try {
      const response = await apiClient.post("/users/email/change", {
        newEmail,
      });

      setVerificationSent(true);
      setIsChangingEmail(false);

      toast({
        title: "Verification Email Sent",
        description:
          "Please check your new email inbox for verification instructions",
        duration: 5000,
      });
    } catch (error: any) {
      setEmailError(
        error.response?.data?.message || "Failed to request email change"
      );
      setIsChangingEmail(false);
    }
  };

  // Handle sending verification email
  const handleSendVerificationEmail = async () => {
    try {
      await apiClient.post("/users/email/send-verification");

      toast({
        title: "Verification Email Sent",
        description: "Please check your inbox for verification instructions",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          "Failed to send verification email. Please try again later.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Handle verification code submission
  const handleVerifyEmail = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setVerificationError("Please enter a valid 6-digit verification code");
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      await apiClient.post("/users/email/verify", { code: verificationCode });

      setIsEmailVerified(true);
      setIsVerificationDialogOpen(false);

      toast({
        title: "Email Verified",
        description: "Your email has been successfully verified",
        duration: 3000,
      });
    } catch (error: any) {
      setVerificationError(
        error.response?.data?.message || "Invalid verification code"
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle data export
  const handleExportData = async () => {
    setIsExportingData(true);

    try {
      const response = await apiClient.get("/users/data-export", {
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `politicalapp-data-${Date.now()}.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Data Export Complete",
        description: "Your data has been exported successfully",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export your data. Please try again later.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsExportingData(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    // Verify confirmation text
    if (deleteConfirmText !== user.username) {
      toast({
        title: "Error",
        description: "Please enter your username correctly to confirm deletion",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsDeleting(true);

    try {
      await apiClient.delete("/users/account");

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted",
        duration: 3000,
      });

      // Redirect to landing page after a brief delay
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete your account. Please try again later.",
        variant: "destructive",
        duration: 3000,
      });
      setIsDeleting(false);
    }
  };

  // In AccountSettings.tsx
  const handleConnectAccount = async (provider: string) => {
    try {
      // Create a function to fetch connected accounts
      const refreshAccounts = async () => {
        try {
          const response = await apiClient.get("/users/connected-accounts");
          setConnectedAccounts(response.data || {});
        } catch (error) {
          console.error("Error fetching connected accounts:", error);
        }
      };

      // Open the popup window
      const popup = window.open(
        `/api/connect-account/${provider}`,
        "Connect Account",
        "width=600,height=700"
      );

      // Setup message listener for communication from popup
      const messageHandler = (event: MessageEvent) => {
        // Verify origin and message type
        if (
          event.origin === window.location.origin &&
          event.data &&
          event.data.type === "oauth-connect-success"
        ) {
          console.log("Received success message from popup", event.data);

          // Remove event listener
          window.removeEventListener("message", messageHandler);

          // Refresh the connected accounts
          refreshAccounts();

          // Show success toast
          toast({
            title: "Account Connected",
            description: `Your ${provider} account has been connected successfully.`,
            duration: 3000,
          });
        }
      };

      // Add message listener
      window.addEventListener("message", messageHandler);

      // Also set a checker for when popup closes
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener("message", messageHandler);

          // Refresh connected accounts list
          refreshAccounts();
        }
      }, 500);
    } catch (error) {
      console.error("Error connecting account:", error);
      toast({
        title: "Error",
        description: `Failed to connect your ${provider} account.`,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Handle disconnecting a social account
  const handleDisconnectAccount = async (provider: string) => {
    try {
      await apiClient.delete(`/users/connected-accounts/${provider}`);

      // Update state
      setConnectedAccounts((prev) => ({
        ...prev,
        [provider]: false,
      }));

      toast({
        title: "Account Disconnected",
        description: `You've successfully disconnected your ${provider} account`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to disconnect your ${provider} account`,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

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
          <div className="flex justify-between items-center">
            <Label htmlFor="email" className="text-base font-medium">
              Email Address
            </Label>
            {!isEmailVerified && (
              <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                Unverified
              </span>
            )}
            {isEmailVerified && (
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full flex items-center">
                <Check className="h-3 w-3 mr-1" />
                Verified
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Input
              id="email"
              value={email}
              disabled
              className="bg-muted/50 flex-grow"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChangeEmailDialogOpen(true)}
            >
              Change
            </Button>
          </div>

          {!isEmailVerified && (
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-muted-foreground">
                Please verify your email address to access all features.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary"
                onClick={handleSendVerificationEmail}
              >
                <Mail className="h-4 w-4 mr-1" />
                Send Verification
              </Button>
            </div>
          )}

          <p className="text-sm text-muted-foreground mt-1">
            Your email address is used for login and notifications.
          </p>
        </div>

        <div className="space-y-2 border-t pt-6">
          <Label className="text-base font-medium">Account Type</Label>
          <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/20">
            <div className="bg-primary h-2 w-2 rounded-full"></div>
            <span>
              {user.role === "ADMIN"
                ? "Administrator Account"
                : "Standard User Account"}
            </span>
          </div>
        </div>

        <div className="space-y-2 border-t pt-6">
          <Label className="text-base font-medium">Connected Accounts</Label>
          <div className="rounded-md border divide-y">
            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-[#4285F4] flex items-center justify-center text-white">
                  <span className="font-bold">G</span>
                </div>
                <div className="ml-3">
                  <p className="font-medium">Google</p>
                  <p className="text-sm text-muted-foreground">
                    {connectedAccounts.google ? "Connected" : "Not connected"}
                  </p>
                </div>
              </div>

              {connectedAccounts.google ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDisconnectAccount("google")}
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleConnectAccount("google")}
                >
                  Connect
                </Button>
              )}
            </div>

            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white">
                  <span className="font-bold">f</span>
                </div>
                <div className="ml-3">
                  <p className="font-medium">Facebook</p>
                  <p className="text-sm text-muted-foreground">
                    {connectedAccounts.facebook ? "Connected" : "Not connected"}
                  </p>
                </div>
              </div>

              {connectedAccounts.facebook ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDisconnectAccount("facebook")}
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleConnectAccount("facebook")}
                >
                  Connect
                </Button>
              )}
            </div>

            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-[#000000] flex items-center justify-center text-white">
                  <span className="font-bold">X</span>
                </div>
                <div className="ml-3">
                  <p className="font-medium">Twitter / X</p>
                  <p className="text-sm text-muted-foreground">
                    {connectedAccounts.twitter ? "Connected" : "Not connected"}
                  </p>
                </div>
              </div>

              {connectedAccounts.twitter ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDisconnectAccount("twitter")}
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleConnectAccount("twitter")}
                >
                  Connect
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t pt-6">
          <Label className="text-base font-medium">Account Management</Label>
          <div className="space-y-4">
            <div className="rounded-md border p-4">
              <div className="flex items-start">
                <Download className="h-5 w-5 mr-3 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Export Your Data</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Download a copy of all your data including posts, comments,
                    and profile information.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportData}
                    disabled={isExportingData}
                  >
                    {isExportingData ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Export Data
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-destructive/30 p-4">
              <div className="flex items-start">
                <Trash2 className="h-5 w-5 mr-3 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-destructive">
                    Delete Account
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Permanently delete your account and all your data. This
                    action cannot be undone.
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDeleteAccountDialogOpen(true)}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Email Change Dialog */}
      <Dialog
        open={isChangeEmailDialogOpen}
        onOpenChange={setIsChangeEmailDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Email Address</DialogTitle>
            <DialogDescription>
              Enter your new email address. We'll send a verification link to
              confirm the change.
            </DialogDescription>
          </DialogHeader>

          {!verificationSent ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="current-email">Current Email</Label>
                <Input
                  id="current-email"
                  value={email}
                  disabled
                  className="bg-muted/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-email">New Email</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter your new email address"
                />
              </div>

              {emailError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{emailError}</AlertDescription>
                </Alert>
              )}

              <div className="bg-muted/30 p-3 rounded-md">
                <div className="flex items-start">
                  <Info className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    After submitting, you'll receive a verification email at
                    your new address. You must click the link in that email to
                    complete the change.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <Alert
                variant="default"
                className="bg-green-50 border-green-300 text-green-800"
              >
                <Check className="h-4 w-4" />
                <AlertDescription>
                  Verification email sent to {newEmail}. Please check your inbox
                  and follow the instructions.
                </AlertDescription>
              </Alert>

              <p className="text-sm text-muted-foreground">
                Don't see the email? Check your spam folder or click "Resend
                Verification" below.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsChangeEmailDialogOpen(false);
                setNewEmail("");
                setEmailError(null);
                setVerificationSent(false);
              }}
            >
              {verificationSent ? "Close" : "Cancel"}
            </Button>

            {!verificationSent ? (
              <Button
                onClick={handleChangeEmail}
                disabled={isChangingEmail || !newEmail}
              >
                {isChangingEmail ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Verification"
                )}
              </Button>
            ) : (
              <Button onClick={handleChangeEmail} disabled={isChangingEmail}>
                Resend Verification
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Verification Dialog */}
      <Dialog
        open={isVerificationDialogOpen}
        onOpenChange={setIsVerificationDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Your Email</DialogTitle>
            <DialogDescription>
              Enter the 6-digit code we sent to your email address.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(
                    e.target.value.replace(/\D/g, "").substring(0, 6)
                  )
                }
                placeholder="000000"
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>

            {verificationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{verificationError}</AlertDescription>
              </Alert>
            )}

            <p className="text-sm text-muted-foreground">
              Didn't receive a code?{" "}
              <button
                onClick={handleSendVerificationEmail}
                className="text-primary hover:underline"
              >
                Resend code
              </button>
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsVerificationDialogOpen(false);
                setVerificationCode("");
                setVerificationError(null);
              }}
            >
              Cancel
            </Button>

            <Button
              onClick={handleVerifyEmail}
              disabled={isVerifying || verificationCode.length !== 6}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog
        open={isDeleteAccountDialogOpen}
        onOpenChange={setIsDeleteAccountDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
              Delete Your Account
            </DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All your data will
              be permanently deleted.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This will delete your account, posts, comments, and all other
                data. This action cannot be reversed.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="delete-confirm">
                Type your username to confirm
              </Label>
              <p className="text-sm text-muted-foreground">
                Please type <span className="font-medium">{user.username}</span>{" "}
                to confirm
              </p>
              <Input
                id="delete-confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={user.username || ""}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteAccountDialogOpen(false);
                setDeleteConfirmText("");
              }}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting || deleteConfirmText !== user.username}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AccountSettings;

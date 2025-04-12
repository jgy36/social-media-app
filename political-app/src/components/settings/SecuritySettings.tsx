// src/components/settings/SecuritySettings.tsx
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Loader2, AlertCircle, Check, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { apiClient } from "@/api/apiClient";

// Interface for TWO-FA setup response
interface TwoFASetupResponse {
  qrCodeUrl: string;
  secretKey: string;
}

const SecuritySettings: React.FC = () => {
  // Form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);

  // 2FA states
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [is2FADialogOpen, setIs2FADialogOpen] = useState(false);
  const [twoFAData, setTwoFAData] = useState<TwoFASetupResponse | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [twoFAError, setTwoFAError] = useState<string | null>(null);
  const [twoFAStep, setTwoFAStep] = useState<'setup' | 'verify'>('setup');

  // Active session state
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.user);

  // Fetch 2FA status and sessions on component mount
  useEffect(() => {
    const fetchSecurityData = async () => {
      try {
        // Fetch 2FA status
        const twoFAResponse = await apiClient.get('/users/2fa/status');
        setIs2FAEnabled(twoFAResponse.data?.enabled || false);
        
        // Fetch active sessions
        const sessionsResponse = await apiClient.get('/users/sessions');
        setActiveSessions(sessionsResponse.data || []);
        setIsLoadingSessions(false);
      } catch (error) {
        console.error('Error fetching security data:', error);
        setSessionsError('Failed to load security information');
        setIsLoadingSessions(false);
      }
    };

    fetchSecurityData();
  }, []);

  // Password validation
  const validatePassword = () => {
    setPasswordError(null);
    
    if (!currentPassword) {
      setPasswordError("Current password is required");
      return false;
    }
    
    if (!newPassword) {
      setPasswordError("New password is required");
      return false;
    }
    
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    
    return true;
  };

  // Handle password update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setPasswordUpdateSuccess(false);
    
    if (!validatePassword()) {
      return;
    }
    
    setIsUpdatingPassword(true);
    
    try {
      await apiClient.put('/users/password', {
        currentPassword,
        newPassword
      });
      
      setPasswordUpdateSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
        duration: 3000,
      });
    } catch (error: any) {
      setPasswordError(error.response?.data?.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Init 2FA setup
  const handleInit2FA = async () => {
    setTwoFAError(null);
    setTwoFAStep('setup');
    
    try {
      const response = await apiClient.post<TwoFASetupResponse>('/users/2fa/setup');
      setTwoFAData(response.data);
      setIs2FADialogOpen(true);
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      setTwoFAError('Failed to set up 2FA. Please try again.');
    }
  };

  // Verify and enable 2FA
  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setTwoFAError('Please enter a valid 6-digit verification code');
      return;
    }
    
    setIsVerifying2FA(true);
    setTwoFAError(null);
    
    try {
      await apiClient.post('/users/2fa/verify', {
        code: verificationCode,
        secret: twoFAData?.secretKey
      });
      
      setIs2FAEnabled(true);
      setIs2FADialogOpen(false);
      setVerificationCode("");
      
      toast({
        title: "Two-factor authentication enabled",
        description: "Your account is now more secure with 2FA",
        duration: 3000,
      });
    } catch (error: any) {
      setTwoFAError(error.response?.data?.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsVerifying2FA(false);
    }
  };

  // Disable 2FA
  const handleDisable2FA = async () => {
    try {
      await apiClient.delete('/users/2fa');
      
      setIs2FAEnabled(false);
      
      toast({
        title: "Two-factor authentication disabled",
        description: "2FA has been turned off for your account",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disable 2FA. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Sign out all devices
  const handleSignOutAllDevices = async () => {
    try {
      await apiClient.post('/users/sessions/logout-all');
      
      toast({
        title: "Successfully signed out",
        description: "You've been signed out from all devices",
        duration: 3000,
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out from all devices",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>
          Manage your account security and authentication settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Password update form */}
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {passwordError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{passwordError}</AlertDescription>
            </Alert>
          )}

          {passwordUpdateSuccess && (
            <Alert variant="default" className="bg-green-50 border-green-300 text-green-800">
              <Check className="h-4 w-4" />
              <AlertDescription>Password updated successfully!</AlertDescription>
            </Alert>
          )}
          
          <Button
            type="submit"
            disabled={isUpdatingPassword}
            className="w-full"
          >
            {isUpdatingPassword ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </form>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">
            Two-Factor Authentication
          </h3>
          
          <div className="bg-muted/30 p-4 rounded-md mb-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Two-factor authentication adds an extra layer of security to your account.
                When enabled, you&apos;ll need your password and a verification code from your 
                authentication app to sign in.
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {is2FAEnabled ? "Enabled" : "Not Enabled"}
              </p>
              <p className="text-sm text-muted-foreground">
                {is2FAEnabled
                  ? "Your account is protected with two-factor authentication"
                  : "Enhance your account security with 2FA"}
              </p>
            </div>
            
            {is2FAEnabled ? (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleDisable2FA}
              >
                Disable 2FA
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleInit2FA}
              >
                Enable 2FA
              </Button>
            )}
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-2">Session Management</h3>
          
          {isLoadingSessions ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>Loading sessions...</span>
            </div>
          ) : sessionsError ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{sessionsError}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="p-4 border rounded-md bg-muted/10">
                <h4 className="font-medium">Active Sessions</h4>
                
                {activeSessions.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {activeSessions.map((session, index) => (
                      <li key={index} className="text-sm">
                        <div className="flex justify-between">
                          <span>{session.browser} on {session.os}</span>
                          <span className="text-muted-foreground">{session.lastActive}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {session.ipAddress} · {session.location || 'Unknown location'}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    Only your current session is active
                  </p>
                )}
                
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="mt-4"
                  onClick={handleSignOutAllDevices}
                >
                  Sign Out All Devices
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {/* Additional footer content can go here */}
      </CardFooter>
      
      {/* 2FA Setup Dialog */}
      <Dialog open={is2FADialogOpen} onOpenChange={setIs2FADialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
          </DialogHeader>
          
          {twoFAStep === 'setup' ? (
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-md">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Download an authenticator app like Google Authenticator or Authy</li>
                  <li>Scan the QR code below with the app</li>
                  <li>Enter the 6-digit verification code from the app</li>
                </ol>
              </div>
              
              {twoFAData?.qrCodeUrl && (
                <div className="flex justify-center my-4">
                  <img 
                    src={twoFAData.qrCodeUrl} 
                    alt="QR Code for 2FA" 
                    className="border p-2 rounded-md"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="twofa-key">Manual entry key:</Label>
                <Input
                  id="twofa-key"
                  value={twoFAData?.secretKey || ''}
                  readOnly
                  onClick={(e) => e.currentTarget.select()}
                />
                <p className="text-xs text-muted-foreground">
                  If you can&apos;t scan the QR code, enter this key manually in your app.
                </p>
              </div>
              
              <Button
                onClick={() => setTwoFAStep('verify')}
                className="w-full"
              >
                Continue
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm">
                Enter the 6-digit verification code from your authenticator app to verify and enable 2FA.
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>
              
              {twoFAError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{twoFAError}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            {twoFAStep === 'verify' && (
              <Button
                variant="outline"
                onClick={() => setTwoFAStep('setup')}
                disabled={isVerifying2FA}
              >
                Back
              </Button>
            )}
            
            {twoFAStep === 'verify' && (
              <Button
                onClick={handleVerify2FA}
                disabled={isVerifying2FA || verificationCode.length !== 6}
              >
                {isVerifying2FA ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Enable"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default SecuritySettings;
// components/settings/SecuritySettings.tsx
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert, Modal, Image } from "react-native";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "@/hooks/use-toast";
import { router } from "expo-router";
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
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [twoFAData, setTwoFAData] = useState<TwoFASetupResponse | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [twoFAError, setTwoFAError] = useState<string | null>(null);
  const [twoFAStep, setTwoFAStep] = useState<"setup" | "verify">("setup");
  const [qrCodeLoading, setQrCodeLoading] = useState(false);
  const [qrCodeError, setQrCodeError] = useState(false);

  // Active session state
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  const { toast } = useToast();
  const currentUser = useSelector((state: RootState) => state.user);

  // Fetch 2FA status and sessions on component mount
  useEffect(() => {
    const fetchSecurityData = async () => {
      try {
        // Fetch 2FA status
        const twoFAResponse = await apiClient.get("/users/2fa/status");
        setIs2FAEnabled(twoFAResponse.data?.enabled || false);

        // Fetch active sessions
        const sessionsResponse = await apiClient.get("/users/sessions");
        setActiveSessions(sessionsResponse.data || []);
        setIsLoadingSessions(false);
      } catch (error) {
        console.error("Error fetching security data:", error);
        setSessionsError("Failed to load security information");
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
  const handleUpdatePassword = async () => {
    setPasswordUpdateSuccess(false);

    if (!validatePassword()) {
      return;
    }

    setIsUpdatingPassword(true);

    try {
      await apiClient.put("/users/password", {
        currentPassword,
        newPassword,
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
    setTwoFAStep("setup");
    setQrCodeLoading(true);
    setQrCodeError(false);

    try {
      const response = await apiClient.post<TwoFASetupResponse>("/users/2fa/setup");
      setTwoFAData(response.data);
      setIs2FAModalOpen(true);
    } catch (error) {
      console.error("Error setting up 2FA:", error);
      setTwoFAError("Failed to set up 2FA. Please try again.");
    } finally {
      setQrCodeLoading(false);
    }
  };

  // Verify and enable 2FA
  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setTwoFAError("Please enter a valid 6-digit verification code");
      return;
    }

    setIsVerifying2FA(true);
    setTwoFAError(null);

    try {
      await apiClient.post("/users/2fa/verify", {
        code: verificationCode,
        secret: twoFAData?.secretKey,
      });

      setIs2FAEnabled(true);
      setIs2FAModalOpen(false);
      setVerificationCode("");

      toast({
        title: "Two-factor authentication enabled",
        description: "Your account is now more secure with 2FA",
        duration: 3000,
      });
    } catch (error: any) {
      setTwoFAError(
        error.response?.data?.message || "Invalid verification code. Please try again."
      );
    } finally {
      setIsVerifying2FA(false);
    }
  };

  // Disable 2FA
  const handleDisable2FA = () => {
    Alert.alert(
      "Disable Two-Factor Authentication",
      "Are you sure you want to disable 2FA? This will make your account less secure.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disable",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete("/users/2fa");
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
          },
        },
      ]
    );
  };

  // Sign out all devices
  const handleSignOutAllDevices = () => {
    Alert.alert(
      "Sign Out All Devices",
      "Are you sure you want to sign out from all devices? You'll need to log in again on other devices.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.post("/users/sessions/logout-all");
              toast({
                title: "Successfully signed out",
                description: "You've been signed out from all devices",
                duration: 3000,
              });
              
              // Redirect to login after a short delay
              setTimeout(() => {
                router.replace("/login");
              }, 2000);
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to sign out from all devices",
                variant: "destructive",
                duration: 3000,
              });
            }
          },
        },
      ]
    );
  };

  const TwoFAModal = () => (
    <Modal
      visible={is2FAModalOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setIs2FAModalOpen(false)}
    >
      <View className="flex-1 bg-white">
        <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
          <Text className="text-xl font-bold">Set Up Two-Factor Authentication</Text>
          <Button 
            onPress={() => setIs2FAModalOpen(false)}
            variant="ghost"
            size="sm"
          >
            <Ionicons name="close" size={24} />
          </Button>
        </View>

        <ScrollView className="flex-1 p-4">
          {twoFAStep === "setup" ? (
            <View className="space-y-4">
              <View className="p-4 bg-gray-50 rounded-lg">
                <Text className="text-sm text-gray-700 mb-2">To set up 2FA:</Text>
                <Text className="text-sm text-gray-600">1. Download an authenticator app like Google Authenticator or Authy</Text>
                <Text className="text-sm text-gray-600">2. Scan the QR code below with the app</Text>
                <Text className="text-sm text-gray-600">3. Enter the 6-digit verification code from the app</Text>
              </View>

              {twoFAData?.qrCodeUrl && (
                <View className="items-center my-4">
                  {qrCodeLoading ? (
                    <View className="w-48 h-48 border border-gray-300 rounded-lg justify-center items-center">
                      <Ionicons name="sync" size={32} color="gray" className="animate-spin" />
                    </View>
                  ) : qrCodeError ? (
                    <View className="w-48 h-48 border border-gray-300 rounded-lg justify-center items-center px-4">
                      <Text className="text-center text-sm text-gray-600">
                        Failed to load QR code. Please use the manual entry key below.
                      </Text>
                    </View>
                  ) : (
                    <Image
                      source={{ uri: twoFAData.qrCodeUrl }}
                      style={{ width: 200, height: 200 }}
                      className="border border-gray-300 rounded-lg"
                      onError={() => setQrCodeError(true)}
                      onLoad={() => setQrCodeLoading(false)}
                    />
                  )}
                </View>
              )}

              <View className="space-y-2">
                <Label>Manual entry key:</Label>
                <Input
                  value={twoFAData?.secretKey || ""}
                  editable={false}
                  className="bg-gray-100"
                />
                <Text className="text-xs text-gray-600">
                  If you can't scan the QR code, enter this key manually in your app.
                </Text>
              </View>

              <Button onPress={() => setTwoFAStep("verify")} className="mt-6">
                Continue
              </Button>
            </View>
          ) : (
            <View className="space-y-4">
              <Text className="text-gray-700">
                Enter the 6-digit verification code from your authenticator app to verify and enable 2FA.
              </Text>

              <View className="space-y-2">
                <Label>Verification Code</Label>
                <Input
                  value={verificationCode}
                  onChangeText={(text) => setVerificationCode(text.replace(/\D/g, "").substring(0, 6))}
                  placeholder="000000"
                  keyboardType="numeric"
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </View>

              {twoFAError && (
                <View className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <View className="flex-row items-center">
                    <Ionicons name="alert-circle" size={20} color="red" />
                    <Text className="ml-2 text-red-700">{twoFAError}</Text>
                  </View>
                </View>
              )}

              <View className="flex-row space-x-4 mt-6">
                <Button
                  onPress={() => setTwoFAStep("setup")}
                  disabled={isVerifying2FA}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>

                <Button
                  onPress={handleVerify2FA}
                  disabled={isVerifying2FA || verificationCode.length !== 6}
                  className="flex-1"
                >
                  {isVerifying2FA ? "Verifying..." : "Verify & Enable"}
                </Button>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <Card className="m-4">
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>
            Manage your account security and authentication settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Password Update Section */}
          <View className="space-y-4">
            <Text className="text-lg font-medium">Change Password</Text>
            
            <View className="space-y-2">
              <Label>Current Password</Label>
              <Input
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="••••••••"
                secureTextEntry
              />
            </View>

            <View className="space-y-2">
              <Label>New Password</Label>
              <Input
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="••••••••"
                secureTextEntry
              />
            </View>

            <View className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                secureTextEntry
              />
            </View>

            {passwordError && (
              <View className="p-4 bg-red-50 rounded-lg border border-red-200">
                <View className="flex-row items-center">
                  <Ionicons name="alert-circle" size={20} color="red" />
                  <Text className="ml-2 text-red-700">{passwordError}</Text>
                </View>
              </View>
            )}

            {passwordUpdateSuccess && (
              <View className="p-4 bg-green-50 rounded-lg border border-green-200">
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="green" />
                  <Text className="ml-2 text-green-700">Password updated successfully!</Text>
                </View>
              </View>
            )}

            <Button onPress={handleUpdatePassword} disabled={isUpdatingPassword}>
              {isUpdatingPassword ? "Updating..." : "Update Password"}
            </Button>
          </View>

          {/* Two-Factor Authentication Section */}
          <View className="border-t pt-6 space-y-4">
            <Text className="text-lg font-medium">Two-Factor Authentication</Text>

            <View className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="blue" className="mt-1" />
                <Text className="ml-2 text-sm text-blue-700 flex-1">
                  Two-factor authentication adds an extra layer of security to your account. 
                  When enabled, you'll need your password and a verification code from your authentication app to sign in.
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="font-medium">{is2FAEnabled ? "Enabled" : "Not Enabled"}</Text>
                <Text className="text-sm text-gray-600">
                  {is2FAEnabled
                    ? "Your account is protected with two-factor authentication"
                    : "Enhance your account security with 2FA"}
                </Text>
              </View>

              {is2FAEnabled ? (
                <Button onPress={handleDisable2FA} variant="destructive" size="sm">
                  Disable 2FA
                </Button>
              ) : (
                <Button onPress={handleInit2FA} variant="outline" size="sm">
                  Enable 2FA
                </Button>
              )}
            </View>
          </View>

          {/* Session Management Section */}
          <View className="border-t pt-6 space-y-4">
            <Text className="text-lg font-medium">Session Management</Text>

            {isLoadingSessions ? (
              <View className="flex-row items-center justify-center p-4">
                <Ionicons name="sync" size={20} color="gray" className="animate-spin mr-2" />
                <Text>Loading sessions...</Text>
              </View>
            ) : sessionsError ? (
              <View className="p-4 bg-red-50 rounded-lg border border-red-200">
                <View className="flex-row items-center">
                  <Ionicons name="alert-circle" size={20} color="red" />
                  <Text className="ml-2 text-red-700">{sessionsError}</Text>
                </View>
              </View>
            ) : (
              <View className="space-y-4">
                <View className="p-4 border rounded-lg bg-gray-50">
                  <Text className="font-medium mb-2">Active Sessions</Text>

                  {activeSessions.length > 0 ? (
                    <View className="space-y-2">
                      {activeSessions.map((session, index) => (
                        <View key={index} className="border-b border-gray-200 pb-2">
                          <View className="flex-row justify-between">
                            <Text className="text-sm">
                              {session.browser} on {session.os}
                            </Text>
                            <Text className="text-xs text-gray-600">{session.lastActive}</Text>
                          </View>
                          <Text className="text-xs text-gray-600">
                            {session.ipAddress} • {session.location || "Unknown location"}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text className="text-sm text-gray-600">Only your current session is active</Text>
                  )}

                  <Button onPress={handleSignOutAllDevices} variant="destructive" size="sm" className="mt-4">
                    Sign Out All Devices
                  </Button>
                </View>
              </View>
            )}
          </View>
        </CardContent>
      </Card>

      <TwoFAModal />
    </ScrollView>
  );
};

export default SecuritySettings;
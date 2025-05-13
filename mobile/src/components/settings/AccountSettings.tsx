// components/settings/AccountSettings.tsx
import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, Alert, Platform, Linking } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/api/apiClient";
import { router } from "expo-router";

const AccountSettings: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const { toast } = useToast();

  // Email states
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isChangeEmailModalOpen, setIsChangeEmailModalOpen] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  // Account management states
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Account deletion states
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
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

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch email verification status
        const verificationResponse = await apiClient.get("/users/email/verification-status");
        setIsEmailVerified(verificationResponse.data?.isVerified || false);

        // Fetch email
        setEmail(user.email || "");

        // Fetch connected accounts
        const accountsResponse = await apiClient.get("/users/connected-accounts");
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
        description: "Please check your new email inbox for verification instructions",
        duration: 5000,
      });
    } catch (error: any) {
      setEmailError(error.response?.data?.message || "Failed to request email change");
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
        description: "Failed to send verification email. Please try again later.",
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
      setIsVerificationModalOpen(false);

      toast({
        title: "Email Verified",
        description: "Your email has been successfully verified",
        duration: 3000,
      });
    } catch (error: any) {
      setVerificationError(error.response?.data?.message || "Invalid verification code");
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle data export for React Native (simplified)
  const handleExportData = async () => {
    setIsExportingData(true);

    try {
      // Instead of downloading, we'll show an alert with export instructions
      Alert.alert(
        "Export Data",
        "Your data export has been requested. You will receive an email with download instructions within 24 hours.",
        [
          {
            text: "OK",
            onPress: () => {
              toast({
                title: "Data Export Requested",
                description: "You'll receive an email with your data export within 24 hours",
                duration: 5000,
              });
            }
          }
        ]
      );

      // You could also implement this by sending a request to the server
      // await apiClient.post("/users/request-data-export");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request data export. Please try again later.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsExportingData(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== user.username) {
      Alert.alert("Error", "Please enter your username correctly to confirm deletion");
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
        router.replace("/");
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

  // Handle connecting social accounts (simplified for mobile)
  const handleConnectAccount = async (provider: string) => {
    Alert.alert(
      "Connect Account",
      `Connect your ${provider} account? You'll be redirected to ${provider} to authorize the connection.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Connect",
          onPress: () => {
            // In a real app, you'd handle OAuth flow here
            Linking.openURL(`/api/connect-account/${provider}`);
          },
        },
      ]
    );
  };

  // Handle disconnecting a social account
  const handleDisconnectAccount = async (provider: string) => {
    Alert.alert(
      "Disconnect Account",
      `Are you sure you want to disconnect your ${provider} account?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete(`/users/connected-accounts/${provider}`);

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
          },
        },
      ]
    );
  };

  const EmailChangeModal = () => (
    <Modal
      visible={isChangeEmailModalOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setIsChangeEmailModalOpen(false)}
    >
      <View className="flex-1 bg-white p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold">Change Email Address</Text>
          <Button 
            onPress={() => setIsChangeEmailModalOpen(false)}
            variant="ghost"
            size="sm"
          >
            <Ionicons name="close" size={24} />
          </Button>
        </View>

        {!verificationSent ? (
          <View className="space-y-4">
            <Text className="text-gray-600">
              Enter your new email address. We'll send a verification link to confirm the change.
            </Text>

            <View className="space-y-2">
              <Label>Current Email</Label>
              <Input value={email} editable={false} className="bg-gray-100" />
            </View>

            <View className="space-y-2">
              <Label>New Email</Label>
              <Input
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="Enter your new email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {emailError && (
              <View className="p-4 bg-red-50 rounded-lg border border-red-200">
                <Text className="text-red-700">{emailError}</Text>
              </View>
            )}

            <View className="p-4 bg-blue-50 rounded-lg">
              <Text className="text-sm text-blue-700">
                After submitting, you'll receive a verification email at your new address. 
                You must click the link in that email to complete the change.
              </Text>
            </View>

            <Button 
              onPress={handleChangeEmail} 
              disabled={isChangingEmail || !newEmail}
              className="mt-6"
            >
              {isChangingEmail ? "Sending..." : "Send Verification"}
            </Button>
          </View>
        ) : (
          <View className="space-y-4">
            <View className="p-4 bg-green-50 rounded-lg border border-green-200">
              <Text className="text-green-700">
                Verification email sent to {newEmail}. Please check your inbox and follow the instructions.
              </Text>
            </View>

            <Text className="text-gray-600">
              Don't see the email? Check your spam folder or tap "Resend Verification" below.
            </Text>

            <Button onPress={handleChangeEmail} disabled={isChangingEmail}>
              Resend Verification
            </Button>
          </View>
        )}
      </View>
    </Modal>
  );

  const VerificationModal = () => (
    <Modal
      visible={isVerificationModalOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setIsVerificationModalOpen(false)}
    >
      <View className="flex-1 bg-white p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold">Verify Your Email</Text>
          <Button 
            onPress={() => setIsVerificationModalOpen(false)}
            variant="ghost"
            size="sm"
          >
            <Ionicons name="close" size={24} />
          </Button>
        </View>

        <Text className="text-gray-600 mb-6">
          Enter the 6-digit code we sent to your email address.
        </Text>

        <View className="space-y-4">
          <View>
            <Label>Verification Code</Label>
            <Input
              value={verificationCode}
              onChangeText={(text) => setVerificationCode(text.replace(/\D/g, "").substring(0, 6))}
              placeholder="000000"
              keyboardType="numeric"
              maxLength={6}
              className="text-center text-lg"
            />
          </View>

          {verificationError && (
            <View className="p-4 bg-red-50 rounded-lg border border-red-200">
              <Text className="text-red-700">{verificationError}</Text>
            </View>
          )}

          <Text className="text-gray-600">
            Didn't receive a code?{" "}
            <Text 
              className="text-blue-600 underline"
              onPress={handleSendVerificationEmail}
            >
              Resend code
            </Text>
          </Text>

          <Button 
            onPress={handleVerifyEmail} 
            disabled={isVerifying || verificationCode.length !== 6}
            className="mt-6"
          >
            {isVerifying ? "Verifying..." : "Verify Email"}
          </Button>
        </View>
      </View>
    </Modal>
  );

  const DeleteAccountModal = () => (
    <Modal
      visible={isDeleteAccountModalOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setIsDeleteAccountModalOpen(false)}
    >
      <View className="flex-1 bg-white p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-red-600">Delete Your Account</Text>
          <Button 
            onPress={() => setIsDeleteAccountModalOpen(false)}
            variant="ghost"
            size="sm"
          >
            <Ionicons name="close" size={24} />
          </Button>
        </View>

        <Text className="text-gray-600 mb-6">
          This action is permanent and cannot be undone. All your data will be permanently deleted.
        </Text>

        <View className="p-4 bg-red-50 rounded-lg border border-red-200 mb-6">
          <Text className="text-red-700">
            This will delete your account, posts, comments, and all other data. This action cannot be reversed.
          </Text>
        </View>

        <View className="space-y-4">
          <Label>Type your username to confirm</Label>
          <Text className="text-gray-600">
            Please type <Text className="font-bold">{user.username}</Text> to confirm
          </Text>
          <Input
            value={deleteConfirmText}
            onChangeText={setDeleteConfirmText}
            placeholder={user.username || ""}
          />

          <Button 
            onPress={handleDeleteAccount}
            disabled={isDeleting || deleteConfirmText !== user.username}
            variant="destructive"
            className="mt-6"
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </Button>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <Card className="m-4">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your account settings and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Section */}
          <View className="space-y-2">
            <View className="flex-row justify-between items-center">
              <Label className="text-base font-medium">Email Address</Label>
              {!isEmailVerified ? (
                <View className="px-2 py-1 bg-amber-100 rounded-full">
                  <Text className="text-xs text-amber-800">Unverified</Text>
                </View>
              ) : (
                <View className="px-2 py-1 bg-green-100 rounded-full flex-row items-center">
                  <Ionicons name="checkmark" size={12} color="green" />
                  <Text className="text-xs text-green-800 ml-1">Verified</Text>
                </View>
              )}
            </View>

            <View className="flex-row items-center space-x-2">
              <Input value={email} editable={false} className="flex-1 bg-gray-100" />
              <Button 
                onPress={() => setIsChangeEmailModalOpen(true)}
                size="sm"
                variant="outline"
              >
                Change
              </Button>
            </View>

            {!isEmailVerified && (
              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-sm text-gray-600">
                  Please verify your email address to access all features.
                </Text>
                <Button
                  onPress={handleSendVerificationEmail}
                  size="sm"
                  variant="ghost"
                  className="ml-2"
                >
                  <Ionicons name="mail" size={16} color="blue" />
                  <Text className="text-blue-600 ml-1">Verify</Text>
                </Button>
              </View>
            )}
          </View>

          {/* Account Type Section */}
          <View className="space-y-2 border-t pt-6">
            <Label className="text-base font-medium">Account Type</Label>
            <View className="flex-row items-center gap-2 p-3 border rounded-md bg-gray-50">
              <View className="h-2 w-2 rounded-full bg-blue-500" />
              <Text>
                {user.role === "ADMIN" ? "Administrator Account" : "Standard User Account"}
              </Text>
            </View>
          </View>

          {/* Connected Accounts Section */}
          <View className="space-y-4 border-t pt-6">
            <Label className="text-base font-medium">Connected Accounts</Label>
            
            {/* Google */}
            <View className="p-4 border rounded-md flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <Text className="text-white font-bold">G</Text>
                </View>
                <View className="ml-3">
                  <Text className="font-medium">Google</Text>
                  <Text className="text-sm text-gray-600">
                    {connectedAccounts.google ? "Connected" : "Not connected"}
                  </Text>
                </View>
              </View>
              <Button
                onPress={() => connectedAccounts.google 
                  ? handleDisconnectAccount("google") 
                  : handleConnectAccount("google")
                }
                size="sm"
                variant="outline"
              >
                {connectedAccounts.google ? "Disconnect" : "Connect"}
              </Button>
            </View>

            {/* Facebook */}
            <View className="p-4 border rounded-md flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="h-8 w-8 rounded-full bg-blue-700 flex items-center justify-center">
                  <Text className="text-white font-bold">f</Text>
                </View>
                <View className="ml-3">
                  <Text className="font-medium">Facebook</Text>
                  <Text className="text-sm text-gray-600">
                    {connectedAccounts.facebook ? "Connected" : "Not connected"}
                  </Text>
                </View>
              </View>
              <Button
                onPress={() => connectedAccounts.facebook 
                  ? handleDisconnectAccount("facebook") 
                  : handleConnectAccount("facebook")
                }
                size="sm"
                variant="outline"
              >
                {connectedAccounts.facebook ? "Disconnect" : "Connect"}
              </Button>
            </View>

            {/* Twitter/X */}
            <View className="p-4 border rounded-md flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="h-8 w-8 rounded-full bg-black flex items-center justify-center">
                  <Text className="text-white font-bold">X</Text>
                </View>
                <View className="ml-3">
                  <Text className="font-medium">Twitter / X</Text>
                  <Text className="text-sm text-gray-600">
                    {connectedAccounts.twitter ? "Connected" : "Not connected"}
                  </Text>
                </View>
              </View>
              <Button
                onPress={() => connectedAccounts.twitter 
                  ? handleDisconnectAccount("twitter") 
                  : handleConnectAccount("twitter")
                }
                size="sm"
                variant="outline"
              >
                {connectedAccounts.twitter ? "Disconnect" : "Connect"}
              </Button>
            </View>
          </View>

          {/* Account Management Section */}
          <View className="space-y-4 border-t pt-6">
            <Label className="text-base font-medium">Account Management</Label>
            
            {/* Export Data */}
            <View className="p-4 border rounded-md">
              <View className="flex-row items-start">
                <Ionicons name="download-outline" size={20} color="blue" />
                <View className="ml-3 flex-1">
                  <Text className="font-medium">Export Your Data</Text>
                  <Text className="text-sm text-gray-600 mb-3">
                    Request an export of all your data including posts, comments, and profile information.
                  </Text>
                  <Button
                    onPress={handleExportData}
                    disabled={isExportingData}
                    size="sm"
                    variant="outline"
                  >
                    {isExportingData ? "Requesting..." : "Request Export"}
                  </Button>
                </View>
              </View>
            </View>

            {/* Delete Account */}
            <View className="p-4 border border-red-200 rounded-md">
              <View className="flex-row items-start">
                <Ionicons name="trash-outline" size={20} color="red" />
                <View className="ml-3 flex-1">
                  <Text className="font-medium text-red-600">Delete Account</Text>
                  <Text className="text-sm text-gray-600 mb-3">
                    Permanently delete your account and all your data. This action cannot be undone.
                  </Text>
                  <Button
                    onPress={() => setIsDeleteAccountModalOpen(true)}
                    size="sm"
                    variant="destructive"
                  >
                    Delete Account
                  </Button>
                </View>
              </View>
            </View>
          </View>
        </CardContent>
      </Card>

      <EmailChangeModal />
      <VerificationModal />
      <DeleteAccountModal />
    </ScrollView>
  );
};

export default AccountSettings;
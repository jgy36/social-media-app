import { MaterialIcons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useNavigation, useRoute } from '@react-navigation/native';;
import { followUser, unfollowUser, getFollowStatus, checkAccountPrivacy } from '@/api/users';


interface FollowButtonProps {
  userId: number;
  initialIsFollowing?: boolean;
  isPrivateAccount?: boolean;
  onFollowChange?: (isFollowing: boolean, followerCount: number, followingCount: number) => void;
  size?: 'sm' | 'default' | 'lg';
}

const FollowButton = ({
  userId,
  initialIsFollowing = false,
  isPrivateAccount = false,
  onFollowChange,
  size = 'default',
}: FollowButtonProps) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isRequested, setIsRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  const isAuthenticated = useSelector((state: RootState) => !!state.user.token);
  const currentUserId = useSelector((state: RootState) => state.user.id);
  const navigation = useNavigation();

  // Size variants
  const sizeClasses = {
    sm: 'px-3 py-1.5',
    default: 'px-4 py-2',
    lg: 'px-6 py-3',
  };

  const iconSizes = {
    sm: 16,
    default: 20,
    lg: 24,
  };

  const textSizes = {
    sm: 'text-sm',
    default: 'text-base',
    lg: 'text-lg',
  };

  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        if (isAuthenticated && userId !== currentUserId) {
          const status = await getFollowStatus(userId);
          setIsFollowing(status.isFollowing);
          setIsRequested(status.isRequested || false);
        }
        setInitialized(true);
      } catch (err) {
        console.error('Error checking follow status:', err);
        setInitialized(true);
      }
    };

    checkFollowStatus();
  }, [userId, isAuthenticated, currentUserId]);

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      navigation.push(`/login?redirect=/profile/${userId}`);
      return;
    }

    if (userId === currentUserId || isRequested) return;

    setLoading(true);

    try {
      let response;
      if (isFollowing) {
        response = await unfollowUser(userId);
        setIsRequested(false);
        setIsFollowing(false);
      } else {
        response = await followUser(userId);
        const isRequestCreated = response.followStatus === 'requested' || response.isRequested;
        
        if (isRequestCreated) {
          setIsRequested(true);
          setIsFollowing(false);
        } else {
          setIsFollowing(true);
          setIsRequested(false);
        }
      }

      if (onFollowChange) {
        onFollowChange(
          response.isFollowing || false,
          response.followersCount || 0,
          response.followingCount || 0
        );
      }
    } catch (err) {
      console.error('Follow toggle error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Button text and styles
  let buttonText = 'Follow';
  let buttonClasses = 'bg-primary';
  let textClasses = 'text-primary-foreground';
  let icon = <MaterialIcons name="person-add" size={iconSizes[size]} color="white" />;

  if (isFollowing) {
    buttonText = 'Following';
    buttonClasses = 'bg-transparent border border-primary/50';
    textClasses = 'text-primary';
    icon = <MaterialIcons name="person-pin" size={iconSizes[size]} color="#6366f1" />;
  } else if (isRequested) {
    buttonText = 'Requested';
    buttonClasses = 'bg-transparent border border-primary/50';
    textClasses = 'text-primary';
    icon = null;
  } else if (isPrivateAccount) {
    buttonText = 'Request to Follow';
  }

  if (!initialized || userId === currentUserId) return null;

  return (
    <TouchableOpacity
      className={`${buttonClasses} ${sizeClasses[size]} rounded-lg flex-row items-center justify-center gap-2 ${
        loading || isRequested ? 'opacity-50' : ''
      }`}
      onPress={handleToggleFollow}
      disabled={loading || isRequested}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <>
          {icon && <View>{icon}</View>}
          <Text className={`${textClasses} ${textSizes[size]} font-medium`}>
            {buttonText}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default FollowButton;

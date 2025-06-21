import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';;
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { getPreviousUrlInTab } from '@/utils/routerHistoryManager';

interface BackButtonProps {
  fallbackUrl?: string;
  className?: string;
}

const BackButton = ({
  fallbackUrl = '/community',
  className = '',
}: BackButtonProps) => {
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.user);

  const handleBack = () => {
    // Get the current path
    const currentPath = (router as any).pathname || '';
    const pathParts = currentPath.split('/');
    let section = pathParts[1] || '';

    // Handle special case for other user profiles
    if (section === 'profile' && pathParts.length > 2) {
      const profileUsername = pathParts[2];
      if (user.username && profileUsername !== user.username) {
        section = 'community';
      }
    }

    const currentSection = section || pathParts[1] || 'feed';
    const previousUrl = getPreviousUrlInTab(currentSection);

    if (previousUrl) {
      navigation.push(previousUrl);
    } else {
      const sectionRoot = `/${currentSection}`;
      if (currentPath === sectionRoot) {
        navigation.push(fallbackUrl);
      } else {
        navigation.push(sectionRoot);
      }
    }
  };

  return (
    <TouchableOpacity
      className={`flex-row items-center ${className}`}
      onPress={handleBack}
      activeOpacity={0.7}
    >
      <ArrowLeft size={20} color="#6366f1" />
      <Text className="ml-2 text-primary font-medium">Back</Text>
    </TouchableOpacity>
  );
};

export default BackButton;

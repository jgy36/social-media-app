import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import ProfileSettings from '../components/settings/ProfileSettings';
import AccountSettings from '../components/settings/AccountSettings';
import PrivacySettings from '../components/settings/PrivacySettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import SecuritySettings from '../components/settings/SecuritySettings';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'person' as keyof typeof MaterialIcons.glyphMap },
    { id: 'account', label: 'Account', icon: 'lock' as keyof typeof MaterialIcons.glyphMap },
    { id: 'privacy', label: 'Privacy', icon: 'shield' as keyof typeof MaterialIcons.glyphMap },
    { id: 'notifications', label: 'Notifications', icon: 'notifications' as keyof typeof MaterialIcons.glyphMap },
    { id: 'security', label: 'Security', icon: 'security' as keyof typeof MaterialIcons.glyphMap },
  ];

  const renderTabContent = () => {
    switch (activeTab) { 
      case 'profile':
        return <ProfileSettings />;
      case 'account':
        return <AccountSettings />;
      case 'privacy':
        return <PrivacySettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <SecuritySettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-white shadow-sm">
        <View className="flex-row items-center p-4">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} className="text-foreground" />
          </TouchableOpacity>
          <Text className="text-xl font-bold ml-4">Settings</Text>
        </View>
      </View>

      <View className="flex-1 flex-row">
        {/* Tab Navigation */}
        <View className="w-1/3 bg-muted">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              className={`p-4 ${activeTab === tab.id ? 'bg-white border-r-2 border-primary' : ''}`}
              onPress={() => setActiveTab(tab.id)}
            >
              <View className="items-center">
                <MaterialIcons 
                  name={tab.icon}
                  size={24} 
                  style={{
                    color: activeTab === tab.id ? '#3b82f6' : '#6b7280', // primary and muted-foreground colors
                  }}
                />
                <Text className={`mt-2 text-sm ${
                  activeTab === tab.id ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}>
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content Area */}
        <View className="flex-1 bg-white">
          <ScrollView className="p-4">
            {renderTabContent()}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

export default SettingsScreen;
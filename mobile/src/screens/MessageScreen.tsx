// src/screens/MessagesScreen.tsx
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { useMessages } from "@/hooks/useMessages";
import { formatDistanceToNow } from "date-fns";
import AuthorAvatar from "@/components/shared/AuthorAvatar";
import { getProfileImageUrl } from "@/utils/imageUtils";

const MessagesScreen = () => {
  const navigation = useNavigation();
  const {
    conversations,
    loading,
    error,
    unreadCount,
    fetchConversations,
  } = useMessages();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("conversations");
  const [refreshing, setRefreshing] = useState(false);

  // Filter conversations based on search term
  const filteredConversations = searchTerm
    ? conversations.filter(
        (conv) =>
          conv.otherUser.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (conv.otherUser.displayName &&
            conv.otherUser.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : conversations;

  // Navigate to conversation
  const handleOpenConversation = (conversationId: number) => {
    // Fixed navigation with type assertion
    (navigation as any).navigate('ConversationDetail', { id: conversationId });
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchConversations().finally(() => setRefreshing(false));
  };

  // Navigate to new message
  const handleNewMessage = () => {
    // Fixed navigation with type assertion
    (navigation as any).navigate('NewMessage');
  };

  // Tab button component
  const TabButton = ({ id, label }: { id: string; label: string }) => (
    <TouchableOpacity
      onPress={() => setActiveTab(id)}
      className={`flex-1 py-3 items-center ${
        activeTab === id ? 'border-b-2 border-blue-500' : ''
      }`}
    >
      <Text className={`font-medium ${
        activeTab === id ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'
      }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Render conversation item
  const renderConversation = ({ item: conversation }: { item: any }) => (
    <TouchableOpacity
      onPress={() => handleOpenConversation(conversation.id)}
      className={`bg-white dark:bg-gray-900 p-4 border-b border-gray-100 dark:border-gray-700 ${
        conversation.unreadCount > 0 ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
    >
      <View className="flex-row items-center">
        {/* Fixed AuthorAvatar - removed profileImageUrl prop */}
        <AuthorAvatar
          username={conversation.otherUser.username}
          size={48}
        />

        <View className="flex-1 ml-3">
          <View className="flex-row justify-between items-baseline">
            <Text className={`font-medium ${
              conversation.unreadCount > 0 ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'
            }`}>
              {conversation.otherUser.displayName || conversation.otherUser.username}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {conversation.lastMessageTime
                ? formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: true })
                : ''}
            </Text>
          </View>
          <Text className={`text-sm mt-1 ${
            conversation.unreadCount > 0 
              ? 'font-medium text-gray-900 dark:text-white' 
              : 'text-gray-600 dark:text-gray-400'
          }`} numberOfLines={1}>
            {conversation.lastMessage || 'No messages yet'}
          </Text>
        </View>

        {conversation.unreadCount > 0 && (
          <View className="bg-blue-500 rounded-full w-6 h-6 items-center justify-center ml-2">
            <Text className="text-white text-xs font-medium">
              {conversation.unreadCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 pt-12 pb-4 px-4 border-b border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Messages
          </Text>
          <View className="flex-row items-center">
            {unreadCount > 0 && (
              <View className="bg-blue-500 rounded-full px-2 py-1 mr-3">
                <Text className="text-white text-xs font-medium">
                  {unreadCount} unread
                </Text>
              </View>
            )}
            <TouchableOpacity
              onPress={handleNewMessage}
              className="bg-blue-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium">New Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Input */}
        <View className="flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3">
          <MaterialIcons name="search" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 py-3 px-3 text-gray-900 dark:text-white"
            placeholder="Search conversations..."
            placeholderTextColor="#6B7280"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
      </View>

      {/* Tabs */}
      <View className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <View className="flex-row">
          <TabButton id="conversations" label="Conversations" />
          <TabButton id="requests" label="Message Requests" />
        </View>
      </View>

      {/* Content */}
      <View className="flex-1">
        {activeTab === "conversations" && (
          <>
            {loading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-4 text-gray-500 dark:text-gray-400">
                  Loading conversations...
                </Text>
              </View>
            ) : error ? (
              <View className="flex-1 items-center justify-center p-6">
                <MaterialIcons name="error-outline" size={64} color="#EF4444" />
                <Text className="text-red-500 text-center text-lg font-medium mt-4">
                  {error}
                </Text>
                <TouchableOpacity
                  onPress={handleRefresh}
                  className="bg-blue-500 px-6 py-3 rounded-lg mt-4"
                >
                  <Text className="text-white font-medium">Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : filteredConversations.length === 0 ? (
              <View className="flex-1 items-center justify-center p-6">
                <MaterialIcons name="message" size={64} color="#6B7280" />
                <Text className="text-lg font-medium text-gray-900 dark:text-white mt-4">
                  No messages yet
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-center mt-2">
                  Start a conversation with someone
                </Text>
                <TouchableOpacity
                  onPress={handleNewMessage}
                  className="bg-blue-500 px-6 py-3 rounded-lg mt-4"
                >
                  <Text className="text-white font-medium">New Message</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={filteredConversations}
                renderItem={renderConversation}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                showsVerticalScrollIndicator={false}
              />
            )}
          </>
        )}

        {activeTab === "requests" && (
          <View className="flex-1 items-center justify-center p-6">
            <MaterialIcons name="message" size={64} color="#6B7280" />
            <Text className="text-lg font-medium text-gray-900 dark:text-white mt-4">
              No message requests
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center mt-2">
              When someone you don't follow sends you a message, it will appear here
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default MessagesScreen;
import { MaterialIcons } from '@expo/vector-icons';
// src/components/navbar/NotificationIcon.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

import { useNavigation } from '@react-navigation/native';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, Notification } from '@/api/notifications';
import NotificationDisplay from '@/components/notifications/NotificationDisplay';
import Modal from 'react-native-modal';

const NotificationIcon = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const user = useSelector((state: RootState) => state.user);
  const navigation = useNavigation();

  // Fetch notifications on component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user.token) {
        console.log("No user token available, skipping notification fetch");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (err: any) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Set up polling interval
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user.token]);

  // Update unread count
  useEffect(() => {
    const unread = notifications.filter(notification => !notification.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Handle marking a notification as read
  const markAsRead = async (notificationId: number) => {
    try {
      const success = await markNotificationAsRead(notificationId);
      
      if (success) {
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            notification.id === notificationId ? { ...notification, read: true } : notification
          )
        );
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setError("Failed to update notification status.");
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const success = await markAllNotificationsAsRead();
      
      if (success) {
        setNotifications(prevNotifications =>
          prevNotifications.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      setError("Failed to mark all notifications as read.");
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.id);
    setIsModalVisible(false);
    
    // Navigate based on notification type
    switch (notification.notificationType) {
      case 'comment_created':
        navigation.navigate('PostDetail', { id: notification.referenceId });
        break;
      case 'like':
        navigation.navigate('PostDetail', { id: notification.referenceId });
        break;
      case 'follow':
        navigation.navigate('Profile', { username: notification.referenceId });
        break;
      // Add more cases as needed
    }
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
    if (!isModalVisible && unreadCount > 0) {
      markAllAsRead();
    }
  };

  return (
    <>
      <TouchableOpacity onPress={toggleModal} className="relative">
        <Bell className="h-6 w-6 text-gray-600" />
        {unreadCount > 0 && (
          <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
            <Text className="text-white text-xs font-bold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        swipeDirection={['down']}
        onSwipeComplete={toggleModal}
        style={{ justifyContent: 'flex-end', margin: 0 }}
      >
        <View className="bg-white rounded-t-3xl max-h-[80%]">
          <View className="flex-row justify-between items-center p-4 border-b">
            <Text className="text-lg font-semibold">Notifications</Text>
            {notifications.length > 0 && (
              <TouchableOpacity onPress={markAllAsRead}>
                <Text className="text-blue-500">Mark All Read</Text>
              </TouchableOpacity>
            )}
          </View>

          {isLoading ? (
            <View className="p-4">
              <Text className="text-center">Loading notifications...</Text>
            </View>
          ) : error ? (
            <View className="p-4">
              <Text className="text-red-500 text-center">{error}</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View className="p-8">
              <Text className="text-center text-gray-500">No notifications yet.</Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              renderItem={({ item }) => (
                <NotificationDisplay
                  notification={item}
                  onClick={handleNotificationPress}
                />
              )}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </Modal>
    </>
  );
};

export default NotificationIcon;
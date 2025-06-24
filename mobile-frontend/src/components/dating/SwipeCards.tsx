// src/components/dating/SwipeCards.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  PanResponder,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { getPotentialMatches, swipeUser } from "@/api/dating";
import { DatingProfile } from "@/api/dating";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.9;
const CARD_HEIGHT = screenHeight * 0.7;
const SWIPE_THRESHOLD = screenWidth * 0.3;

interface SwipeCardsProps {
  onMatch: (matchData: any) => void;
}

const SwipeCards: React.FC<SwipeCardsProps> = ({ onMatch }) => {
  const [profiles, setProfiles] = useState<DatingProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeCount, setSwipeCount] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(50);

  // Animation values
  const position = useRef(new Animated.ValueXY()).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const likeOpacity = useRef(new Animated.Value(0)).current;
  const passOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadPotentialMatches();
  }, []);

  const loadPotentialMatches = async () => {
    try {
      setLoading(true);
      const matches = await getPotentialMatches();
      setProfiles(matches);
    } catch (error) {
      console.error("Failed to load potential matches:", error);
      Alert.alert("Error", "Failed to load potential matches. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'LIKE' | 'PASS') => {
    if (currentIndex >= profiles.length) return;
    
    const currentProfile = profiles[currentIndex];
    
    try {
      // Animate card out
      Animated.parallel([
        Animated.timing(position, {
          toValue: { 
            x: direction === 'LIKE' ? screenWidth : -screenWidth, 
            y: 0 
          },
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(rotate, {
          toValue: direction === 'LIKE' ? 1 : -1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start(() => {
        // Reset animation values
        position.setValue({ x: 0, y: 0 });
        rotate.setValue(0);
        likeOpacity.setValue(0);
        passOpacity.setValue(0);
        
        // Move to next card
        setCurrentIndex(prev => prev + 1);
      });

      // Call API
      const response = await swipeUser(currentProfile.user.id, direction);
      
      // Update swipe count
      setSwipeCount(prev => prev + 1);
      
      // Check for match
      if (response.matched && response.match) {
        onMatch(response.match);
      }
      
      // Check daily limit
      if (swipeCount >= dailyLimit - 1) {
        Alert.alert(
          "Daily Limit Reached",
          "You've reached your daily swipe limit. Come back tomorrow or upgrade for unlimited swipes!",
          [{ text: "OK" }]
        );
      }
      
    } catch (error) {
      console.error("Failed to swipe:", error);
      Alert.alert("Error", "Failed to record swipe. Please try again.");
    }
  };

  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (event, gestureState) => {
        const { dx } = gestureState;
        
        if (Math.abs(dx) > SWIPE_THRESHOLD) {
          handleSwipe(dx > 0 ? 'LIKE' : 'PASS');
        } else {
          // Snap back to center
          Animated.parallel([
            Animated.spring(position, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: false,
            }),
            Animated.spring(rotate, {
              toValue: 0,
              useNativeDriver: false,
            }),
          ]).start();
        }
      },
    })
  ).current;

  // Update like/pass opacity based on position
  useEffect(() => {
    const listenerId = position.x.addListener(({ value }) => {
      const likeValue = value > 0 ? Math.min(value / SWIPE_THRESHOLD, 1) : 0;
      const passValue = value < 0 ? Math.min(Math.abs(value) / SWIPE_THRESHOLD, 1) : 0;
      
      likeOpacity.setValue(likeValue);
      passOpacity.setValue(passValue);
      
      const rotateValue = value / screenWidth;
      rotate.setValue(rotateValue);
    });

    return () => position.x.removeListener(listenerId);
  }, []);

  const renderCard = (profile: DatingProfile, index: number) => {
    if (index < currentIndex) return null;
    
    const isTopCard = index === currentIndex;
    const cardStyle = isTopCard ? {
      transform: [
        { translateX: position.x },
        { translateY: position.y },
        { 
          rotate: rotate.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: ['-15deg', '0deg', '15deg'],
          })
        },
      ],
    } : {
      transform: [
        { scale: 0.95 - (index - currentIndex) * 0.05 },
        { translateY: (index - currentIndex) * 10 },
      ],
    };

    const cardContent = (
      <Animated.View
        style={[
          {
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            backgroundColor: '#1F2937',
            borderRadius: 16,
            position: 'absolute',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          },
          cardStyle,
        ]}
      >
    return isTopCard ? (
      <Animated.View
        key={profile.id}
        {...panResponder.panHandlers}
        style={[
          {
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            backgroundColor: '#1F2937',
            borderRadius: 16,
            position: 'absolute',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          },
          cardStyle,
        ]}
      >
        {/* Profile Image */}
        <Image
          source={{ 
            uri: profile.photos[0] || 
                 `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.user.username}` 
          }}
          style={{
            width: '100%',
            height: '70%',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
          resizeMode="cover"
        />
        
        {/* Like/Pass Overlays */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 50,
            right: 20,
            backgroundColor: 'green',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 20,
            opacity: likeOpacity,
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
            LIKE
          </Text>
        </Animated.View>
        
        <Animated.View
          style={{
            position: 'absolute',
            top: 50,
            left: 20,
            backgroundColor: 'red',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 20,
            opacity: passOpacity,
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
            PASS
          </Text>
        </Animated.View>

        {/* Profile Info */}
        <View style={{ padding: 16, height: '30%' }}>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
            {profile.user.displayName || profile.user.username}, {profile.age}
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <MaterialIcons name="location-on" size={16} color="#9CA3AF" />
            <Text style={{ color: '#9CA3AF', marginLeft: 4 }}>
              {profile.location}
            </Text>
          </View>
          
          <Text 
            style={{ color: '#D1D5DB', marginTop: 8, fontSize: 14 }}
            numberOfLines={2}
          >
            {profile.bio}
          </Text>
        </View>
      </Animated.View>
    ) : (
      <Animated.View
        key={profile.id}
        style={[
          {
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            backgroundColor: '#1F2937',
            borderRadius: 16,
            position: 'absolute',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          },
          cardStyle,
        ]}
      >
        {/* Profile Image */}
        <Image
          source={{ 
            uri: profile.photos[0] || 
                 `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.user.username}` 
          }}
          style={{
            width: '100%',
            height: '70%',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
          resizeMode="cover"
        />

        {/* Profile Info */}
        <View style={{ padding: 16, height: '30%' }}>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
            {profile.user.displayName || profile.user.username}, {profile.age}
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <MaterialIcons name="location-on" size={16} color="#9CA3AF" />
            <Text style={{ color: '#9CA3AF', marginLeft: 4 }}>
              {profile.location}
            </Text>
          </View>
          
          <Text 
            style={{ color: '#D1D5DB', marginTop: 8, fontSize: 14 }}
            numberOfLines={2}
          >
            {profile.bio}
          </Text>
        </View>
      </Animated.View>
    );
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-white text-lg">Finding amazing people...</Text>
      </View>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <MaterialIcons name="favorite" size={80} color="#E91E63" />
        <Text className="text-white text-2xl font-bold text-center mt-6 mb-4">
          No More Profiles
        </Text>
        <Text className="text-gray-400 text-base text-center mb-8">
          You've seen everyone in your area! Check back later for new profiles.
        </Text>
        <TouchableOpacity
          onPress={loadPotentialMatches}
          className="bg-pink-500 rounded-full px-6 py-3"
        >
          <Text className="text-white font-semibold">Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center">
      {/* Cards Stack */}
      <View style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
        {profiles.slice(currentIndex, currentIndex + 3).map((profile, index) =>
          renderCard(profile, currentIndex + index)
        )}
      </View>

      {/* Action Buttons */}
      <View className="flex-row items-center justify-center mt-8 px-8">
        <TouchableOpacity
          onPress={() => handleSwipe('PASS')}
          className="w-16 h-16 bg-gray-700 rounded-full items-center justify-center mr-8"
        >
          <MaterialIcons name="close" size={28} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => handleSwipe('LIKE')}
          className="w-16 h-16 bg-pink-500 rounded-full items-center justify-center"
        >
          <MaterialIcons name="favorite" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Swipe Counter */}
      <Text className="text-gray-400 text-sm mt-4">
        {swipeCount}/{dailyLimit} swipes today
      </Text>
    </View>
  );
};

export default SwipeCards;
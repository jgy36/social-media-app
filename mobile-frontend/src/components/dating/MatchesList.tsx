// src/components/dating/MatchesList.tsx
import React from "react";
import { View, Text, TouchableOpacity, FlatList, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useNavigation } from "@react-navigation/native";

interface Match {
  id: number;
  user1: {
    id: number;
    username: string;
    displayName: string;
    profileImageUrl?: string;
  };
  user2: {
    id: number;
    username: string;
    displayName: string;
    profileImageUrl?: string;
  };
  matchedAt: string;
  isActive: boolean;
}

interface MatchesListProps {
  matches: Match[];
  onMatchPress: (match: Match) => void;
}

const MatchesList: React.FC<MatchesListProps> = ({ matches, onMatchPress }) => {
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.user);

  const getOtherUser = (match: Match) => {
    return match.user1.id === user.id ? match.user2 : match.user1;
  };

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderMatch = ({ item: match }: { item: Match }) => {
    const otherUser = getOtherUser(match);

    return (
      <TouchableOpacity
        className="flex-row items-center p-4 border-b border-gray-800"
        onPress={() => onMatchPress(match)}
      >
        {/* Profile Images with Heart Overlay */}
        <View className="relative mr-4">
          {/* Other user's image */}
          <Image
            source={{
              uri:
                otherUser.profileImageUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.username}`,
            }}
            className="w-16 h-16 rounded-full"
          />

          {/* Heart icon overlay */}
          <View className="absolute -bottom-2 -right-2 w-8 h-8 bg-pink-500 rounded-full items-center justify-center border-2 border-black">
            <MaterialIcons name="favorite" size={16} color="white" />
          </View>
        </View>

        {/* Match Info */}
        <View className="flex-1">
          <Text className="text-white font-semibold text-lg">
            {otherUser.displayName || otherUser.username}
          </Text>
          <Text className="text-gray-400 text-sm mt-1">
            Matched {formatMatchDate(match.matchedAt)}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row">
          {/* Message Button */}
          <TouchableOpacity
            className="w-12 h-12 bg-gray-700 rounded-full items-center justify-center mr-3"
            onPress={() =>
              navigation.navigate("PhotoConversation", { userId: otherUser.id })
            }
          >
            <MaterialIcons name="photo-camera" size={20} color="white" />
          </TouchableOpacity>

          {/* View Profile Button */}
          <TouchableOpacity
            className="w-12 h-12 bg-pink-500 rounded-full items-center justify-center"
            onPress={() => onMatchPress(match)}
          >
            <MaterialIcons name="person" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View className="p-4 border-b border-gray-800">
      <Text className="text-gray-400 text-sm">
        {matches.length} match{matches.length !== 1 ? "es" : ""}
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-16">
      <MaterialIcons name="favorite-border" size={80} color="#6B7280" />
      <Text className="text-white text-xl font-semibold mt-6 mb-2">
        No Matches Yet
      </Text>
      <Text className="text-gray-400 text-base text-center px-8 leading-6">
        Keep swiping! When you and someone else like each other, you'll see them
        here.
      </Text>
    </View>
  );

  if (matches.length === 0) {
    return renderEmpty();
  }

  return (
    <View className="flex-1">
      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View className="h-px bg-gray-800" />}
      />
    </View>
  );
};

export default MatchesList;

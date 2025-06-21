// src/components/community/JoinedCommunityCard.tsx
import {
  View,
  Text,
  TouchableOpacity,
  GestureResponderEvent,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

interface JoinedCommunityCardProps {
  community: {
    id: string;
    name: string;
    members: number;
    color?: string;
  };
  onLeave: (e: GestureResponderEvent, communityId: string) => void; // Fix event type
}

const JoinedCommunityCard = ({
  community,
  onLeave,
}: JoinedCommunityCardProps) => {
  const navigation = useNavigation<any>(); // Fix navigation typing

  // Navigate to community page
  const handleNavigate = () => {
    navigation.navigate("Community", { id: community.id });
  };

  return (
    <TouchableOpacity
      key={`joined-${community.id}`}
      onPress={handleNavigate}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 m-2"
      style={{
        borderLeftWidth: 4,
        borderLeftColor: community.color || "#3B82F6",
      }}
    >
      <View className="p-3">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="font-medium text-gray-900 dark:text-white">
              {community.name}
            </Text>
            <View className="flex-row items-center mt-1">
              <Feather
                name="users"
                size={12}
                color="gray"
                style={{ marginRight: 4 }}
              />
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {community.members.toLocaleString()} members
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onLeave(e, community.id);
            }}
            className="border border-gray-300 dark:border-gray-600 px-3 py-1 rounded-md"
          >
            <Text className="text-xs text-gray-700 dark:text-gray-300">
              Leave
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default JoinedCommunityCard;

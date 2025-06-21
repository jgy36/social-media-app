// src/components/community/CommunitySearch.tsx
import { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface CommunitySearchProps {
  onSearch: (query: string) => void;
}

const CommunitySearch = ({ onSearch }: CommunitySearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation<any>(); // Fix navigation typing

  // Get user role from Redux state
  const user = useSelector((state: RootState) => state.user);
  const isAdmin = user.role === "ADMIN";

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleCreateButtonPress = () => {
    if (isAdmin) {
      // If admin, navigate to create page
      navigation.navigate("CreateCommunity");
    } else {
      // If not admin, show alert
      Alert.alert(
        "Permission Denied",
        "Only administrator accounts can create new communities.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <View className="flex-row justify-between items-center mb-2 px-4">
      <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        COMMUNITIES
      </Text>

      <View className="flex-row gap-2">
        <View className="relative flex-1 min-w-[200px]">
          <View className="absolute left-2 top-3 z-10">
            <Feather name="search" size={16} color="gray" />
          </View>
          <TextInput
            placeholder="Search communities"
            value={searchQuery}
            onChangeText={handleSearchChange}
            className="pl-8 pr-4 py-2 h-9 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700"
          />
        </View>

        <TouchableOpacity
          onPress={handleCreateButtonPress}
          className="flex-row items-center bg-blue-500 dark:bg-blue-600 px-3 py-2 rounded-md"
        >
          <Feather
            name="plus"
            size={16}
            color="white"
            style={{ marginRight: 8 }}
          />
          <Text className="text-white font-medium">Create</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CommunitySearch;

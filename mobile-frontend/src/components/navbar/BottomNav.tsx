// src/components/navbar/BottomNav.tsx
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

const BottomNav = () => {
  const navigation = useNavigation<any>(); // Fix navigation typing
  const route = useRoute();

  // Function to determine if a section is active
  const isActive = (routeName: string) => route.name === routeName;

  // Helper function to get icon name for each route
  const getIconName = (routeName: string) => {
    switch (routeName) {
      case "Feed":
        return "home";
      case "Communities":
        return "users";
      case "Map":
        return "map";
      case "Politicians":
        return "map-pin";
      case "Profile":
        return "user";
      default:
        return "home";
    }
  };

  const navItems = [
    { label: "Feed", route: "Feed" },
    { label: "Community", route: "Communities" },
    { label: "Map", route: "Map" },
    { label: "Politicians", route: "Politicians" },
    { label: "Profile", route: "Profile" },
  ];

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-row justify-around py-2">
      {navItems.map((item) => {
        const active = isActive(item.route);

        return (
          <TouchableOpacity
            key={item.route}
            onPress={() => navigation.navigate(item.route)}
            className="flex-1 items-center py-2"
          >
            <Feather
              name={getIconName(item.route)}
              size={24}
              color={active ? "#3B82F6" : "gray"}
            />
            <Text
              className={`text-xs mt-1 ${
                active ? "text-blue-500" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomNav;

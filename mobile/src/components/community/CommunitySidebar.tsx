// src/components/community/CommunitySidebar.tsx
import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, FlatList } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { toggleSidebar } from "@/redux/slices/communitySlice";
import { Users, ChevronLeft, ChevronRight, Home, Plus } from "react-native-vector-icons/Feather";
import { getAllCommunities } from "@/api/communities";

interface Community {
  id: string;
  name: string;
  color?: string;
}

const CommunitySidebar = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch<AppDispatch>();

  const isAuthenticated = useSelector((state: RootState) => !!state.user.token);
  const joinedCommunityIds = useSelector(
    (state: RootState) => state.communities.joinedCommunities
  );
  const isSidebarOpen = useSelector(
    (state: RootState) => state.communities.isSidebarOpen
  );

  const activeRouteId = route.params?.id as string;

  // Get user role
  const userRole = useSelector((state: RootState) => state.user.role);
  const isAdmin = userRole === "ADMIN";

  // Handle create button
  const handleCreateButtonPress = () => {
    if (isAdmin) {
      navigation.navigate('CreateCommunity');
    } else {
      Alert.alert(
        "Permission Denied",
        "Only administrator accounts can create new communities.",
        [{ text: "OK" }]
      );
    }
  };

  useEffect(() => {
    const fetchCommunities = async () => {
      setLoading(true);
      try {
        const allCommunities = await getAllCommunities();

        // Filter to just joined communities and map to simplified structure
        const joinedCommunities = allCommunities
          .filter((community) => joinedCommunityIds.includes(community.id))
          .map((community) => ({
            id: community.id,
            name: community.name,
            color: community.color,
          }));

        setCommunities(joinedCommunities);
      } catch (error) {
        console.error("Error fetching communities for sidebar:", error);

        // Fallback to just IDs if API fails
        setCommunities(
          joinedCommunityIds.map((id) => ({
            id,
            name: id.charAt(0).toUpperCase() + id.slice(1),
            color: "#333333",
          }))
        );
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchCommunities();
    }
  }, [joinedCommunityIds, isAuthenticated]);

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  // Navigate to community
  const navigateToCommunity = (communityId: string) => {
    console.log(`Sidebar navigating to community: ${communityId}`);
    navigation.navigate('Community', { id: communityId });
  };

  if (!isAuthenticated || joinedCommunityIds.length === 0) {
    return null;
  }

  const renderCommunityItem = ({ item }: { item: Community }) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => navigateToCommunity(item.id)}
      className={`flex-row items-center px-3 py-2 rounded-md ${
        activeRouteId === item.id
          ? "bg-gray-100 dark:bg-gray-800"
          : "hover:bg-gray-50 dark:hover:bg-gray-900"
      }`}
    >
      <View
        className="w-4 h-4 rounded-full mr-3"
        style={{ backgroundColor: item.color || "var(--primary)" }}
      />
      {isSidebarOpen ? (
        <Text className="text-gray-900 dark:text-white truncate">{item.name}</Text>
      ) : (
        <View className="w-6 h-6 rounded-full items-center justify-center bg-gray-200 dark:bg-gray-700">
          <Text className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View 
      className={`absolute left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-20 ${
        isSidebarOpen ? "w-64" : "w-16"
      }`}
      style={{ top: 64 }} // Account for header height
    >
      <View className="p-2 flex-1">
        {/* Toggle button */}
        <TouchableOpacity
          onPress={handleToggleSidebar}
          className="self-end mb-4 p-1"
        >
          {isSidebarOpen ? (
            <ChevronLeft name="chevron-left" size={18} color="gray" />
          ) : (
            <ChevronRight name="chevron-right" size={18} color="gray" />
          )}
        </TouchableOpacity>

        {/* Home link */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Feed')}
          className={`w-full flex-row items-center p-2 rounded-md mb-4 ${
            route.name === "Feed"
              ? "bg-gray-100 dark:bg-gray-800"
              : ""
          }`}
        >
          <Home name="home" size={16} color="gray" className="mr-2" />
          {isSidebarOpen && <Text className="text-gray-900 dark:text-white">Home</Text>}
        </TouchableOpacity>

        {/* Communities label */}
        {isSidebarOpen && (
          <Text className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Your Communities
          </Text>
        )}

        {/* Communities list */}
        <View className="flex-1">
          {loading ? (
            <View className="px-2 py-1.5">
              <ActivityIndicator size="small" color="gray" />
            </View>
          ) : (
            <FlatList
              data={communities}
              renderItem={renderCommunityItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* All communities button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Communities')}
          className="w-full flex-row items-center p-2 border border-gray-300 dark:border-gray-600 rounded-md mt-4"
        >
          <Users name="users" size={16} color="gray" className="mr-2" />
          {isSidebarOpen && (
            <Text className="text-gray-900 dark:text-white">All Communities</Text>
          )}
        </TouchableOpacity>

        {/* Create community button - only for admins */}
        {isAdmin && (
          <TouchableOpacity
            onPress={handleCreateButtonPress}
            className="w-full flex-row items-center p-2 bg-blue-500 dark:bg-blue-600 rounded-md mt-2"
          >
            <Plus name="plus" size={16} color="white" className="mr-2" />
            {isSidebarOpen && (
              <Text className="text-white">Create Community</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default CommunitySidebar;
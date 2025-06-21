// src/screens/PoliticiansScreen.tsx - Fixed with Web Features & X-style Design
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Politician } from "@/types/politician";
import { getAllPoliticians, getCabinetMembers } from "@/api/politicians";
import PoliticianCard from "@/components/politicians/PoliticianCard";

const PoliticiansScreen = () => {
  const navigation = useNavigation();

  // State for all politicians data
  const [allPoliticians, setAllPoliticians] = useState<Politician[]>([]);
  const [cabinetMembers, setCabinetMembers] = useState<Politician[]>([]);
  const [federalPoliticians, setFederalPoliticians] = useState<Politician[]>(
    []
  );
  const [statePoliticians, setStatePoliticians] = useState<Politician[]>([]);
  const [countyPoliticians, setCountyPoliticians] = useState<Politician[]>([]);

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [partyFilter, setPartyFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States for filter options
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [availableParties, setAvailableParties] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State for the active tab
  const [activeTab, setActiveTab] = useState("all");

  // Modal states for filters
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);

  // Define fetchData function with useCallback
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all politicians
      console.log("Fetching all politicians...");
      const politicians = await getAllPoliticians();
      setAllPoliticians(politicians);

      // Fetch cabinet members
      console.log("Fetching cabinet members...");
      const cabinet = await getCabinetMembers();

      // Format cabinet data to match Politician format
      const formattedCabinet = cabinet.map((member) => ({
        ...member,
        state: member.state || "Federal",
        yearsServed: member.yearsServed || 0,
        photoUrl: member.photoUrl === "N/A" ? null : member.photoUrl,
      }));

      setCabinetMembers(formattedCabinet);

      // Categorize politicians - exclude cabinet members from federal
      const cabinetIds = new Set(cabinet.map((c) => c.id));

      const federal = politicians.filter(
        (p) => p.state === "Federal" && !cabinetIds.has(p.id)
      );

      const state = politicians.filter(
        (p) => p.county === null && p.state !== "Federal"
      );

      const county = politicians.filter((p) => p.county !== null);

      setFederalPoliticians(federal);
      setStatePoliticians(state);
      setCountyPoliticians(county);

      // Extract available filter options including cabinet
      const allPoliticiansWithCabinet = [
        ...politicians,
        ...cabinet.filter((c) => !politicians.some((p) => p.id === c.id)),
      ];

      const uniqueStates = new Set(
        allPoliticiansWithCabinet.map((p) => p.state)
      );
      const states = Array.from(uniqueStates).filter(Boolean).sort();

      const uniqueParties = new Set(
        allPoliticiansWithCabinet.map((p) => p.party)
      );
      const parties = Array.from(uniqueParties).filter(Boolean).sort();

      setAvailableStates(states);
      setAvailableParties(parties);
    } catch (error) {
      console.error("Error fetching politicians:", error);
      setError("Failed to load politicians data. Please try again.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load politicians data
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, partyFilter, stateFilter, activeTab]);

  // Apply filters to politicians
  const filterPoliticians = (politicians: Politician[]) => {
    return politicians.filter((politician) => {
      // Apply search filter
      const matchesSearch =
        searchQuery === "" ||
        politician.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (politician.position &&
          politician.position
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));

      // Apply party filter
      const matchesParty =
        partyFilter === "all" || politician.party === partyFilter;

      // Apply state filter
      const matchesState =
        stateFilter === "all" || politician.state === stateFilter;

      return matchesSearch && matchesParty && matchesState;
    });
  };

  // Get paginated data
  const getPaginatedData = (data: Politician[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  // Filter politicians based on current filters
  const filteredCabinet = filterPoliticians(cabinetMembers);
  const filteredFederal = filterPoliticians(federalPoliticians);
  const filteredState = filterPoliticians(statePoliticians);
  const filteredCounty = filterPoliticians(countyPoliticians);

  // Combine all unique politicians
  const allUniquePoliticians = [...cabinetMembers];

  // Add other politicians that are not in cabinet
  const cabinetIds = new Set(cabinetMembers.map((c) => c.id));
  federalPoliticians.forEach((p) => {
    if (!cabinetIds.has(p.id)) allUniquePoliticians.push(p);
  });

  // Add state and county politicians
  statePoliticians.forEach((p) => allUniquePoliticians.push(p));
  countyPoliticians.forEach((p) => allUniquePoliticians.push(p));

  const filteredAll = filterPoliticians(allUniquePoliticians);

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case "cabinet":
        return getPaginatedData(filteredCabinet);
      case "federal":
        return getPaginatedData(filteredFederal);
      case "state":
        return getPaginatedData(filteredState);
      case "county":
        return getPaginatedData(filteredCounty);
      default:
        return getPaginatedData(filteredAll);
    }
  };

  // Get total count for current tab
  const getCurrentCount = () => {
    switch (activeTab) {
      case "cabinet":
        return filteredCabinet.length;
      case "federal":
        return filteredFederal.length;
      case "state":
        return filteredState.length;
      case "county":
        return filteredCounty.length;
      default:
        return filteredAll.length;
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil(getCurrentCount() / itemsPerPage);

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setPartyFilter("all");
    setStateFilter("all");
    setCurrentPage(1);
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Handle retry
  const handleRetry = () => {
    fetchData();
  };

  // Tab button component - X-style with counts
  const TabButton = ({
    id,
    label,
    count,
  }: {
    id: string;
    label: string;
    count: number;
  }) => (
    <TouchableOpacity
      onPress={() => {
        setActiveTab(id);
        setCurrentPage(1);
      }}
      className="flex-1 py-3 px-2 items-center"
    >
      <Text
        className="font-medium text-xs text-center"
        style={{
          color: activeTab === id ? "#ffffff" : "#71767b",
        }}
      >
        {label}
      </Text>
      <View
        className="mt-1 px-1.5 py-0.5 rounded-full"
        style={{
          backgroundColor: activeTab === id ? "#1d9bf0" : "#374151",
        }}
      >
        <Text
          className="text-xs font-medium"
          style={{
            color: activeTab === id ? "#ffffff" : "#9ca3af",
          }}
        >
          {count}
        </Text>
      </View>
      {/* Active indicator */}
      <View
        className="mt-2 h-0.5 rounded-full"
        style={{
          width: activeTab === id ? 32 : 0,
          backgroundColor: activeTab === id ? "#1d9bf0" : "transparent",
        }}
      />
    </TouchableOpacity>
  );

  // Pagination component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    return (
      <View className="flex-row items-center justify-center py-4 space-x-4">
        <TouchableOpacity
          onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-lg"
          style={{
            backgroundColor: currentPage === 1 ? "#374151" : "#1d9bf0",
            opacity: currentPage === 1 ? 0.5 : 1,
          }}
        >
          <Text className="text-white text-sm font-medium">Previous</Text>
        </TouchableOpacity>

        <Text className="text-gray-400 text-sm">
          Page {currentPage} of {totalPages}
        </Text>

        <TouchableOpacity
          onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-lg"
          style={{
            backgroundColor: currentPage === totalPages ? "#374151" : "#1d9bf0",
            opacity: currentPage === totalPages ? 0.5 : 1,
          }}
        >
          <Text className="text-white text-sm font-medium">Next</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render politician item
  const renderPolitician = ({ item }: { item: Politician }) => (
    <View className="mb-3">
      <PoliticianCard politician={item} />
    </View>
  );

  return (
    <View className="flex-1 bg-black" style={{ position: "relative" }}>
      {/* Header - X-style */}
      <View className="bg-black/95 backdrop-blur-md pt-12 pb-4 px-4 border-b border-gray-800">
        <Text className="text-xl font-bold text-white mb-4">
          Politicians Directory
        </Text>

        {/* Search Input */}
        <View className="flex-row items-center bg-gray-900 border border-gray-700 rounded-full px-4 mb-4">
          <MaterialIcons name="search" size={20} color="#71767b" />
          <TextInput
            className="flex-1 py-3 px-3 text-white text-sm"
            placeholder="Search politicians..."
            placeholderTextColor="#71767b"
            value={searchQuery}
            onChangeText={setSearchQuery}
            editable={!isLoading && !error}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <MaterialIcons name="close" size={20} color="#71767b" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Buttons */}
        <View className="flex-row space-x-3 mb-4">
          {/* Party Filter */}
          <TouchableOpacity
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-3"
            onPress={() => {
              console.log("Party button pressed!");
              setShowPartyModal(!showPartyModal);
              setShowStateModal(false);
            }}
            activeOpacity={0.7}
            style={{ minHeight: 50 }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <MaterialIcons name="group" size={16} color="#71767b" />
                <Text
                  className="text-white text-sm ml-2 flex-1"
                  numberOfLines={1}
                >
                  {partyFilter === "all"
                    ? "All Parties"
                    : partyFilter.length > 12
                    ? `${partyFilter.substring(0, 12)}...`
                    : partyFilter}
                </Text>
              </View>
              <MaterialIcons
                name={
                  showPartyModal ? "keyboard-arrow-up" : "keyboard-arrow-down"
                }
                size={20}
                color="#71767b"
              />
            </View>
          </TouchableOpacity>

          {/* State Filter */}
          <TouchableOpacity
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-3"
            onPress={() => {
              console.log("State button pressed!");
              setShowStateModal(!showStateModal);
              setShowPartyModal(false);
            }}
            activeOpacity={0.7}
            style={{ minHeight: 50 }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <MaterialIcons name="flag" size={16} color="#71767b" />
                <Text
                  className="text-white text-sm ml-2 flex-1"
                  numberOfLines={1}
                >
                  {stateFilter === "all" ? "All States" : stateFilter}
                </Text>
              </View>
              <MaterialIcons
                name={
                  showStateModal ? "keyboard-arrow-up" : "keyboard-arrow-down"
                }
                size={20}
                color="#71767b"
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Party Dropdown - appears right below buttons */}
        {showPartyModal && (
          <View
            className="mb-4 bg-gray-800 border border-gray-600 rounded-lg"
            style={{ maxHeight: 200 }}
          >
            <ScrollView>
              <TouchableOpacity
                className="px-4 py-3 border-b border-gray-700"
                onPress={() => {
                  setPartyFilter("all");
                  setShowPartyModal(false);
                }}
              >
                <View className="flex-row items-center">
                  <MaterialIcons
                    name={
                      partyFilter === "all"
                        ? "radio-button-checked"
                        : "radio-button-unchecked"
                    }
                    size={20}
                    color={partyFilter === "all" ? "#3b82f6" : "#9ca3af"}
                  />
                  <Text className="text-white text-base ml-3">All Parties</Text>
                </View>
              </TouchableOpacity>

              {availableParties.map((party) => (
                <TouchableOpacity
                  key={party}
                  className="px-4 py-3 border-b border-gray-700"
                  onPress={() => {
                    setPartyFilter(party);
                    setShowPartyModal(false);
                  }}
                >
                  <View className="flex-row items-center">
                    <MaterialIcons
                      name={
                        partyFilter === party
                          ? "radio-button-checked"
                          : "radio-button-unchecked"
                      }
                      size={20}
                      color={partyFilter === party ? "#3b82f6" : "#9ca3af"}
                    />
                    <Text className="text-white text-base ml-3">{party}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* State Dropdown - appears right below buttons */}
        {showStateModal && (
          <View
            className="mb-4 bg-gray-800 border border-gray-600 rounded-lg"
            style={{ maxHeight: 200 }}
          >
            <ScrollView>
              <TouchableOpacity
                className="px-4 py-3 border-b border-gray-700"
                onPress={() => {
                  setStateFilter("all");
                  setShowStateModal(false);
                }}
              >
                <View className="flex-row items-center">
                  <MaterialIcons
                    name={
                      stateFilter === "all"
                        ? "radio-button-checked"
                        : "radio-button-unchecked"
                    }
                    size={20}
                    color={stateFilter === "all" ? "#3b82f6" : "#9ca3af"}
                  />
                  <Text className="text-white text-base ml-3">All States</Text>
                </View>
              </TouchableOpacity>

              {availableStates.map((state) => (
                <TouchableOpacity
                  key={state}
                  className="px-4 py-3 border-b border-gray-700"
                  onPress={() => {
                    setStateFilter(state);
                    setShowStateModal(false);
                  }}
                >
                  <View className="flex-row items-center">
                    <MaterialIcons
                      name={
                        stateFilter === state
                          ? "radio-button-checked"
                          : "radio-button-unchecked"
                      }
                      size={20}
                      color={stateFilter === state ? "#3b82f6" : "#9ca3af"}
                    />
                    <Text className="text-white text-base ml-3">{state}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Active Filters & Reset */}
        {(searchQuery || partyFilter !== "all" || stateFilter !== "all") && (
          <View className="mb-4">
            <View className="flex-row flex-wrap gap-2 mb-3">
              {searchQuery && (
                <View className="bg-blue-600 px-3 py-1 rounded-full flex-row items-center">
                  <Text className="text-white text-xs font-medium">
                    "{searchQuery}"
                  </Text>
                  <TouchableOpacity
                    onPress={() => setSearchQuery("")}
                    className="ml-1"
                  >
                    <MaterialIcons name="close" size={14} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              )}
              {partyFilter !== "all" && (
                <View className="bg-green-600 px-3 py-1 rounded-full flex-row items-center">
                  <Text className="text-white text-xs font-medium">
                    {partyFilter.length > 15
                      ? `${partyFilter.substring(0, 15)}...`
                      : partyFilter}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setPartyFilter("all")}
                    className="ml-1"
                  >
                    <MaterialIcons name="close" size={14} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              )}
              {stateFilter !== "all" && (
                <View className="bg-purple-600 px-3 py-1 rounded-full flex-row items-center">
                  <Text className="text-white text-xs font-medium">
                    {stateFilter}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setStateFilter("all")}
                    className="ml-1"
                  >
                    <MaterialIcons name="close" size={14} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={resetFilters}
              className="bg-gray-800 border border-gray-600 px-4 py-2 rounded-lg flex-row items-center justify-center self-start"
              disabled={isLoading || !!error}
            >
              <MaterialIcons name="clear-all" size={16} color="#ffffff" />
              <Text className="text-white text-sm font-medium ml-2">
                Clear All
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Error Alert - Compact */}
      {error && (
        <View className="bg-red-950 border border-red-800 mx-4 mt-3 p-3 rounded-lg">
          <View className="flex-row items-center">
            <MaterialIcons name="error-outline" size={18} color="#ef4444" />
            <Text className="ml-2 text-red-400 text-sm font-medium">
              Error Loading Data
            </Text>
          </View>
          <Text className="text-red-300 text-sm mt-1">{error}</Text>
          <TouchableOpacity
            onPress={handleRetry}
            className="mt-2 bg-red-600 px-3 py-2 rounded-lg flex-row items-center justify-center"
          >
            <MaterialIcons name="refresh" size={16} color="#ffffff" />
            <Text className="text-white text-sm font-medium ml-1">Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1d9bf0" />
          <Text className="mt-4 text-gray-400 text-sm">
            Loading politicians...
          </Text>
        </View>
      ) : (
        <>
          {/* Tabs - X-style with counts */}
          <View className="bg-black border-b border-gray-800">
            <View className="flex-row px-2">
              <TabButton id="all" label="All" count={filteredAll.length} />
              <TabButton
                id="cabinet"
                label="Cabinet"
                count={filteredCabinet.length}
              />
              <TabButton
                id="federal"
                label="Federal"
                count={filteredFederal.length}
              />
              <TabButton
                id="state"
                label="State"
                count={filteredState.length}
              />
              <TabButton
                id="county"
                label="County"
                count={filteredCounty.length}
              />
            </View>
          </View>

          {/* Tab Content */}
          <View className="flex-1">
            {getCurrentData().length > 0 ? (
              <>
                <FlatList
                  data={getCurrentData()}
                  renderItem={renderPolitician}
                  keyExtractor={(item) => item.id.toString()}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={handleRefresh}
                      tintColor="#71767b"
                    />
                  }
                  contentContainerStyle={{
                    paddingVertical: 16,
                    paddingHorizontal: 16,
                  }}
                  showsVerticalScrollIndicator={false}
                  ListFooterComponent={<PaginationControls />}
                />
              </>
            ) : (
              <View className="flex-1 items-center justify-center py-12">
                <MaterialIcons name="how-to-vote" size={48} color="#71767b" />
                <Text className="text-lg font-medium text-white mt-4">
                  No politicians found
                </Text>
                <Text className="text-gray-400 text-center mt-2 text-sm">
                  No politicians match your current filters
                </Text>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
};

export default PoliticiansScreen;

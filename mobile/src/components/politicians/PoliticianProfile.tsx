// components/politicians/PoliticianProfile.tsx
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, Linking, Share, Alert } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface PoliticianData {
  id: string;
  name: string;
  party: 'Republican' | 'Democrat' | 'Independent' | 'Other';
  title: string;
  state?: string;
  district?: string;
  imageUrl?: string;
  bio?: string;
  committees?: string[];
  website?: string;
  twitter?: string;
  facebook?: string;
  phone?: string;
  email?: string;
  officeAddress?: string;
  votingRecord?: VotingRecord[];
  bills?: Bill[];
}

interface VotingRecord {
  id: string;
  bill: string;
  vote: 'Yes' | 'No' | 'Present' | 'Not Voting';
  date: string;
}

interface Bill {
  id: string;
  title: string;
  status: 'Passed' | 'Failed' | 'Pending';
  date: string;
}

interface PoliticianProfileProps {
  politicianId: string;
  className?: string;
}

const PoliticianProfile: React.FC<PoliticianProfileProps> = ({
  politicianId,
  className = ""
}) => {
  const [politician, setPolitician] = useState<PoliticianData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'voting' | 'bills'>('overview');

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchPoliticianData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockData: PoliticianData = {
          id: politicianId,
          name: "John Smith",
          party: "Republican",
          title: "Representative",
          state: "Texas",
          district: "15th District",
          imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${politicianId}`,
          bio: "John Smith has been serving the people of Texas' 15th district since 2019. He focuses on economic development, healthcare reform, and education initiatives.",
          committees: ["House Energy Committee", "House Budget Committee"],
          website: "https://johnsmith.house.gov",
          twitter: "@repjohnsmith",
          facebook: "RepJohnSmith",
          phone: "(202) 225-1234",
          email: "john.smith@mail.house.gov",
          officeAddress: "1234 Longworth House Office Building, Washington, DC 20515",
          votingRecord: [
            { id: "1", bill: "Infrastructure Investment Act", vote: "Yes", date: "2023-11-15" },
            { id: "2", bill: "Clean Energy Initiative", vote: "No", date: "2023-10-22" },
            { id: "3", bill: "Healthcare Affordability Act", vote: "Yes", date: "2023-09-30" },
          ],
          bills: [
            { id: "1", title: "Small Business Tax Relief Act", status: "Passed", date: "2023-12-01" },
            { id: "2", title: "Rural Healthcare Access Bill", status: "Pending", date: "2023-11-20" },
          ]
        };
        
        setPolitician(mockData);
      } catch (error) {
        console.error('Error fetching politician data:', error);
        Alert.alert('Error', 'Failed to load politician information');
      } finally {
        setLoading(false);
      }
    };

    fetchPoliticianData();
  }, [politicianId]);

  const getPartyColor = (party: string) => {
    switch (party) {
      case 'Republican': return '#dc2626';
      case 'Democrat': return '#2563eb';
      case 'Independent': return '#7c3aed';
      default: return '#6b7280';
    }
  };

  const getPartyBadgeClass = (party: string) => {
    switch (party) {
      case 'Republican': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Democrat': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Independent': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleContact = async (type: 'phone' | 'email' | 'website') => {
    if (!politician) return;

    try {
      switch (type) {
        case 'phone':
          if (politician.phone) {
            await Linking.openURL(`tel:${politician.phone}`);
          }
          break;
        case 'email':
          if (politician.email) {
            await Linking.openURL(`mailto:${politician.email}`);
          }
          break;
        case 'website':
          if (politician.website) {
            await Linking.openURL(politician.website);
          }
          break;
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open contact method');
    }
  };

  const handleShare = async () => {
    if (!politician) return;

    try {
      await Share.share({
        message: `Check out ${politician.name}, ${politician.title} for ${politician.state}'s ${politician.district}`,
        url: politician.website || '',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <View className="p-4 justify-center items-center">
        <MaterialIcons name="person" size={48} color="#6b7280" />
        <Text className="mt-2 text-gray-600 dark:text-gray-400">Loading politician...</Text>
      </View>
    );
  }

  if (!politician) {
    return (
      <View className="p-4 justify-center items-center">
        <MaterialIcons name="error-outline" size={48} color="#dc2626" />
        <Text className="mt-2 text-red-600 dark:text-red-400">Failed to load politician data</Text>
      </View>
    );
  }

  return (
    <ScrollView className={`bg-white dark:bg-gray-900 ${className}`} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="p-4 bg-gray-50 dark:bg-gray-800">
        <View className="flex-row items-center space-x-4">
          <Image
            source={{ uri: politician.imageUrl }}
            className="w-24 h-24 rounded-full border-2"
            style={{ borderColor: getPartyColor(politician.party) }}
          />
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {politician.name}
            </Text>
            <Text className="text-lg text-gray-600 dark:text-gray-400">
              {politician.title}
            </Text>
            <View className="flex-row items-center mt-1">
              <Badge className={getPartyBadgeClass(politician.party)}>
                {politician.party}
              </Badge>
              {politician.state && politician.district && (
                <Text className="ml-2 text-gray-600 dark:text-gray-400">
                  {politician.state} - {politician.district}
                </Text>
              )}
            </View>
          </View>
          <TouchableOpacity onPress={handleShare} className="p-2">
            <MaterialIcons name="share" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {['overview', 'voting', 'bills'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab as typeof activeTab)}
            className={`flex-1 py-3 items-center ${
              activeTab === tab ? 'border-b-2 border-blue-500' : ''
            }`}
          >
            <Text
              className={`font-medium ${
                activeTab === tab
                  ? 'text-blue-500'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View className="p-4">
        {activeTab === 'overview' && (
          <View className="space-y-4">
            {/* Bio */}
            <Card>
              <CardHeader>
                <CardTitle>Biography</CardTitle>
              </CardHeader>
              <CardContent>
                <Text className="text-gray-700 dark:text-gray-300">{politician.bio}</Text>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {politician.phone && (
                  <TouchableOpacity
                    onPress={() => handleContact('phone')}
                    className="flex-row items-center space-x-3"
                  >
                    <MaterialIcons name="phone" size={20} color="#3b82f6" />
                    <Text className="text-blue-600 dark:text-blue-400">{politician.phone}</Text>
                  </TouchableOpacity>
                )}
                {politician.email && (
                  <TouchableOpacity
                    onPress={() => handleContact('email')}
                    className="flex-row items-center space-x-3"
                  >
                    <MaterialIcons name="email" size={20} color="#3b82f6" />
                    <Text className="text-blue-600 dark:text-blue-400">{politician.email}</Text>
                  </TouchableOpacity>
                )}
                {politician.website && (
                  <TouchableOpacity
                    onPress={() => handleContact('website')}
                    className="flex-row items-center space-x-3"
                  >
                    <MaterialIcons name="language" size={20} color="#3b82f6" />
                    <Text className="text-blue-600 dark:text-blue-400">{politician.website}</Text>
                  </TouchableOpacity>
                )}
                {politician.officeAddress && (
                  <View className="flex-row items-start space-x-3">
                    <MaterialIcons name="location-on" size={20} color="#6b7280" />
                    <Text className="text-gray-700 dark:text-gray-300 flex-1">
                      {politician.officeAddress}
                    </Text>
                  </View>
                )}
              </CardContent>
            </Card>

            {/* Committees */}
            {politician.committees && politician.committees.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Committee Memberships</CardTitle>
                </CardHeader>
                <CardContent>
                  {politician.committees.map((committee, index) => (
                    <View key={index} className="mb-2">
                      <Text className="text-gray-700 dark:text-gray-300">• {committee}</Text>
                    </View>
                  ))}
                </CardContent>
              </Card>
            )}
          </View>
        )}

        {activeTab === 'voting' && (
          <View className="space-y-3">
            <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent Voting Record
            </Text>
            {politician.votingRecord?.map((record) => (
              <Card key={record.id}>
                <CardContent className="p-4">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="font-medium text-gray-900 dark:text-gray-100">
                        {record.bill}
                      </Text>
                      <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {new Date(record.date).toLocaleDateString()}
                      </Text>
                    </View>
                    <Badge
                      className={
                        record.vote === 'Yes'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : record.vote === 'No'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }
                    >
                      {record.vote}
                    </Badge>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        )}

        {activeTab === 'bills' && (
          <View className="space-y-3">
            <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Sponsored Bills
            </Text>
            {politician.bills?.map((bill) => (
              <Card key={bill.id}>
                <CardContent className="p-4">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="font-medium text-gray-900 dark:text-gray-100">
                        {bill.title}
                      </Text>
                      <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {new Date(bill.date).toLocaleDateString()}
                      </Text>
                    </View>
                    <Badge
                      className={
                        bill.status === 'Passed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : bill.status === 'Failed'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }
                    >
                      {bill.status}
                    </Badge>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default PoliticianProfile;
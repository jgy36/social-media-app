// src/components/politicians/PoliticianCard.tsx
import React, { useState, useEffect } from "react";
import { View, Text, Image, ActivityIndicator } from "react-native";
import { Politician } from "@/types/politician";
import { WikipediaImageFetcher } from "@/utils/wikipediaImageFetcher";

// Define your backend URL as a constant
const BACKEND_URL = "http://192.168.137.1:8080";

interface PoliticianCardProps {
  politician: Politician;
}

const PoliticianCard: React.FC<PoliticianCardProps> = ({ politician }) => {
  console.log(`Rendering PoliticianCard for: ${politician.name}`);
  console.log(`PhotoUrl value: "${politician.photoUrl}"`);

  // Store the final image URL to display
  const [displayImageUrl, setDisplayImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [useDefaultAvatar, setUseDefaultAvatar] = useState<boolean>(false);

  // Create image fetcher instance
  const imageFetcher = new WikipediaImageFetcher();

  useEffect(() => {
    // Reset state when politician changes
    setIsLoading(true);
    setUseDefaultAvatar(false);
    setDisplayImageUrl(null);

    // Function to load image
    const loadImage = async () => {
      try {
        console.log(`Loading image for ${politician.name}`);
        console.log(`photoUrl: "${politician.photoUrl}"`);

        // First check if we have a backend image and if it's valid
        if (
          politician.photoUrl &&
          politician.photoUrl !== "N/A" &&
          politician.photoUrl !== "null"
        ) {
          // Generate full URL for backend images
          const backendImageUrl = politician.photoUrl.startsWith("/")
            ? `${BACKEND_URL}${politician.photoUrl}`
            : politician.photoUrl;

          console.log(
            `Using backend image for ${politician.name}: ${backendImageUrl}`
          );

          // Set the backend image URL directly without checking
          setDisplayImageUrl(backendImageUrl);
          setIsLoading(false);
          return;
        }

        // Only attempt to fetch from Wikipedia if no backend image is available
        console.log(
          `No valid backend image for ${politician.name}, trying Wikipedia`
        );
        const wikiImageUrl = await imageFetcher.fetchPoliticianImage(
          politician.name
        );

        if (wikiImageUrl) {
          console.log(`Found Wikipedia image for ${politician.name}`);
          setDisplayImageUrl(wikiImageUrl);
        } else {
          console.log(`No image found for ${politician.name}`);
          setUseDefaultAvatar(true);
        }
      } catch (error) {
        console.error(`Error loading image for ${politician.name}:`, error);
        setUseDefaultAvatar(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [politician]);

  // Handle image load error
  const handleImageError = () => {
    console.warn(`Image error for ${politician.name}, URL: ${displayImageUrl}`);
    setUseDefaultAvatar(true);
    setDisplayImageUrl(null);
  };

  // Get party background style
  const getPartyBackground = (party: string) => {
    const partyLower = (party || "").toLowerCase();
    if (partyLower.includes("republican")) {
      return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800";
    } else if (partyLower.includes("democrat")) {
      return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800";
    } else if (partyLower.includes("independent")) {
      return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800";
    } else {
      return "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800";
    }
  };

  // Custom badge colors for parties
  const getPartyBadgeClass = (party: string) => {
    const partyLower = (party || "").toLowerCase();
    if (partyLower.includes("republican")) {
      return "bg-red-500";
    } else if (partyLower.includes("democrat")) {
      return "bg-blue-500";
    } else if (partyLower.includes("independent")) {
      return "bg-green-500";
    } else {
      return "bg-gray-500";
    }
  };

  // Get party color for avatar
  const getPartyColor = (party: string) => {
    const partyLower = (party || "").toLowerCase();
    if (partyLower.includes("republican")) {
      return "border-red-500 bg-red-100 text-red-700";
    } else if (partyLower.includes("democrat")) {
      return "border-blue-500 bg-blue-100 text-blue-700";
    } else if (partyLower.includes("independent")) {
      return "border-green-500 bg-green-100 text-green-700";
    } else {
      return "border-gray-500 bg-gray-100 text-gray-700";
    }
  };

  return (
    <View
      className={`rounded-lg shadow-md border m-2 p-4 ${getPartyBackground(
        politician.party
      )}`}
    >
      <View className="mb-2">
        <Text className="text-lg font-bold text-gray-900 dark:text-white">
          {politician.name}
        </Text>
        <Text className="text-sm text-gray-600 dark:text-gray-400">
          {politician.position}
        </Text>
      </View>

      <View className="flex-row items-center">
        <View className="mr-4">
          {isLoading ? (
            <View
              className={`rounded-full h-16 w-16 items-center justify-center border-2 ${
                getPartyColor(politician.party).split(" ")[0]
              }`}
            >
              <ActivityIndicator size="small" color="gray" />
            </View>
          ) : displayImageUrl && !useDefaultAvatar ? (
            <View className="rounded-full h-16 w-16 overflow-hidden border border-gray-300 dark:border-gray-600">
              <Image
                source={{ uri: displayImageUrl }}
                style={{ width: 64, height: 64 }}
                resizeMode="cover"
                onError={handleImageError}
              />
            </View>
          ) : (
            <View
              className={`rounded-full h-16 w-16 items-center justify-center font-bold border ${getPartyColor(
                politician.party
              )}`}
            >
              <Text className="text-xl font-bold text-gray-700 dark:text-gray-300">
                {politician.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-1">
          <View
            className={`rounded-md px-2 py-1 mb-1 self-start ${getPartyBadgeClass(
              politician.party
            )}`}
          >
            <Text className="text-white text-xs font-medium">
              {politician.party}
            </Text>
          </View>
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            {politician.county
              ? `${politician.county}, ${politician.state}`
              : politician.state}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {politician.yearsServed}{" "}
            {politician.yearsServed === 1 ? "year" : "years"} served
          </Text>
        </View>
      </View>
    </View>
  );
};

export default PoliticianCard;

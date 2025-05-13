// political-app/src/utils/hashtagUtils.tsx - React Native version
import React from 'react';
import { Text, Pressable } from 'react-native';

/**
 * Extract hashtags from text content
 * @param content - The post content to extract hashtags from
 * @returns Array of hashtags found in the content
 */
export const extractHashtags = (content: string): string[] => {
  if (!content) return [];
  
  const hashtagRegex = /(#[a-zA-Z0-9_]+)/g;
  const matches = content.match(hashtagRegex);
  
  return matches ? matches : [];
};

/**
 * Renders post content with clickable hashtags for React Native
 * @param content - Post content
 * @param onHashtagPress - Function to call when hashtag is pressed
 * @returns React elements with pressable hashtags
 */
export const renderContentWithHashtags = (
  content: string,
  onHashtagPress: (hashtag: string) => void
): React.ReactNode => {
  if (!content) return <Text>{content}</Text>;
  
  const hashtagRegex = /(#[a-zA-Z0-9_]+)/g;
  const parts = content.split(hashtagRegex);
  
  return (
    <Text>
      {parts.map((part, index) => {
        if (part.match(hashtagRegex)) {
          return (
            <Pressable 
              key={index}
              onPress={(e) => {
                e.stopPropagation(); // Prevent parent onPress
                onHashtagPress(part);
              }}
            >
              <Text className="text-blue-500 underline">
                {part}
              </Text>
            </Pressable>
          );
        }
        
        return <Text key={index}>{part}</Text>;
      })}
    </Text>
  );
};

/**
 * Convert hashtag with # to a clean format for URL
 * @param hashtag - The hashtag with # prefix
 * @returns Sanitized hashtag for URL
 */
export const hashtagToUrlParam = (hashtag: string): string => {
  // Remove the # prefix if present and convert to lowercase
  return hashtag.startsWith('#') ? hashtag.substring(1).toLowerCase() : hashtag.toLowerCase();
};

/**
 * Format URL param back to hashtag with #
 * @param param - URL parameter (without #)
 * @returns Formatted hashtag with # prefix
 */
export const urlParamToHashtag = (param: string): string => {
  return param.startsWith('#') ? param : `#${param}`;
};
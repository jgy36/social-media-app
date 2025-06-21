// political-app/src/utils/hashtagUtils.ts
import React from 'react';

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
 * Renders post content with clickable hashtags
 * @param content - Post content
 * @param onHashtagClick - Function to call when hashtag is clicked
 * @returns React elements with clickable hashtags
 */
export const renderContentWithHashtags = (
  content: string,
  onHashtagClick: (hashtag: string) => void
): React.ReactNode[] => {
  if (!content) return [content];
  
  const hashtagRegex = /(#[a-zA-Z0-9_]+)/g;
  const parts = content.split(hashtagRegex);
  
  return parts.map((part, index) => {
    if (part.match(hashtagRegex)) {
      return (
        <span 
          key={index}
          className="text-primary hover:underline cursor-pointer"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation(); // Prevent navigating to post details
            onHashtagClick(part);
          }}
        >
          {part}
        </span>
      );
    }
    
    return <span key={index}>{part}</span>;
  });
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
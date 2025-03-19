// political-app/src/utils/usernameUtils.ts
import React from 'react'; // Add this import for JSX support

/**
 * Validates a username according to standard rules
 * @param username The username to validate
 * @returns Object with validation result and message
 */
export const validateUsername = (username: string): { valid: boolean; message?: string } => {
  // Username requirements: 3-20 characters, alphanumeric, underscores, hyphens
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  
  if (!username.trim()) {
    return { valid: false, message: "Username is required" };
  }
  
  if (username.includes(" ")) {
    return { valid: false, message: "Username cannot contain spaces" };
  }
  
  if (!usernameRegex.test(username)) {
    return { 
      valid: false, 
      message: "Username can only contain letters, numbers, underscores, and hyphens (3-20 characters)" 
    };
  }
  
  return { valid: true };
};

/**
 * Formats a string with user mentions, highlighting valid usernames
 * @param content The content with possible @username mentions
 * @param highlightClass The CSS class to apply to valid mentions (default: "text-primary")
 * @returns JSX with properly formatted mentions
 */
export const formatUserMentions = (content: string, highlightClass = "text-primary"): React.ReactNode[] => {
  if (!content) return [<React.Fragment key="empty"></React.Fragment>];
  
  // Regex to find @username mentions
  const mentionRegex = /(@[a-zA-Z0-9_-]{3,20})\b/g;
  
  // Split content by mentions
  const parts = content.split(mentionRegex);
  
  // Map each part into a span
  return parts.map((part, index) => {
    // Check if this part is a mention
    if (part.match(mentionRegex)) {
      return (
        <span key={index} className={highlightClass}>
          {part}
        </span>
      );
    }
    
    // Regular text
    return <span key={index}>{part}</span>;
  });
};

/**
 * Extracts all valid user mentions from content
 * @param content The content with possible @username mentions
 * @returns Array of usernames without the @ symbol
 */
export const extractUserMentions = (content: string): string[] => {
  if (!content) return [];
  
  // Regex to find @username mentions
  const mentionRegex = /@([a-zA-Z0-9_-]{3,20})\b/g;
  const mentions: string[] = [];
  
  let match;
  while ((match = mentionRegex.exec(content)) !== null) {
    // Add the username without the @ symbol
    mentions.push(match[1]);
  }
  
  return mentions;
};

/**
 * Converts a username to a properly formatted mention
 * @param username The username to format
 * @returns Formatted mention (e.g., @username)
 */
export const formatMention = (username: string): string => {
  if (!username) return '';
  
  // Remove @ if already present
  const cleanUsername = username.replace(/^@/, '');
  
  // Ensure it's valid
  const { valid } = validateUsername(cleanUsername);
  if (!valid) return cleanUsername;
  
  // Return properly formatted mention
  return `@${cleanUsername}`;
};
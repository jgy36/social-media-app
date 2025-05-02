// Update MediaDisplay.tsx with improved URL handling and debugging

import { useState, useEffect } from "react";
import { Film } from "lucide-react";
import { MediaType } from "@/types/post";

interface MediaDisplayProps {
  media: MediaType[];
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({ media }) => {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number>(0);
  const [debugInfo, setDebugInfo] = useState<string>("");
  
  if (!media || media.length === 0) return null;
  
  const selectedMedia = media[selectedMediaIndex];
  
  // Get base API URL from environment or use default
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  
  // Function to ensure URL has the correct base
  const getFullUrl = (url: string) => {
    if (!url) return '';
    
    // Debug the URL being processed
    console.log('Processing URL:', url);
    
    let fullUrl;
    // If URL already has http:// or https://, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      fullUrl = url;
    }
    // If URL starts with /media, prepend API base URL
    else if (url.startsWith('/media/')) {
      fullUrl = `${API_BASE_URL}${url}`;
    }
    // Otherwise, assume it's a relative path and prepend API base URL with /api prefix
    else {
      fullUrl = `${API_BASE_URL}/api${url.startsWith('/') ? url : '/' + url}`;
    }
    
    console.log('Full URL:', fullUrl);
    return fullUrl;
  };
  
  useEffect(() => {
    if (selectedMedia) {
      setDebugInfo(`Original URL: ${selectedMedia.url}, Type: ${selectedMedia.mediaType}`);
    }
  }, [selectedMedia]);
  
  return (
    <div className="mt-3">
      {/* Debug information - Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground mb-2 border border-dashed border-muted-foreground/30 p-2 rounded">
          <div>Debug: {debugInfo}</div>
          <div>API Base: {API_BASE_URL}</div>
          <div>Full URL: {getFullUrl(selectedMedia.url)}</div>
        </div>
      )}
      
      {/* Main media display */}
      <div className="rounded-md overflow-hidden bg-muted/20 mb-2">
        {selectedMedia.mediaType === 'image' || selectedMedia.mediaType === 'gif' ? (
          <img
            src={getFullUrl(selectedMedia.url)}
            alt={selectedMedia.altText || "Post image"}
            className="w-full h-auto max-h-96 object-contain"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              console.error("Failed to load image:", getFullUrl(selectedMedia.url));
              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Cpath d='M35,35 L65,35 L65,65 L35,65 Z' fill='%23cccccc'/%3E%3C/svg%3E";
            }}
          />
        ) : selectedMedia.mediaType === 'video' ? (
          <video
            src={getFullUrl(selectedMedia.url)}
            controls
            className="w-full h-auto max-h-96"
            onClick={(e) => e.stopPropagation()}
          />
        ) : null}
      </div>
      
      {/* Thumbnails for multiple media */}
      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {media.map((item, index) => (
            <div 
              key={index}
              className={`relative w-16 h-16 rounded-md overflow-hidden cursor-pointer flex-shrink-0 ${
                index === selectedMediaIndex ? 'ring-2 ring-primary' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMediaIndex(index);
              }}
            >
              {item.mediaType === 'image' || item.mediaType === 'gif' ? (
                <img
                  src={getFullUrl(item.thumbnailUrl || item.url)}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : item.mediaType === 'video' ? (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <Film className="h-6 w-6 text-white" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaDisplay;
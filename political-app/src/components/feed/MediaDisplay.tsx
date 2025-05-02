// Create a new file: political-app/src/components/feed/MediaDisplay.tsx

import { useState } from "react";
import { Film } from "lucide-react";
import { MediaType } from "@/types/post";

interface MediaDisplayProps {
  media: MediaType[];
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({ media }) => {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number>(0);
  
  if (!media || media.length === 0) return null;
  
  const selectedMedia = media[selectedMediaIndex];
  
  return (
    <div className="mt-3">
      {/* Main media display */}
      <div className="rounded-md overflow-hidden bg-muted/20 mb-2">
        {selectedMedia.mediaType === 'image' || selectedMedia.mediaType === 'gif' ? (
          <img
            src={selectedMedia.url}
            alt={selectedMedia.altText || "Post image"}
            className="w-full h-auto max-h-96 object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        ) : selectedMedia.mediaType === 'video' ? (
          <video
            src={selectedMedia.url}
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
                  src={item.thumbnailUrl || item.url}
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
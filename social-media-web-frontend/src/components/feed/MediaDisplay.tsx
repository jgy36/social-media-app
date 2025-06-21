import { useState, useEffect } from "react";
import { Film } from "lucide-react";
import { MediaType } from "@/types/post";

interface MediaDisplayProps {
  media: MediaType[];
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({ media }) => {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number>(0);
  const [debugInfo, setDebugInfo] = useState<string>("");

  // Get base URL from environment or use default
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";

  // useEffect must be called unconditionally before any returns
  useEffect(() => {
    if (media && media.length > 0) {
      const selectedMedia = media[selectedMediaIndex];
      if (selectedMedia) {
        setDebugInfo(
          `Original URL: ${selectedMedia.url}, Type: ${selectedMedia.mediaType}`
        );
      }
    }
  }, [media, selectedMediaIndex]);

  // Now we can have our early return
  if (!media || media.length === 0) return null;

  const selectedMedia = media[selectedMediaIndex];

  // Function to ensure URL has the correct base
  const getFullUrl = (url: string): string => {
    if (!url) return "";

    let fullUrl: string;

    // If URL already has http:// or https://, return as is
    if (url.startsWith("http://") || url.startsWith("https://")) {
      fullUrl = url;
    }
    // If URL starts with /media, prepend BASE_URL
    else if (url.startsWith("/media/")) {
      fullUrl = `${BASE_URL}${url}`;
    }
    // Otherwise, use BASE_URL with the given path
    else {
      fullUrl = `${BASE_URL}${url.startsWith("/") ? url : "/" + url}`;
    }

    console.log("Full URL:", fullUrl);
    return fullUrl;
  };

  return (
    <div className="mt-3">
      {/* Main media display */}
      <div className="rounded-md overflow-hidden bg-muted/20 mb-2">
        {selectedMedia.mediaType === "image" ||
        selectedMedia.mediaType === "gif" ? (
          <img
            src={getFullUrl(selectedMedia.url)}
            alt={selectedMedia.altText || "Post image"}
            className="w-full h-auto max-h-96 object-contain"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              console.error(
                "Failed to load image:",
                getFullUrl(selectedMedia.url)
              );
              // Add more debug info in the error handler
              const img = e.currentTarget;
              console.error(
                "Image dimensions:",
                img.naturalWidth,
                "x",
                img.naturalHeight
              );
              console.error("Complete URL:", img.src);

              e.currentTarget.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Cpath d='M35,35 L65,35 L65,65 L35,65 Z' fill='%23cccccc'/%3E%3C/svg%3E";
            }}
          />
        ) : selectedMedia.mediaType === "video" ? (
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
                index === selectedMediaIndex ? "ring-2 ring-primary" : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMediaIndex(index);
              }}
            >
              {item.mediaType === "image" || item.mediaType === "gif" ? (
                <img
                  src={getFullUrl(item.thumbnailUrl || item.url)}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : item.mediaType === "video" ? (
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

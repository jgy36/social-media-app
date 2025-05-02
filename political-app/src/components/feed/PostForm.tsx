// src/components/feed/PostForm.tsx
import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Image, Film, X } from "lucide-react";
import { useCreatePost } from "@/hooks/useApi";
import { toast } from "@/hooks/use-toast";

interface PostFormProps {
  onPostCreated: () => void;
}

const PostForm = ({ onPostCreated }: PostFormProps) => {
  const [content, setContent] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const user = useSelector((state: RootState) => state.user);
  const { loading, error, execute: createPost } = useCreatePost();

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    // Limit to 4 files
    if (mediaFiles.length + e.target.files.length > 4) {
      toast({
        title: "Too many files",
        description: "You can only upload up to 4 media items per post.",
        variant: "destructive",
      });
      return;
    }
    
    const newFiles: File[] = Array.from(e.target.files);
    const validFiles: File[] = [];
    const newPreviews: string[] = [];
    
    // Check file types and sizes
    newFiles.forEach(file => {
      const fileType = file.type;
      const fileSize = file.size / (1024 * 1024); // Convert to MB
      
      if (!fileType.match(/^(image|video)\//)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported media type.`,
          variant: "destructive",
        });
        return;
      }
      
      if (fileSize > 10) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 10MB limit.`,
          variant: "destructive",
        });
        return;
      }
      
      validFiles.push(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      newPreviews.push(previewUrl);
    });
    
    setMediaFiles([...mediaFiles, ...validFiles]);
    setMediaPreviews([...mediaPreviews, ...newPreviews]);
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const removeMedia = (index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(mediaPreviews[index]);
    
    const newFiles = [...mediaFiles];
    const newPreviews = [...mediaPreviews];
    
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setMediaFiles(newFiles);
    setMediaPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && mediaFiles.length === 0) {
      setLocalError("Post must have either text or media content");
      return;
    }
    
    if (!user.token) {
      setLocalError("You must be logged in to post.");
      return;
    }

    setLocalError(null);

    try {
      // Prepare media types
      const mediaTypes = mediaFiles.map(file => {
        if (file.type.startsWith("image/")) {
          return file.type.includes("gif") ? "gif" : "image";
        } else if (file.type.startsWith("video/")) {
          return "video";
        }
        return "image"; // Default
      });
      
      // Use the API hook to create post with media
      const result = await createPost({ 
        content,
        media: mediaFiles.length > 0 ? mediaFiles : undefined,
        mediaTypes: mediaFiles.length > 0 ? mediaTypes : undefined,
      });
      
      if (result) {
        setContent(""); // Clear input after posting
        setMediaFiles([]);
        setMediaPreviews([]);
        onPostCreated(); // Notify parent component
      } else {
        setLocalError("Failed to create post. Please try again.");
      }
    } catch (err) {
      console.error("Error creating post:", err);
      setLocalError("Failed to create post. Please try again.");
    }
  };

  // Use either local error or API error
  const errorMessage = localError || (error ? error.message : null);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && <p className="text-destructive text-sm">{errorMessage}</p>}

      <Textarea
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[120px] resize-none text-foreground dark:text-foreground bg-background dark:bg-background border-input"
        disabled={loading}
      />
      
      {/* Media previews */}
      {mediaPreviews.length > 0 && (
        <div className={`grid gap-2 ${mediaPreviews.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {mediaPreviews.map((preview, index) => (
            <div key={index} className="relative rounded-md overflow-hidden bg-muted/20">
              {mediaFiles[index].type.startsWith('image/') ? (
                <img
                  src={preview}
                  alt={`Media upload ${index + 1}`}
                  className="w-full h-auto object-contain max-h-64"
                />
              ) : (
                <video
                  src={preview}
                  controls
                  className="w-full h-auto max-h-64"
                />
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 rounded-full"
                onClick={() => removeMedia(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleMediaChange}
            accept="image/*, video/*"
            multiple
            className="hidden"
            id="media-upload"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || mediaFiles.length >= 4}
          >
            <Image className="h-4 w-4 mr-2" />
            Photo
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || mediaFiles.length >= 4}
          >
            <Film className="h-4 w-4 mr-2" />
            Video
          </Button>
        </div>
        
        <Button 
          type="submit" 
          disabled={loading || (!content.trim() && mediaFiles.length === 0)}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            "Post"
          )}
        </Button>
      </div>
    </form>
  );
};

export default PostForm;
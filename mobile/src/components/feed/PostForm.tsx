import { MaterialIcons } from '@expo/vector-icons';
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

import { useCreatePost } from '@/hooks/useApi';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

interface PostFormProps {
  onPostCreated: () => void;
}

const PostForm = ({ onPostCreated }: PostFormProps) => {
  const [content, setContent] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  
  const user = useSelector((state: RootState) => state.user);
  const { loading, error, execute: createPost } = useCreatePost();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets) {
      const newFiles = result.assets.slice(0, 4 - mediaFiles.length);
      setMediaFiles([...mediaFiles, ...newFiles]);
      setMediaPreviews([...mediaPreviews, ...newFiles.map(asset => asset.uri)]);
    }
  };

  const removeMedia = (index: number) => {
    const newFiles = [...mediaFiles];
    const newPreviews = [...mediaPreviews];
    
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setMediaFiles(newFiles);
    setMediaPreviews(newPreviews);
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      setLocalError('Please type something. Posts must have text content.');
      return;
    }
    
    if (!user.token) {
      setLocalError('You must be logged in to post.');
      return;
    }

    setLocalError(null);

    try {
      const result = await createPost({ 
        content,
        media: mediaFiles.length > 0 ? mediaFiles : undefined,
      });
      
      if (result) {
        setContent('');
        setMediaFiles([]);
        setMediaPreviews([]);
        onPostCreated();
      } else {
        setLocalError('Failed to create post. Please try again.');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setLocalError('Failed to create post. Please try again.');
    }
  };

  const errorMessage = localError || (error ? error.message : null);

  return (
    <View className="bg-card rounded-lg shadow-sm border border-border p-4 mx-4 my-2">
      {errorMessage && (
        <Text className="text-destructive text-sm mb-4">{errorMessage}</Text>
      )}

      <TextInput
        placeholder="What's on your mind?"
        value={content}
        onChangeText={setContent}
        multiline
        className="bg-background border border-input rounded-lg p-3 min-h-[120px] text-foreground text-base"
        textAlignVertical="top"
        editable={!loading}
      />
      
      {/* Media previews */}
      {mediaPreviews.length > 0 && (
        <ScrollView 
          horizontal 
          className="mt-4"
          showsHorizontalScrollIndicator={false}
        >
          <View className="flex-row gap-2">
            {mediaPreviews.map((preview, index) => (
              <View key={index} className="relative rounded-lg overflow-hidden bg-muted/20">
                <Image
                  source={{ uri: preview }}
                  className="w-24 h-24 object-cover"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  className="absolute top-1 right-1 bg-destructive rounded-full p-1"
                  onPress={() => removeMedia(index)}
                >
                  <MaterialIcons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <View className="flex-row justify-between items-center mt-4">
        <View className="flex-row gap-2">
          <TouchableOpacity
            className="bg-transparent border border-border rounded-lg p-2 flex-row items-center gap-2"
            onPress={pickImage}
            disabled={loading || mediaFiles.length >= 4}
          >
            <ImageIcon size={20} color="#6366f1" />
            <Text className="text-primary text-sm">Photo</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          className={`${
            loading || (!content.trim() && mediaFiles.length === 0)
              ? 'bg-muted opacity-50'
              : 'bg-primary'
          } px-6 py-2 rounded-lg`}
          onPress={handleSubmit}
          disabled={loading || (!content.trim() && mediaFiles.length === 0)}
        >
          {loading ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white text-base">Posting...</Text>
            </View>
          ) : (
            <Text className="text-white text-base font-medium">Post</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PostForm;
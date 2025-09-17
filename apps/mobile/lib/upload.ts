import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { supabase } from './supabase';

export async function uploadImageToSupabase(
  uri: string,
  bucket: string = 'report-images'
): Promise<string> {
  try {
    let base64Data: string;
    
    if (Platform.OS === 'web') {
      // For web, we need to fetch the file and convert it to base64
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
            resolve(base64String.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        throw new Error('Failed to read file');
      }
    } else {
      // For native platforms, use FileSystem
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }
      base64Data = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });
    }

    // Generate a unique filename
    const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeType = fileExt === 'jpg' ? 'jpeg' : fileExt;
    const fileName = `${Math.random().toString(36).substring(7)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, decode(base64Data), {
        contentType: `image/${mimeType}`,
        upsert: true,
      });

    if (error) {
      throw error;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error: any) {
    console.error('Error uploading file:', error);
    throw new Error(error.message || error.error_description || 'Failed to upload image');
  }
}

// Helper function to convert base64 to Uint8Array
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
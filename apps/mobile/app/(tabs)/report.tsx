import React from 'react';
import * as Location from 'expo-location';
import { 
  Alert, 
  Image as RNImage, 
  Keyboard,
  Platform, 
  Pressable, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  View, 
  ActivityIndicator, 
  KeyboardAvoidingView 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import LoginRequired from '@/components/LoginRequired';
import { supabase } from '@/lib/supabase';
import { uploadImageToSupabase } from '@/lib/upload';
import { useEffect, useState } from 'react';

export default function ReportScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const c = Colors[colorScheme];
  const [image, setImage] = React.useState<ImagePicker.ImagePickerAsset | null>(null);
  const [description, setDescription] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [location, setLocation] = React.useState<{ latitude: number; longitude: number } | null>(null);
  const [locLoading, setLocLoading] = React.useState(false);
  const pickingRef = React.useRef(false);
  const scrollRef = React.useRef<ScrollView | null>(null);
  const [descY, setDescY] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      setAuthLoading(true);
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setAuthLoading(false);
    };
    fetchSession();
    const { subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    }).data;
    return () => subscription.unsubscribe();
  }, []);

  // Get user location on mount
  useEffect(() => {
    if (!session) return;
    (async () => {
      setLocLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        setLocLoading(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      setLocLoading(false);
    })();
  }, [session]);

  async function pickImage() {
    if (pickingRef.current) return;
    pickingRef.current = true;
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need access to your photos to upload an image.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        const mime = asset.mimeType ?? '';
        const size = asset.fileSize ?? 0;
        const accepted = ['image/jpeg', 'image/png'];
        const maxSize = 5 * 1024 * 1024;
        if (!accepted.includes(mime)) {
          setError('Please upload a JPG or PNG image.');
          setImage(null);
          return;
        }
        if (size && size > maxSize) {
          setError('File is too large. Max size is 5MB.');
          setImage(null);
          return;
        }
        setError(null);
        setImage(asset);
      }
    } finally {
      pickingRef.current = false;
    }
  }

  function resetForm() {
    setImage(null);
    setDescription('');
    setError(null);
  }

  async function insertReport(data: any) {
    // Cast supabase as any to bypass type errors
    return await (supabase as any)
      .from('reports')
      .insert([data]);
  }

  async function onSubmit() {
    if (!image) {
      setError('Please upload a photo (JPG or PNG, max 5MB).');
      return;
    }
    if (!description.trim()) {
      setError('Please add a short description of the issue.');
      return;
    }
    if (!session || !session.user) {
      setError('You must be signed in to submit a report.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const imageUrl = await uploadImageToSupabase(image.uri);
      const insertData = {
        description: description.trim(),
        image_url: imageUrl,
        status: 'pending' as const,
        location: location ? { lat: location.latitude, lng: location.longitude } : null,
        user_id: session.user.id,
      };
      const { error: insertError } = await insertReport(insertData);
      if (insertError) throw insertError;
      Alert.alert('Report submitted', 'Thank you for helping improve your city.');
      resetForm();
    } catch (err: any) {
      const errorMessage = err.message || err.error_description || 'Failed to submit report. Please try again.';
      setError(errorMessage);
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}> 
        <ActivityIndicator size="large" color={c.tint} />
      </View>
    );
  }
  if (!session || !session.user) {
    return <LoginRequired />;
  }
  return (
    <View style={[styles.safeArea, { backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFF7ED' }]}> 
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1, backgroundColor: c.background }}
          contentContainerStyle={{ padding: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.headerBlock, { marginBottom: 24 }]}>
            <ThemedText type="title">📝 Report an Issue</ThemedText>
            <ThemedText style={styles.headerSub}>
              Help us fix problems in your area. Upload a photo and add a short description.
            </ThemedText>
          </View>

          {/* Photo upload */}
          <View style={[styles.card, { borderColor: colorScheme === 'dark' ? '#3F3F46' : '#F59E0B', backgroundColor: colorScheme === 'dark' ? 'rgba(28,28,28,0.6)' : 'rgba(255,255,255,0.7)', marginBottom: 20 }]}> 
            <Text style={[styles.label, { color: colorScheme === 'dark' ? '#E5E7EB' : '#1F2937' }]}> 
              Upload a photo<Text style={{ color: '#DC2626' }}>*</Text>
            </Text>

            <Pressable onPress={pickImage} style={styles.dropZone} android_ripple={{ color: '#f1c971' }}>
              <Text style={{ color: colorScheme === 'dark' ? '#FBBF24' : '#92400E', fontWeight: '600', textAlign: 'center' }}>
                Tap to choose a file
              </Text>
              <Text style={{ color: colorScheme === 'dark' ? '#FFFFFF' : '#6B7280', fontSize: 12, marginTop: 4 }}>
                Accepted formats: JPG, PNG (max 5MB)
              </Text>
              {image?.uri ? (
                <RNImage
                  source={{ uri: image.uri }}
                  style={{ width: '100%', height: 200, borderRadius: 12, marginTop: 12 }}
                  resizeMode="cover"
                />
              ) : null}
            </Pressable>
          </View>

          {/* Description */}
          <View
            style={[styles.card, { borderColor: colorScheme === 'dark' ? '#3F3F46' : '#F59E0B', backgroundColor: colorScheme === 'dark' ? 'rgba(28,28,28,0.6)' : 'rgba(255,255,255,0.7)', marginBottom: 20 }]}
            onLayout={(e) => setDescY(e.nativeEvent.layout.y)}
          > 
            <Text style={[styles.label, { color: colorScheme === 'dark' ? '#E5E7EB' : '#1F2937' }]}> 
              Describe the issue <Text style={{ color: '#DC2626' }}>*</Text>
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Example: Broken streetlight near Main Street crossing..."
              placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#9CA3AF'}
              multiline
              numberOfLines={5}
              style={[styles.textArea, {
                color: colorScheme === 'dark' ? c.text : '#1F2937',
                borderColor: colorScheme === 'dark' ? '#3F3F46' : '#F59E0B',
                backgroundColor: colorScheme === 'dark' ? 'rgba(23,23,23,0.8)' : '#FFFFFF',
              }]}
              onFocus={() => {
                // Scroll to make submit button visible when description is focused
                setTimeout(() => {
                  scrollRef.current?.scrollToEnd({ animated: true });
                }, 100);
              }}
            />
          </View>

          {/* Location Display Only */}
          <View style={[styles.card, { borderColor: colorScheme === 'dark' ? '#3F3F46' : '#F59E0B', backgroundColor: colorScheme === 'dark' ? 'rgba(28,28,28,0.6)' : 'rgba(255,255,255,0.7)', marginBottom: 20 }]}>
            <Text style={[styles.label, { color: colorScheme === 'dark' ? '#E5E7EB' : '#1F2937' }]}>Location</Text>
            {locLoading ? (
              <ActivityIndicator size="small" color={c.text} />
            ) : location ? (
              <Text style={{ fontSize: 12, color: colorScheme === 'dark' ? '#9CA3AF' : '#4B5563' }}>
                Lat: {location.latitude.toFixed(5)}, Lng: {location.longitude.toFixed(5)}
              </Text>
            ) : (
              <Text style={{ fontSize: 12, color: '#DC2626' }}>Location not available</Text>
            )}
          </View>

          {/* Helper */}
          <Text style={{ color: colorScheme === 'dark' ? '#9CA3AF' : '#4B5563', fontSize: 12, marginBottom: 16 }}>
            Your Real-Time location is being used. Please submit reports from the location of the Issue.
          </Text>

          {/* Error */}
          {!!error && (
            <Text accessibilityLiveRegion="polite" style={{ color: '#DC2626', marginTop: 8, marginBottom: 16 }}>{error}</Text>
          )}

          {/* Actions */}
          <View style={[styles.actionsRow, { marginTop: 8 }]}>
            <Pressable
              onPress={onSubmit}
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.primaryBtn,
                { 
                  backgroundColor: isSubmitting ? '#92400E' : (pressed ? '#92400E' : c.tint),
                  opacity: isSubmitting ? 0.7 : 1
                },
              ]}
              android_ripple={{ color: '#f0d5a2' }}
              accessibilityRole="button"
              accessibilityLabel="Submit Report"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Submit Report</Text>
              )}
            </Pressable>
            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                resetForm();
              }}
              style={({ pressed }) => [
                styles.secondaryBtn,
                { 
                  borderColor: colorScheme === 'dark' ? '#3F3F46' : '#F59E0B',
                  opacity: pressed ? 0.7 : 1 
                }
              ]}
              accessibilityRole="button"
            >
              <Text style={[styles.secondaryBtnText, { color: colorScheme === 'dark' ? '#E5E7EB' : '#111827' }]}>Cancel</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerBlock: {
    gap: 6,
    paddingTop: 4,
    paddingBottom: 0,
  },
  headerSub: {
    opacity: 0.9,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  dropZone: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(255, 251, 235, 0.6)',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  primaryBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  primaryBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

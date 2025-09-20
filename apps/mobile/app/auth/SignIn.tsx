import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const c = Colors[colorScheme];

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFF7ED' }]}>
      {/* Back to Home Button */}
      <Pressable 
        style={styles.backButton}
        onPress={() => router.replace('/(tabs)')}
      >
        <IconSymbol 
          size={24} 
          name="chevron.left" 
          color={c.tint} 
        />
        <Text style={[styles.backText, { color: c.tint }]}>Home</Text>
      </Pressable>
      
      <View style={[styles.card, { 
        backgroundColor: colorScheme === 'dark' ? '#111111' : '#FFFFFF',
        borderColor: colorScheme === 'dark' ? '#2A2A2A' : '#D1D5DB',
      }]}>
        <Text style={[styles.title, { color: c.tint }]}>Sign In</Text>
        <TextInput
          placeholder="Email"
          onChangeText={setEmail}
          value={email}
          style={[styles.input, {
            borderColor: colorScheme === 'dark' ? '#3F3F46' : '#F59E0B',
            backgroundColor: colorScheme === 'dark' ? 'rgba(23,23,23,0.8)' : '#FFF7ED',
            color: colorScheme === 'dark' ? c.text : '#1F2937',
          }]}
          placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#9CA3AF'}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
          style={[styles.input, {
            borderColor: colorScheme === 'dark' ? '#3F3F46' : '#F59E0B',
            backgroundColor: colorScheme === 'dark' ? 'rgba(23,23,23,0.8)' : '#FFF7ED',
            color: colorScheme === 'dark' ? c.text : '#1F2937',
          }]}
          placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#9CA3AF'}
        />
        {error && <Text style={{ color: '#DC2626', marginBottom: 8 }}>{error}</Text>}
        
        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            { 
              backgroundColor: loading ? '#92400E' : (pressed ? '#92400E' : c.tint),
              opacity: loading ? 0.7 : 1
            },
          ]}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryBtnText}>Sign In</Text>
          )}
        </Pressable>
        
        <Pressable
          style={({ pressed }) => [
            styles.secondaryBtn,
            { 
              borderColor: colorScheme === 'dark' ? '#3F3F46' : '#F59E0B',
              opacity: pressed ? 0.7 : 1 
            },
          ]}
          onPress={() => router.push('/auth/SignUp')}
        >
          <Text style={[styles.secondaryBtnText, { color: colorScheme === 'dark' ? '#E5E7EB' : '#111827' }]}>Create Account</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'stretch',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  primaryBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    marginBottom: 12,
  },
  primaryBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: 'transparent',
    marginBottom: 12,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
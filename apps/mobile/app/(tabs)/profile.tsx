import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colorScheme === 'dark' ? '#0c0c0c' : '#FFF7ED' }]}> 
      <ThemedView style={styles.header}> 
        <ThemedText type="title">👤 Profile</ThemedText>
        <ThemedText>Manage your account and preferences.</ThemedText>
      </ThemedView>
      <View style={{ padding: 16 }}>
        <Text style={{ opacity: 0.8 }}>Coming soon.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
});

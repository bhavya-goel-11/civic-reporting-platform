import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFF7ED' }]}> 
      <View style={styles.header}> 
        <ThemedText type="title" style={styles.headerTitle}>👤 Profile</ThemedText>
        <ThemedText>Manage your account and preferences.</ThemedText>
      </View>
      <View style={{ padding: 16 }}>
        <Text style={{ opacity: 0.8 }}>Coming soon.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { lineHeight: 40 },
});

import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

type Issue = { id: string; title: string; status: 'Open' | 'In Progress' | 'Resolved' };

const DATA: Issue[] = [
  { id: '1', title: 'Pothole on 5th Ave', status: 'Open' },
  { id: '2', title: 'Streetlight not working', status: 'In Progress' },
  { id: '3', title: 'Graffiti on wall', status: 'Resolved' },
];

export default function TrackScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const c = Colors[colorScheme];
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFF7ED' }]}> 
      <View style={styles.header}> 
        <ThemedText type="title" style={styles.headerTitle}>📍 Track Issues</ThemedText>
        <ThemedText>View the status of your submitted reports.</ThemedText>
      </View>
      <FlatList
        contentContainerStyle={{ padding: 16, gap: 12 }}
        data={DATA}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <Pressable style={({ pressed }) => [styles.card, { borderColor: c.tint, opacity: pressed ? 0.85 : 1 }]}> 
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={[styles.badge, { backgroundColor: c.tint }]}>{item.status}</Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { lineHeight: 40 },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  badge: {
    color: 'white',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
    fontSize: 12,
    fontWeight: '700',
  },
});

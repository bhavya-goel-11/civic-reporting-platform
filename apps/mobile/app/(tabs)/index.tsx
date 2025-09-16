import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';

export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  const recentReports = [
    { id: '1', title: 'Pothole near Main Street', status: 'In Progress' },
    { id: '2', title: 'Broken streetlight in Sector 5', status: 'Acknowledged' },
    { id: '3', title: 'Overflowing trash bin', status: 'Resolved' },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: scheme === 'dark' ? '#000000' : '#FFF7ED' }]}> 
      {/* Header / Branding (no background container) */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/icon.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <ThemedText type="title">CivicConnect</ThemedText>
        <ThemedText style={[styles.tagline, { opacity: 0.8 }]}>Report. Track. Resolve.</ThemedText>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity
        style={[styles.primaryBtn, { backgroundColor: c.tint }]}
        onPress={() => router.push('/report')}
        accessibilityRole="button"
        accessibilityLabel="Report an Issue"
      >
        <Text style={styles.primaryBtnText}>Report an Issue</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.secondaryBtn, { borderColor: c.tint }]}
        onPress={() => router.push('/track')}
        accessibilityRole="button"
        accessibilityLabel="Track My Reports"
      >
        <Text style={[styles.secondaryBtnText, { color: c.tint }]}>Track My Reports</Text>
      </TouchableOpacity>

      {/* Info Banner */}
      <View style={[styles.banner, { backgroundColor: scheme === 'dark' ? '#222' : '#FFF7ED', borderColor: scheme === 'dark' ? '#3F3F46' : '#F59E0B' }]}> 
        <Text style={[styles.bannerText, { color: scheme === 'dark' ? '#F3F4F6' : '#1F2937' }]}>
          See a problem? Take a photo. We’ll handle the rest.
        </Text>
      </View>

      {/* Recent Reports */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Your Recent Reports</ThemedText>
        <FlatList
          data={recentReports}
          renderItem={({ item }) => (
            <View style={[styles.reportCard, { backgroundColor: scheme === 'dark' ? '#111' : '#FFFFFF', borderColor: scheme === 'dark' ? '#27272A' : '#E5E7EB' }]}> 
              <ThemedText style={styles.reportTitle}>{item.title}</ThemedText>
              <Text style={[styles.reportStatus, { color: c.tint }]}>{item.status}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
        <TouchableOpacity onPress={() => router.push('/track')}>
          <Text style={[styles.viewAll, { color: c.tint }]}>View All →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, padding: 20 },
  header: {
    marginBottom: 16,
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 16,
    justifyContent: "flex-end",
    minHeight: 220,
  },
  logoImage: {
    width: 88,
    height: 88,
    borderRadius: 20,
    marginBottom: 14,
  },
  tagline: { fontSize: 18, marginTop: 6 },
  primaryBtn: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 10,
  },
  primaryBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  secondaryBtn: {
    borderWidth: 2,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  secondaryBtnText: { fontSize: 18, fontWeight: "bold" },
  banner: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
  },
  bannerText: { fontSize: 14, textAlign: "center" },
  section: { marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  reportCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
  },
  reportTitle: { fontSize: 16 },
  reportStatus: { fontSize: 14, marginTop: 4 },
  viewAll: { marginTop: 8, fontWeight: "bold", textAlign: "right" },
});

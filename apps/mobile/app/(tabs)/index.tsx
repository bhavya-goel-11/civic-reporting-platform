import React from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Image } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();
  const recentReports = [
    { id: "1", title: "Pothole near Main Street", status: "In Progress" },
    { id: "2", title: "Broken streetlight in Sector 5", status: "Acknowledged" },
    { id: "3", title: "Overflowing trash bin", status: "Resolved" },
  ];
  return (
    <SafeAreaView style={styles.container}>
      {/* Header / Branding */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.logo}>CivicConnect</Text>
        <Text style={styles.tagline}>Report. Track. Resolve.</Text>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => router.push("/report")}
      >
        <Text style={styles.primaryBtnText}>Report an Issue</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={() => router.push("/track")}
      >
        <Text style={styles.secondaryBtnText}>Track My Reports</Text>
      </TouchableOpacity>

      {/* Info Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          See a problem? Take a photo. We’ll handle the rest.
        </Text>
      </View>
      {/* Recent Reports */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Recent Reports</Text>
        <FlatList
          data={recentReports}
          renderItem={({ item }) => (
            <View style={styles.reportCard}>
              <Text style={styles.reportTitle}>{item.title}</Text>
              <Text style={styles.reportStatus}>{item.status}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
        <TouchableOpacity onPress={() => router.push("/track")}>
          <Text style={styles.viewAll}>View All →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 20 },
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
  logo: { color: "#fff", fontSize: 40, fontWeight: "bold" },
  tagline: { color: "#aaa", fontSize: 18, marginTop: 6 },
  primaryBtn: {
    backgroundColor: "#f9b233",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 10,
  },
  primaryBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  secondaryBtn: {
    borderWidth: 2,
    borderColor: "#f9b233",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  secondaryBtnText: { color: "#f9b233", fontSize: 18, fontWeight: "bold" },
  banner: {
    backgroundColor: "#222",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  bannerText: { color: "#fff", fontSize: 14, textAlign: "center" },
  section: { marginTop: 10 },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  reportCard: {
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  reportTitle: { color: "#fff", fontSize: 16 },
  reportStatus: { color: "#f9b233", fontSize: 14, marginTop: 4 },
  viewAll: { color: "#f9b233", marginTop: 8, fontWeight: "bold", textAlign: "right" },
});

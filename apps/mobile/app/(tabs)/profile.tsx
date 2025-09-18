import React, { useMemo } from 'react';
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function ProfileScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];

  const user = useMemo(
    () => ({
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      role: 'Community Reporter',
      avatar: require('../../assets/images/icon.png'),
    }),
    []
  );

  type Report = {
    id: string;
    image: any; // require() source
    description: string;
    upvotes: number;
    downvotes: number;
  };

  const reports: Report[] = useMemo(
    () => [
      {
        id: 'r1',
        image: require('../../assets/images/splash-icon.png'),
        description: 'Graffiti on the north wall of the community center. Needs cleanup.',
        upvotes: 42,
        downvotes: 1,
      },
      {
        id: 'r2',
        image: require('../../assets/images/react-logo.png'),
        description: 'Street sign at 7th & Pine is tilted and unreadable from the road.',
        upvotes: 15,
        downvotes: 0,
      },
      {
        id: 'r3',
        image: require('../../assets/images/android-icon-foreground.png'),
        description: 'Playground swing chain seems loose; safety inspection recommended.',
        upvotes: 7,
        downvotes: 3,
      },
      {
        id: 'r4',
        image: require('../../assets/images/partial-react-logo.png'),
        description: 'Drainage blocked on Maple St., water pooling after light rain.',
        upvotes: 12,
        downvotes: 4,
      },
    ],
    []
  );

  const renderHeader = () => (
    <View>
      {/* User Info Section */}
      <View style={styles.userInfoRow}>
        <Image source={user.avatar} style={styles.avatar} />
        <View style={styles.userInfoCol}>
          <Text style={[styles.userName, { color: c.text }]} numberOfLines={1}>
            {user.name}
          </Text>
          <Text style={[styles.userEmail, { color: scheme === 'dark' ? '#9BA1A6' : '#6B7280' }]} numberOfLines={1}>
            {user.email}
          </Text>
          <Text style={[styles.userTagline, { color: scheme === 'dark' ? '#9BA1A6' : '#6B7280' }]} numberOfLines={1}>
            {user.role}
          </Text>
        </View>
      </View>

      {/* Section Title */}
      <Text style={[styles.sectionTitle, { color: c.text }]}>My Reports</Text>
    </View>
  );

  return (
    <View style={[styles.safe, { backgroundColor: scheme === 'dark' ? '#000000' : '#FFF7ED' }]}> 
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.feedContent}
        renderItem={({ item }) => {
          const score = item.upvotes - item.downvotes;
          const scoreColor =
            score > 0
              ? c.tint
              : score < 0
              ? scheme === 'dark'
                ? '#F87171'
                : '#DC2626'
              : scheme === 'dark'
              ? '#9BA1A6'
              : '#6B7280';
          return (
            <View style={styles.feedRow}>
              {/* Vote Column (static UI) */}
              <View
                style={[
                  styles.voteColumn,
                  {
                    backgroundColor: scheme === 'dark' ? '#141414' : '#FFFFFF',
                    borderColor: scheme === 'dark' ? '#2A2A2A' : '#D1D5DB',
                  },
                ]}
              >
                <TouchableOpacity activeOpacity={0.6} accessibilityRole="button" accessibilityLabel="Upvote">
                  <View style={styles.voteBtn}>
                    <Text style={[styles.voteIcon, { color: c.tint }]}>▲</Text>
                  </View>
                </TouchableOpacity>
                <Text style={[styles.voteScore, { color: scoreColor }]}>{score}</Text>
                <TouchableOpacity activeOpacity={0.6} accessibilityRole="button" accessibilityLabel="Downvote">
                  <View style={styles.voteBtn}>
                    <Text style={[styles.voteIcon, { color: scheme === 'dark' ? '#9BA1A6' : '#9CA3AF' }]}>▼</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Report Card */}
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: scheme === 'dark' ? '#111111' : '#FFFFFF',
                    borderColor: scheme === 'dark' ? '#2A2A2A' : '#D1D5DB',
                  },
                ]}
              >
                <View style={styles.cardMediaWrapper}>
                  <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
                </View>
                <Text style={[styles.cardDescription, { color: c.text }]}>{item.description}</Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingLeft: 12, // align with feedContent padding
    paddingRight: 18,
    paddingTop: 10,
    paddingBottom: 12,
  },
  avatar: { width: 84, height: 84, borderRadius: 42 },
  userInfoCol: { flex: 1 },
  userName: { fontSize: 24, fontWeight: '800' },
  userEmail: { marginTop: 4, fontSize: 16 },
  userTagline: { marginTop: 2, fontSize: 16 },

  sectionTitle: {
    // No horizontal padding so it aligns with FlatList's contentContainerStyle padding
    paddingHorizontal: 0,
    paddingTop: 12,
    paddingBottom: 10,
    fontSize: 24,
    fontWeight: '700',
  },

  // Reuse feed card style from home
  feedContent: {
    padding: 12,
  },
  feedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  voteColumn: {
    width: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  voteBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteIcon: {
    fontSize: 20,
    fontWeight: '700',
  },
  voteScore: {
    fontSize: 15,
    fontWeight: '700',
    paddingVertical: 4,
  },
  card: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardMediaWrapper: {
    width: '100%',
    height: Math.round(Dimensions.get('window').width * 0.42),
    backgroundColor: '#F3F4F6',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardDescription: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
    lineHeight: 19,
  },
});

import React, { useEffect, useState, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  FlatList, 
  TouchableOpacity, 
  Dimensions, 
  ActivityIndicator,
  Pressable
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

type Report = {
  id: string;
  image_url: string;
  description: string;
  upvotes: number;
  downvotes: number;
  status: 'pending' | 'in_progress' | 'resolved';
};

export default function ProfileScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const router = useRouter();

  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Fetch current logged-in user */
  const fetchUser = useCallback(async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      setUser(null);
      setLoading(false);
      return;
    }
    setUser({ id: user.id, email: user.email ?? '' });
    setLoading(false);
  }, []);

  /** Fetch reports submitted by the logged-in user */
  const fetchReports = useCallback(async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', userId) // filter by the logged-in user
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error.message);
      setError('Failed to load your reports.');
    } else {
      setReports(data || []);
    }
    setLoading(false);
  }, []);

  /** Load user when screen mounts */
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  /** Once user is fetched, get their reports */
  useEffect(() => {
    if (user?.id) {
      fetchReports(user.id);
    }
  }, [user, fetchReports]);

  /** When user is not logged in */
  if (!loading && !user) {
    return (
      <View
        style={[
          styles.safe,
          { justifyContent: 'center', alignItems: 'center', backgroundColor: scheme === 'dark' ? '#000' : '#FFF7ED' },
        ]}
      >
        <Text style={{ color: c.text, fontSize: 24, fontWeight: '800', marginBottom: 10 }}>
          Login Required
        </Text>
        <Text style={{ color: c.text, fontSize: 16, marginBottom: 16, textAlign: 'center', opacity: 0.8 }}>
          You must be logged in to view your profile{'\n'}and reports.
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.loginBtn,
            {
              backgroundColor: pressed ? '#92400E' : c.tint,
            },
          ]}
          onPress={() => router.push('/auth/SignIn')}
        >
          <Text style={styles.loginBtnText}>Go to Login</Text>
        </Pressable>
      </View>
    );
  }

  /** Loading state */
  if (loading) {
    return (
      <View
        style={[
          styles.safe,
          { justifyContent: 'center', alignItems: 'center', backgroundColor: scheme === 'dark' ? '#000' : '#FFF7ED' },
        ]}
      >
        <ActivityIndicator size="large" color={c.tint} />
        <Text style={{ marginTop: 8, color: c.text }}>Loading...</Text>
      </View>
    );
  }

  /** Render header with user info */
  const renderHeader = () => {
    if (!user) return null;

    const handleSignOut = async () => {
      await supabase.auth.signOut();
      router.replace('/auth/SignIn');
    };

    return (
      <View>
        {/* User Info */}
        <View style={styles.userInfoRow}>
          <Image 
            source={scheme === 'dark' 
              ? require('../../assets/images/profile-user-inverted.png') 
              : require('../../assets/images/profile-user.png')
            } 
            style={styles.avatar} 
          />
          <View style={styles.userInfoCol}>
            <Text style={[styles.userName, { color: c.text }]} numberOfLines={1}>
              {user.email.split('@')[0] || 'Anonymous User'}
            </Text>
            <Text
              style={[
                styles.userEmail,
                { color: scheme === 'dark' ? '#9BA1A6' : '#6B7280' },
              ]}
              numberOfLines={1}
            >
              {user.email}
            </Text>
            <Text
              style={[
                styles.userTagline,
                { color: scheme === 'dark' ? '#9BA1A6' : '#6B7280' },
              ]}
            >
              Community Reporter
            </Text>
          </View>
        </View>

        {/* Sign Out Button - Full Width */}
        <View style={styles.signOutContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.signOutBtn,
              { backgroundColor: pressed ? '#92400E' : c.tint },
            ]}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutBtnText}>Sign Out</Text>
          </Pressable>
        </View>

        {/* Section Title */}
        <Text style={[styles.sectionTitle, { color: c.text }]}>My Reports</Text>
      </View>
    );
  };

  /** Error state */
  if (error) {
    return (
      <View
        style={[
          styles.safe,
          { justifyContent: 'center', alignItems: 'center', backgroundColor: scheme === 'dark' ? '#000' : '#FFF7ED' },
        ]}
      >
        <Text style={{ color: '#DC2626', fontSize: 16 }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.safe, { backgroundColor: scheme === 'dark' ? '#000000' : '#FFF7ED' }]}>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.feedContent}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20, color: c.text }}>
            You haven't submitted any reports yet.
          </Text>
        }
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
              {/* Vote Column (UI only for now) */}
              <View
                style={[
                  styles.voteColumn,
                  {
                    backgroundColor: scheme === 'dark' ? '#141414' : '#FFFFFF',
                    borderColor: scheme === 'dark' ? '#2A2A2A' : '#D1D5DB',
                  },
                ]}
              >
                <Text style={[styles.voteIcon, { color: c.tint }]}>▲</Text>
                <Text style={[styles.voteScore, { color: scoreColor }]}>{score}</Text>
                <Text style={[styles.voteIcon, { color: scheme === 'dark' ? '#9BA1A6' : '#9CA3AF' }]}>▼</Text>
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
                  <Image source={{ uri: item.image_url }} style={styles.cardImage} resizeMode="cover" />
                </View>
                <View style={{ padding: 10 }}>
                  <Text style={[styles.cardDescription, { color: c.text }]}>{item.description}</Text>
                  <Text
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      color:
                        item.status === 'resolved'
                          ? '#16A34A'
                          : item.status === 'in_progress'
                          ? '#F59E0B'
                          : '#6B7280',
                    }}
                  >
                    Status: {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
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
    alignItems: 'flex-start',
    gap: 16,
    paddingLeft: 12,
    paddingRight: 18,
    paddingTop: 10,
    paddingBottom: 12,
  },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  userInfoCol: { flex: 1 },
  userName: { fontSize: 26, fontWeight: '800' },
  userEmail: { marginTop: 4, fontSize: 17 },
  userTagline: { marginTop: 2, fontSize: 17 },

  signOutContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },

  sectionTitle: {
    paddingHorizontal: 0,
    paddingTop: 12,
    paddingBottom: 10,
    fontSize: 24,
    fontWeight: '700',
  },

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
    fontSize: 14,
    lineHeight: 19,
  },
  loginBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 2,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  signOutBtn: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  signOutBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});

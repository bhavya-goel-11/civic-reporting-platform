import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, Dimensions, TextInput } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { supabase } from '@/lib/supabase';
import LoginRequired from '@/components/LoginRequired';
import type { Database } from '@/types/supabase';

type ReportRow = Database['public']['Tables']['reports']['Row'];
type Issue = Omit<ReportRow, 'image_url'> & {
  image_url: string | null;
};

export default function HomeScreen() {
  // ...existing code...
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    fetchReports();
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

  // For public buckets, use getPublicUrl
  const getImageUrl = (imagePath: string) => {
    try {
      if (!imagePath) return null;
      if (imagePath.startsWith('http')) {
        return imagePath;
      }
      const fileName = imagePath.split(/[/\\]/).pop();
      if (!fileName) return null;
      const { data } = supabase
        .storage
        .from('report-images')
        .getPublicUrl(fileName);
      return data.publicUrl || null;
    } catch (error) {
      console.error('Error getting public image URL:', error, imagePath);
      return null;
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        // For each report, get a public image URL if image_url exists
        const processedReports: Issue[] = data.map((report: ReportRow) => {
          if (!report.image_url) {
            console.log('No image_url for report', report.id);
            return report;
          }
          const publicUrl = getImageUrl(report.image_url);
          if (!publicUrl) {
            console.error('Failed to get public URL for', report.image_url, 'report id:', report.id);
          }
          console.log('Final image_url for report', report.id, ':', publicUrl || report.image_url);
          return {
            ...report,
            image_url: publicUrl || report.image_url
          };
        });
        setIssues(processedReports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // Track votes per user per report in local state
  const [userVotes, setUserVotes] = useState<{ [reportId: string]: 'up' | 'down' }>(() => ({}));

  // Voting logic
  const handleVote = async (reportId: string, type: 'up' | 'down') => {
    if (authLoading) return;
    if (!session || !session.user) {
      setShowLoginRequired(true);
      // Optionally scroll to top or focus the modal for accessibility
      return;
    }
    // Prevent voting on own report
    const report = issues.find(issue => issue.id === reportId);
    if (report && report.user_id === session.user.id) return;

    // Determine previous vote
    const prevVote = userVotes[reportId];
    let newUpvotes = report?.upvotes ?? 0;
    let newDownvotes = report?.downvotes ?? 0;

    // Remove previous vote if switching
    if (prevVote === 'up' && type === 'down') {
      newUpvotes = Math.max(0, newUpvotes - 1);
      newDownvotes += 1;
    } else if (prevVote === 'down' && type === 'up') {
      newDownvotes = Math.max(0, newDownvotes - 1);
      newUpvotes += 1;
    } else if (!prevVote) {
      if (type === 'up') newUpvotes += 1;
      if (type === 'down') newDownvotes += 1;
    } else {
      // Already voted this way, do nothing
      return;
    }

    setIssues(prev => prev.map(issue => {
      if (issue.id === reportId) {
        return { ...issue, upvotes: newUpvotes, downvotes: newDownvotes };
      }
      return issue;
    }));
    setUserVotes(prev => ({ ...prev, [reportId]: type }));

    const updateData: Partial<Issue> = { upvotes: newUpvotes, downvotes: newDownvotes };
    const { data, error } = await (supabase as any)
      .from('reports')
      .update(updateData)
      .eq('id', reportId)
      .select();
    if (error) {
      console.error('Failed to update vote:', error);
    } else {
      console.log('Vote update response:', data);
    }
  };

  // Show LoginRequired modal/page for voting
  const [showLoginRequired, setShowLoginRequired] = useState(false);

  // Filter issues based on searchText
  const filteredIssues = issues.filter(issue => {
    const search = searchText.trim().toLowerCase();
    if (!search) return true;
    const description = (issue.description || '').toLowerCase();
    const id = (issue.id || '').toLowerCase();
    const location = issue.location ? `${issue.location.lat},${issue.location.lng}` : '';
    return (
      description.includes(search) ||
      id.includes(search) ||
      location.includes(search)
    );
  });

  return (
    <View style={[styles.safeArea, { backgroundColor: scheme === 'dark' ? '#000000' : '#FFF7ED' }]}> 
      {showLoginRequired && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          backgroundColor: scheme === 'dark' ? '#000' : '#111827',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <LoginRequired />
        </View>
      )}
      {/* Header */}
      {/* Top Header */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          {/* <Image source={require('../../assets/images/icon.png')} style={styles.topBarIcon} /> */}
          {!searchOpen && (
            <Text style={[styles.topBarTitle, { color: "#ecc038" }]}>CivicSewa</Text>
          )}
        </View>
        <View style={styles.topBarRight}>
          {searchOpen && (
            <View
              style={[
                styles.searchContainer,
                {
                  backgroundColor: scheme === 'dark' ? '#151515' : '#EFEFEF',
                  borderColor: scheme === 'dark' ? '#2A2A2A' : '#D1D5DB',
                },
              ]}
            >
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search"
                placeholderTextColor={scheme === 'dark' ? '#6B7280' : '#9CA3AF'}
                style={[styles.searchInput, { color: c.text }]}
                autoFocus
                accessibilityLabel="Search input"
                returnKeyType="search"
              />
            </View>
          )}
          <TouchableOpacity
            onPress={() => {
              if (searchOpen) {
                setSearchOpen(false);
                setSearchText('');
              } else {
                setSearchOpen(true);
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={searchOpen ? 'Close search' : 'Open search'}
            style={styles.searchButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconSymbol name={searchOpen ? 'xmark' : 'magnifyingglass'} size={26} color={c.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: c.text }]}>Loading reports...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredIssues}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.feedContent}
          ListHeaderComponent={() => (
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>Community Reports</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: scheme === 'dark' ? '#111111' : '#FFFFFF', borderColor: scheme === 'dark' ? '#2A2A2A' : '#D1D5DB' }]}> 
              <View style={styles.statusBar}>
                <Text style={[styles.statusText, { 
                  color: item.status === 'resolved' ? '#22C55E' : 
                        item.status === 'in_progress' ? '#F59E0B' : 
                        '#DC2626'
                }]}> 
                  {item.status.replace('_', ' ').toUpperCase()}
                </Text>
                <Text style={[styles.dateText, { color: c.text }]}> 
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.cardMediaWrapper}>
                {item.image_url ? (
                  <Image 
                    source={{ 
                      uri: item.image_url,
                      cache: 'reload',
                      headers: {
                        Accept: 'image/webp,image/jpeg,image/png,image/*;q=0.8'
                      }
                    }}
                    style={styles.cardImage}
                    resizeMode="cover"
                    onLoadStart={() => console.log('Loading image:', item.image_url)}
                    onError={(e) => {
                      console.error('Image loading error:', {
                        reportId: item.id,
                        error: e.nativeEvent.error,
                        url: item.image_url,
                        fileName: item.image_url ? item.image_url.split(/[/\\]/).pop() : null
                      });
                      // Force a re-render with the default image
                      const updatedIssues = issues.map(issue => 
                        issue.id === item.id ? { ...issue, image_url: null } : issue
                      );
                      setIssues(updatedIssues);
                    }}
                    defaultSource={require('../../assets/images/icon.png')}
                  />
                ) : (
                  <View style={[styles.cardImage, { backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' }]}> 
                    <Text style={{ color: '#6b7280' }}>No image available</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.cardDescription, { color: c.text }]}>{item.description}</Text>
              {item.location && (
                <Text style={[styles.locationText, { color: c.text }]}> 
                  📍 {item.location.lat.toFixed(6)}, {item.location.lng.toFixed(6)}
                </Text>
              )}
              {/* Upvote/Downvote Buttons */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18, marginVertical: 8 }}>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6 }}
                  onPress={() => handleVote(item.id, 'up')}
                  disabled={userVotes[item.id] === 'up'}
                >
                  <Text style={{ fontSize: 20, color: userVotes[item.id] === 'up' ? '#22C55E' : '#A1A1AA', fontWeight: 'bold' }}>▲</Text>
                  <Text style={{ fontSize: 16, color: c.text }}>{item.upvotes ?? 0}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6 }}
                  onPress={() => handleVote(item.id, 'down')}
                  disabled={userVotes[item.id] === 'down'}
                >
                  <Text style={{ fontSize: 20, color: userVotes[item.id] === 'down' ? '#DC2626' : '#A1A1AA', fontWeight: 'bold' }}>▼</Text>
                  <Text style={{ fontSize: 16, color: c.text }}>{item.downvotes ?? 0}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
const CARD_RADIUS = 14;
const IMAGE_HEIGHT = Math.round(Dimensions.get('window').width * 0.42);

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 10,
    gap: 10,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  topBarIcon: { width: 38, height: 38, borderRadius: 8 },
  topBarTitle: { fontSize: 28, fontWeight: '800' },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  searchButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 6,
    flex: 1,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 0,
    fontSize: 17,
  },

  feedContent: {
    padding: 12,
    gap: 12,
  },
  card: {
    flex: 1,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    overflow: 'hidden', // ensures image corners are rounded on Android
  },
  cardMediaWrapper: {
    width: '100%',
    height: IMAGE_HEIGHT,
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
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
  locationText: {
    fontSize: 13,
    marginTop: 8,
    paddingHorizontal: 14,
    marginBottom: 12,
    opacity: 0.8,
  },
});

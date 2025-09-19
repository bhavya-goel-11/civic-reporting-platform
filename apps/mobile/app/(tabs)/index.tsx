import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, Dimensions, TextInput } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Issue = Omit<Database['public']['Tables']['reports']['Row'], 'image_url'> & {
  image_url: string | null;
};

export default function HomeScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
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
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        // For each report, get a public image URL if image_url exists
        const processedReports = data.map((report) => {
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

  return (
    <View style={[styles.safeArea, { backgroundColor: scheme === 'dark' ? '#000000' : '#FFF7ED' }]}> 
      {/* Header */}
      {/* Top Header */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Image source={require('../../assets/images/icon.png')} style={styles.topBarIcon} />
          {!searchOpen && (
            <Text style={[styles.topBarTitle, { color: c.text }]}>CivicConnect</Text>
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
          data={issues}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.feedContent}
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
                  onPress={async () => {
                    let newUpvotes = 0;
                    setIssues(prev => prev.map(issue => {
                      if (issue.id === item.id) {
                        newUpvotes = (issue.upvotes ?? 0) + 1;
                        return { ...issue, upvotes: newUpvotes };
                      }
                      return issue;
                    }));
                    // Use the new value for the update
                    const { data, error } = await supabase
                      .from('reports')
                      .update({ upvotes: newUpvotes })
                      .eq('id', item.id)
                      .select();
                    if (error) {
                      console.error('Failed to upvote:', error);
                    } else {
                      console.log('Upvote update response:', data);
                    }
                  }}
                >
                  <Text style={{ fontSize: 20, color: '#22C55E', fontWeight: 'bold' }}>▲</Text>
                  <Text style={{ fontSize: 16, color: c.text }}>{item.upvotes ?? 0}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6 }}
                  onPress={async () => {
                    let newDownvotes = 0;
                    setIssues(prev => prev.map(issue => {
                      if (issue.id === item.id) {
                        newDownvotes = (issue.downvotes ?? 0) + 1;
                        return { ...issue, downvotes: newDownvotes };
                      }
                      return issue;
                    }));
                    const { data, error } = await supabase
                      .from('reports')
                      .update({ downvotes: newDownvotes })
                      .eq('id', item.id)
                      .select();
                    if (error) {
                      console.error('Failed to downvote:', error);
                    } else {
                      console.log('Downvote update response:', data);
                    }
                  }}
                >
                  <Text style={{ fontSize: 20, color: '#DC2626', fontWeight: 'bold' }}>▼</Text>
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
    paddingVertical: 10,
    gap: 10,
    justifyContent: 'space-between',
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
  topBarTitle: { fontSize: 24, fontWeight: '800' },
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

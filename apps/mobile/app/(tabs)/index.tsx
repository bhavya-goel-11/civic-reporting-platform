import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, Dimensions, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

type Issue = {
  id: string;
  image: any; // require() source
  description: string;
  upvotes: number;
  downvotes: number;
};

export default function HomeScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = Colors[scheme];
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const issues: Issue[] = useMemo(
    () => [
      {
        id: '1',
        image: require('../../assets/images/cat1.png'),
        description: 'Large pothole forming near Main & 3rd. Cars swerving to avoid it.',
        upvotes: 124,
        downvotes: 3,
      },
      {
        id: '2',
        image: require('../../assets/images/cat2.png'),
        description: 'Broken streetlight flickers all night in Sector 5 — very dark for pedestrians.',
        upvotes: 56,
        downvotes: 9,
      },
      {
        id: '3',
        image: require('../../assets/images/cat3.png'),
        description: 'Overflowing trash bin by the park entrance. Needs pickup.',
        upvotes: 18,
        downvotes: 1,
      },
      {
        id: '4',
        image: require('../../assets/images/IMG_3259.png'),
        description: 'Fallen tree branch blocking part of the sidewalk on Oak Avenue.',
        upvotes: 2,
        downvotes: 7,
      },
    ],
    []
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: scheme === 'dark' ? '#0B0B0B' : '#FAFAFA' }]}>
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
      <FlatList
        data={issues}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.feedContent}
        renderItem={({ item }) => {
          const score = item.upvotes - item.downvotes;
          const scoreColor = score > 0 ? c.tint : score < 0 ? (scheme === 'dark' ? '#F87171' : '#DC2626') : (scheme === 'dark' ? '#9BA1A6' : '#6B7280');
          return (
          <View style={styles.feedRow}>
            {/* Vote Column (static UI) */}
            <View style={[styles.voteColumn, { backgroundColor: scheme === 'dark' ? '#141414' : '#FFFFFF', borderColor: scheme === 'dark' ? '#2A2A2A' : '#D1D5DB' }]}>
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

            {/* Issue Card */}
            <View style={[styles.card, { backgroundColor: scheme === 'dark' ? '#111111' : '#FFFFFF', borderColor: scheme === 'dark' ? '#2A2A2A' : '#D1D5DB' }]}> 
              <View style={styles.cardMediaWrapper}>
                <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
              </View>
              <Text style={[styles.cardDescription, { color: c.text }]}>{item.description}</Text>
            </View>
          </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const CARD_RADIUS = 14;
const IMAGE_HEIGHT = Math.round(Dimensions.get('window').width * 0.42);

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
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
    paddingBottom: 24,
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
});

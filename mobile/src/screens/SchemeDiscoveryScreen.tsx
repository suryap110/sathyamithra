import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, spacing } from '../theme';
import { apiClient } from '../services/apiClient';
import { offlineCache } from '../services/offlineCache';
import { syncEngine } from '../services/syncEngine';

export function SchemeDiscoveryScreen({ navigation }: any) {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    loadSchemes();
    loadSaved();
  }, []);

  const loadSaved = async () => {
    const ids = await offlineCache.getSavedSchemeIds();
    setSavedIds(ids);
  };

  const loadSchemes = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/schemes');
      const data = response.data.schemes || response.data || [];
      setSchemes(data);
      await offlineCache.saveSchemes(data);
      setIsOffline(false);
    } catch (e) {
      // Fallback to offline cache
      const cached = await offlineCache.getSchemes();
      if (cached) {
        setSchemes(cached);
        setIsOffline(true);
      } else {
        // Fallback default mockup schemes if cache empty
        const fallback = [
          { id: '1', title: 'PM-Kisan Samman Nidhi', category: 'Agriculture', state: 'Central', benefit_amount: '₹6,000 / year' },
          { id: '2', title: 'Ayushman Bharat PM-JAY', category: 'Healthcare', state: 'Central', benefit_amount: '₹5,00,000 / year' },
          { id: '3', title: 'Pudhumai Penn Scheme', category: 'Education', state: 'Tamil Nadu', benefit_amount: '₹1,000 / month' },
          { id: '4', title: 'Moovalur Ramamirtham Ammiyar Aid', category: 'Social Welfare', state: 'Tamil Nadu', benefit_amount: '₹50,000 one-time' },
        ];
        setSchemes(fallback);
        setIsOffline(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (schemeId: string) => {
    const updated = await offlineCache.toggleSavedScheme(schemeId);
    setSavedIds(updated);

    const isNowSaved = updated.includes(schemeId);
    await syncEngine.enqueueAction(
      isNowSaved ? 'SAVE_SCHEME' : 'UNSAVE_SCHEME',
      { scheme_id: schemeId }
    );
  };

  const filteredSchemes = schemes.filter(s =>
    (s.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>⚡ Offline Mode — Showing cached schemes</Text>
        </View>
      )}

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search schemes by keyword or category..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading government schemes...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredSchemes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isSaved = savedIds.includes(item.id);
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('SchemeDetail', { scheme: item })}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.state || 'Central'}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleToggleSave(item.id)}>
                    <Text style={styles.bookmarkIcon}>{isSaved ? '❤️' : '🤍'}</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.category}>{item.category}</Text>
                
                {item.benefit_amount && (
                  <View style={styles.benefitContainer}>
                    <Text style={styles.benefitLabel}>Benefit: </Text>
                    <Text style={styles.benefitValue}>{item.benefit_amount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  offlineBanner: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  offlineText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '700',
  },
  searchContainer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.muted,
    fontSize: 13,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  badge: {
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  bookmarkIcon: {
    fontSize: 18,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  benefitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  benefitLabel: {
    fontSize: 12,
    color: '#166534',
  },
  benefitValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
  },
});

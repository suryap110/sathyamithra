import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../theme';
import { offlineCache } from '../services/offlineCache';

export function SavedSchemesScreen({ navigation }: any) {
  const [savedSchemes, setSavedSchemes] = useState<any[]>([]);

  useEffect(() => {
    loadSaved();
  }, []);

  const loadSaved = async () => {
    const savedIds = await offlineCache.getSavedSchemeIds();
    const allSchemes = (await offlineCache.getSchemes()) || [
      { id: '1', title: 'PM-Kisan Samman Nidhi', category: 'Agriculture', state: 'Central', benefit_amount: '₹6,000 / year' },
      { id: '2', title: 'Ayushman Bharat PM-JAY', category: 'Healthcare', state: 'Central', benefit_amount: '₹5,00,000 / year' }
    ];
    
    // Filter or default
    const filtered = allSchemes.filter(s => savedIds.includes(s.id));
    setSavedSchemes(filtered.length > 0 ? filtered : allSchemes.slice(0, 2));
  };

  const handleRemove = async (id: string) => {
    await offlineCache.toggleSavedScheme(id);
    loadSaved();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Schemes</Text>
        <Text style={styles.subtitle}>Bookmarks synced locally for offline viewing</Text>
      </View>

      {savedSchemes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔖</Text>
          <Text style={styles.emptyTitle}>No Saved Schemes Yet</Text>
          <Text style={styles.emptySub}>Browse government schemes and tap the heart icon to save them for offline access.</Text>
        </View>
      ) : (
        <FlatList
          data={savedSchemes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <TouchableOpacity onPress={() => handleRemove(item.id)}>
                  <Text style={styles.removeIcon}>❌</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.category}>{item.category} • {item.state || 'Central'}</Text>
              <Text style={styles.benefit}>{item.benefit_amount || 'Financial Assistance'}</Text>
              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => navigation.navigate('SchemeDetail', { scheme: item })}
              >
                <Text style={styles.detailButtonText}>View Scheme Details →</Text>
              </TouchableOpacity>
            </View>
          )}
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
  header: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  emptySub: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
  },
  list: {
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
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  removeIcon: {
    fontSize: 12,
  },
  category: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },
  benefit: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
    marginTop: spacing.xs,
  },
  detailButton: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
  },
  detailButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
  },
});

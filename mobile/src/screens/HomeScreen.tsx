import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../theme';

export function HomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero Header */}
        <View style={styles.heroCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>SATHYAMITHRA CIVIC AI</Text>
          </View>
          <Text style={styles.heroTitle}>Schemes meant for you, made simple.</Text>
          <Text style={styles.heroSubtitle}>
            Discover verified central & state government benefits matched to your profile.
          </Text>

          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => navigation.navigate('DiscoverTab')}
          >
            <Text style={styles.ctaText}>Explore Schemes For Me →</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Hub Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Civic Feature Hub</Text>
          <View style={styles.grid}>
            <TouchableOpacity style={styles.hubCard} onPress={() => navigation.navigate('AIAssistant')}>
              <Text style={styles.hubEmoji}>🤖</Text>
              <Text style={styles.hubTitle}>AI Assistant</Text>
              <Text style={styles.hubSub}>Voice & RAG Q&A</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.hubCard} onPress={() => navigation.navigate('DocumentVault')}>
              <Text style={styles.hubEmoji}>📁</Text>
              <Text style={styles.hubTitle}>Document Vault</Text>
              <Text style={styles.hubSub}>Readiness 80%</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.hubCard} onPress={() => navigation.navigate('Family')}>
              <Text style={styles.hubEmoji}>👨‍👩‍👧‍👦</Text>
              <Text style={styles.hubTitle}>Family Mode</Text>
              <Text style={styles.hubSub}>4 Members</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.hubCard} onPress={() => navigation.navigate('Settings')}>
              <Text style={styles.hubEmoji}>⚙️</Text>
              <Text style={styles.hubTitle}>Settings & Elder</Text>
              <Text style={styles.hubSub}>Font & Sync</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Popular Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Categories</Text>
          <View style={styles.grid}>
            <TouchableOpacity style={styles.categoryCard} onPress={() => navigation.navigate('DiscoverTab')}>
              <Text style={styles.categoryEmoji}>🎓</Text>
              <Text style={styles.categoryTitle}>Education</Text>
              <Text style={styles.categorySub}>Scholarships & Aid</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.categoryCard} onPress={() => navigation.navigate('DiscoverTab')}>
              <Text style={styles.categoryEmoji}>🚜</Text>
              <Text style={styles.categoryTitle}>Agriculture</Text>
              <Text style={styles.categorySub}>Farmer Income</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.categoryCard} onPress={() => navigation.navigate('DiscoverTab')}>
              <Text style={styles.categoryEmoji}>🏥</Text>
              <Text style={styles.categoryTitle}>Healthcare</Text>
              <Text style={styles.categorySub}>PM-JAY Cover</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.categoryCard} onPress={() => navigation.navigate('DiscoverTab')}>
              <Text style={styles.categoryEmoji}>👵</Text>
              <Text style={styles.categoryTitle}>Seniors</Text>
              <Text style={styles.categorySub}>Pension Schemes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Floating AI Assistant FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AIAssistant')}
      >
        <Text style={styles.fabIcon}>💬 Ask Sathyamithra</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 80,
  },
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  badgeText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  ctaButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  ctaText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  hubCard: {
    width: '47%',
    backgroundColor: '#F8FAFC',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hubEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  hubTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  hubSub: {
    fontSize: 11,
    color: colors.secondary,
    marginTop: 2,
    fontWeight: '600',
  },
  categoryCard: {
    width: '47%',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  categorySub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabIcon: {
    color: colors.accent,
    fontWeight: '800',
    fontSize: 14,
  },
});

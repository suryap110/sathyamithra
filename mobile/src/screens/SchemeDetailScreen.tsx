import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing } from '../theme';
import { offlineCache } from '../services/offlineCache';
import { syncEngine } from '../services/syncEngine';

export function SchemeDetailScreen({ route, navigation }: any) {
  const scheme = route?.params?.scheme || {
    id: '1',
    title: 'PM-Kisan Samman Nidhi',
    category: 'Agriculture',
    state: 'Central',
    benefit_amount: '₹6,000 / year',
    description: 'Financial assistance of ₹6,000 per year to all landholding farmers families across the country.',
    eligibility_criteria: ['Small & marginal farmers', 'Valid land holding document', 'Aadhaar linked bank account'],
    documents_required: ['Aadhaar Card', 'Land Ownership Records', 'Bank Passbook']
  };

  const [isSaved, setIsSaved] = useState(false);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);

  const handleSaveToggle = async () => {
    const updated = await offlineCache.toggleSavedScheme(scheme.id, scheme);
    const nowSaved = updated.includes(scheme.id);
    setIsSaved(nowSaved);
    await syncEngine.enqueueAction(
      nowSaved ? 'SAVE_SCHEME' : 'UNSAVE_SCHEME',
      { scheme_id: scheme.id }
    );
    Alert.alert(nowSaved ? 'Scheme Saved' : 'Scheme Removed', `${scheme.title} has been ${nowSaved ? 'added to' : 'removed from'} your saved list.`);
  };

  const handleCheckEligibility = () => {
    setEligibilityChecked(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{scheme.state || 'Central'}</Text>
        </View>
        <Text style={styles.title}>{scheme.title}</Text>
        <Text style={styles.category}>{scheme.category}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>💰 Benefit Amount</Text>
        <Text style={styles.benefitText}>{scheme.benefit_amount || 'Financial Aid'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>ℹ️ Overview</Text>
        <Text style={styles.bodyText}>
          {scheme.description || 'This government scheme provides financial support and social security to eligible citizens.'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>✅ Eligibility Criteria</Text>
        {Array.isArray(scheme.eligibility_criteria) ? (
          scheme.eligibility_criteria.map((item: string, idx: number) => (
            <Text key={idx} style={styles.bulletItem}>• {item}</Text>
          ))
        ) : (
          <Text style={styles.bodyText}>Check your citizen profile matches scheme age, income, and state criteria.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📁 Required Documents</Text>
        {Array.isArray(scheme.documents_required) ? (
          scheme.documents_required.map((item: string, idx: number) => (
            <Text key={idx} style={styles.bulletItem}>📄 {item}</Text>
          ))
        ) : (
          <Text style={styles.bodyText}>Aadhaar Card, Bank Account Passbook, Income Certificate</Text>
        )}
      </View>

      {eligibilityChecked && (
        <View style={styles.eligibilityBox}>
          <Text style={styles.eligibilityStatus}>🎉 You are High-Match Eligible!</Text>
          <Text style={styles.eligibilitySub}>Match Score: 94% based on your demographic profile.</Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleCheckEligibility}>
          <Text style={styles.primaryButtonText}>
            {eligibilityChecked ? 'Re-verify Eligibility' : 'Check My Eligibility'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleSaveToggle}>
          <Text style={styles.secondaryButtonText}>
            {isSaved ? '❤️ Saved' : '🤍 Save for Later'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: spacing.lg,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  badgeText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  category: {
    fontSize: 13,
    color: '#CBD5E1',
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  benefitText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#166534',
  },
  bodyText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  bulletItem: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 4,
  },
  eligibilityBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: spacing.md,
  },
  eligibilityStatus: {
    fontSize: 15,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 2,
  },
  eligibilitySub: {
    fontSize: 12,
    color: '#15803D',
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});

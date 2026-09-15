import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../theme';

export function ApplicationTrackerScreen({ navigation }: any) {
  const [applications] = useState([
    {
      id: 'APP-2026-8819',
      scheme: 'PM-Kisan Samman Nidhi',
      applied_on: '2026-08-15',
      status: 'UNDER_VERIFICATION',
      status_label: 'Under Verification',
      authority: 'District Agriculture Office',
      readiness: '100% Ready'
    },
    {
      id: 'APP-2026-4421',
      scheme: 'Pudhumai Penn Higher Education Aid',
      applied_on: '2026-08-01',
      status: 'APPROVED',
      status_label: 'Approved & Disbursed',
      authority: 'Department of Higher Education TN',
      readiness: 'Completed'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return { bg: '#DCFCE7', text: '#15803D' };
      case 'UNDER_VERIFICATION': return { bg: '#FEF3C7', text: '#B45309' };
      case 'REJECTED': return { bg: '#FEE2E2', text: '#B91C1C' };
      default: return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Application Tracker</Text>
        <Text style={styles.subtitle}>Real-time status updates & document verification stage</Text>
      </View>

      <FlatList
        data={applications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const badgeStyle = getStatusColor(item.status);
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.appId}>{item.id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: badgeStyle.bg }]}>
                  <Text style={[styles.statusText, { color: badgeStyle.text }]}>{item.status_label}</Text>
                </View>
              </View>

              <Text style={styles.schemeTitle}>{item.scheme}</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Authority:</Text>
                <Text style={styles.infoValue}>{item.authority}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Applied On:</Text>
                <Text style={styles.infoValue}>{item.applied_on}</Text>
              </View>

              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: item.status === 'APPROVED' ? '100%' : '65%' }]} />
              </View>
            </View>
          );
        }}
      />
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
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  appId: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  schemeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.muted,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 3,
  },
});

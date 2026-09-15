import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../theme';

export function ProfileScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>S</Text>
        </View>
        <Text style={styles.name}>Citizen Profile</Text>
        <Text style={styles.email}>citizen@sathyamithra.org</Text>
        <View style={styles.completionBadge}>
          <Text style={styles.completionText}>Profile 82% Complete</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Demographic Information</Text>
        
        <View style={styles.item}>
          <Text style={styles.itemLabel}>State</Text>
          <Text style={styles.itemValue}>Tamil Nadu</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.itemLabel}>Occupation</Text>
          <Text style={styles.itemValue}>Student</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.itemLabel}>Annual Household Income</Text>
          <Text style={styles.itemValue}>₹ 1,80,000</Text>
        </View>

        <View style={styles.item}>
          <Text style={styles.itemLabel}>Education Level</Text>
          <Text style={styles.itemValue}>Undergraduate</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
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
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    color: colors.accent,
    fontSize: 24,
    fontWeight: '800',
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  email: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  completionBadge: {
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: spacing.md,
  },
  completionText: {
    color: colors.secondary,
    fontSize: 11,
    fontWeight: '700',
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.md,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemLabel: {
    fontSize: 12,
    color: colors.muted,
  },
  itemValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    paddingVertical: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: colors.error,
    fontWeight: '700',
    fontSize: 14,
  },
});

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../theme';

export function OnboardingScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logoBadge}>SATHYAMITHRA 🇮🇳</Text>
        <Text style={styles.headline}>Every Government Benefit You Deserve, Honest & Simple.</Text>
        <Text style={styles.subtitle}>
          Multilingual AI recommendations, offline document vault, family eligibility tracking, and instant application updates.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('MainTabs')}>
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.secondaryButtonText}>I already have an account → Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  content: {
    marginTop: 60,
  },
  logoBadge: {
    color: colors.accent,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 36,
    marginBottom: spacing.md,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 16,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  secondaryButtonText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
  },
});

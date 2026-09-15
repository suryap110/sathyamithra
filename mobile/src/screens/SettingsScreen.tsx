import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing } from '../theme';
import { accessibilityService } from '../services/accessibilityService';
import { syncEngine } from '../services/syncEngine';
import { offlineCache } from '../services/offlineCache';
import { apiClient } from '../services/apiClient';

export function SettingsScreen({ navigation }: any) {
  const [isElderMode, setIsElderMode] = useState(false);
  const [fontScale, setFontScale] = useState<'small' | 'default' | 'large' | 'xlarge'>('default');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await accessibilityService.getSettings();
    setIsElderMode(settings.isElderMode);
    setFontScale(settings.fontScale);
  };

  const handleToggleElderMode = async (value: boolean) => {
    setIsElderMode(value);
    await accessibilityService.setElderMode(value);
  };

  const handleFontScale = async (scale: 'small' | 'default' | 'large' | 'xlarge') => {
    setFontScale(scale);
    await accessibilityService.setFontScale(scale);
  };

  const handleTriggerSync = async () => {
    setSyncing(true);
    const result = await syncEngine.processSync();
    setSyncing(false);
    Alert.alert('Sync Result', `Synced ${result.synced} offline actions. ${result.failed} items pending.`);
  };

  const handleRegisterPushToken = async () => {
    try {
      await apiClient.post('/devices/register', {
        device_token: `expo-push-token-test-${Date.now()}`,
        device_type: 'android'
      });
      Alert.alert('Push Registration', 'Device registered for instant benefit updates!');
    } catch (e) {
      Alert.alert('Push Error', 'Could not register push token with server.');
    }
  };

  const handleClearCache = async () => {
    await offlineCache.clearUserCache();
    Alert.alert('Cache Cleared', 'Local scheme and profile cache has been cleared.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Accessibility / Elder Mode */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Elder Mode & Accessibility</Text>

        <View style={styles.row}>
          <View style={styles.rowLabelContainer}>
            <Text style={styles.rowTitle}>Elder Mode 👵</Text>
            <Text style={styles.rowSubtitle}>Extra large text, high contrast, simplified interface</Text>
          </View>
          <Switch
            value={isElderMode}
            onValueChange={handleToggleElderMode}
            trackColor={{ false: colors.border, true: colors.secondary }}
          />
        </View>

        <Text style={[styles.rowTitle, { marginTop: spacing.md }]}>Font Size Multiplier</Text>
        <View style={styles.fontScaleGrid}>
          {(['small', 'default', 'large', 'xlarge'] as const).map(scale => (
            <TouchableOpacity
              key={scale}
              style={[styles.scaleOption, fontScale === scale && styles.scaleActive]}
              onPress={() => handleFontScale(scale)}
            >
              <Text style={[styles.scaleText, fontScale === scale && styles.scaleActiveText]}>
                {scale.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sync & Offline Data */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sync & Offline Engine</Text>

        <TouchableOpacity style={styles.actionRow} onPress={handleTriggerSync} disabled={syncing}>
          <Text style={styles.actionText}>🔄 Trigger Manual Offline Sync</Text>
          <Text style={styles.chevron}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionRow} onPress={handleRegisterPushToken}>
          <Text style={styles.actionText}>🔔 Register Push Notification Token</Text>
          <Text style={styles.chevron}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionRow} onPress={handleClearCache}>
          <Text style={[styles.actionText, { color: colors.error }]}>🗑️ Clear Local Cache</Text>
          <Text style={styles.chevron}>→</Text>
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
    gap: spacing.lg,
  },
  section: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  rowLabelContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  rowSubtitle: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  fontScaleGrid: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  scaleOption: {
    flex: 1,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  scaleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  scaleText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  scaleActiveText: {
    color: '#FFFFFF',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  chevron: {
    fontSize: 14,
    color: colors.muted,
  },
});

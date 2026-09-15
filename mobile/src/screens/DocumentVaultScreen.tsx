import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing } from '../theme';

export function DocumentVaultScreen({ navigation }: any) {
  const [documents, setDocuments] = useState([
    { id: '1', name: 'Aadhaar Card', category: 'Identity', verified: true, date: '2026-01-10' },
    { id: '2', name: 'PAN Card', category: 'Identity', verified: true, date: '2026-02-14' },
    { id: '3', name: 'Income Certificate', category: 'Income', verified: true, date: '2026-05-20' },
    { id: '4', name: 'Community Certificate', category: 'Social Category', verified: false, date: 'Pending Upload' },
    { id: '5', name: 'Bank Passbook', category: 'Financial', verified: true, date: '2026-03-11' },
  ]);

  const verifiedCount = documents.filter(d => d.verified).length;
  const readinessPercent = Math.round((verifiedCount / documents.length) * 100);

  const handleUpload = (docName: string) => {
    Alert.alert('Upload Document', `Select file or camera image for ${docName}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.readinessCard}>
        <Text style={styles.readinessLabel}>Document Readiness Score</Text>
        <Text style={styles.readinessScore}>{readinessPercent}%</Text>
        <Text style={styles.readinessSub}>{verifiedCount} of {documents.length} essential documents verified in local vault</Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${readinessPercent}%` }]} />
        </View>
      </View>

      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.docCard}>
            <View style={styles.docInfo}>
              <Text style={styles.docIcon}>{item.verified ? '📄' : '⚠️'}</Text>
              <View>
                <Text style={styles.docName}>{item.name}</Text>
                <Text style={styles.docSub}>{item.category} • {item.date}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.docAction, item.verified ? styles.verifiedBtn : styles.uploadBtn]}
              onPress={() => handleUpload(item.name)}
            >
              <Text style={item.verified ? styles.verifiedText : styles.uploadText}>
                {item.verified ? 'Verified ✓' : 'Upload'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  readinessCard: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    margin: spacing.md,
    borderRadius: 16,
  },
  readinessLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  readinessScore: {
    color: colors.accent,
    fontSize: 32,
    fontWeight: '800',
    marginVertical: 4,
  },
  readinessSub: {
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: spacing.md,
  },
  progressBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  list: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  docCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  docInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  docIcon: {
    fontSize: 24,
  },
  docName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  docSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  docAction: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 8,
  },
  verifiedBtn: {
    backgroundColor: '#DCFCE7',
  },
  verifiedText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '700',
  },
  uploadBtn: {
    backgroundColor: colors.primary,
  },
  uploadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

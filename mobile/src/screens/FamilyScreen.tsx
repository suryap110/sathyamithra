import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing } from '../theme';

export function FamilyScreen({ navigation }: any) {
  const [members, setMembers] = useState([
    { id: '1', name: 'Self (Citizen)', relation: 'Primary Account', age: 34, state: 'Active' },
    { id: '2', name: 'Lakshmi Devi', relation: 'Spouse', age: 31, state: 'Profile Complete' },
    { id: '3', name: 'Ramesh Kumar', relation: 'Father (Senior)', age: 68, state: 'Eligible for Senior Pension' },
    { id: '4', name: 'Ananya Kumar', relation: 'Daughter (Student)', age: 14, state: 'Eligible for Education Aid' },
  ]);

  const handleAddMember = () => {
    Alert.alert('Add Family Member', 'Enter family member details to check combined household eligibility.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Family Mode</Text>
        <Text style={styles.subtitle}>Manage household profiles & discover family member benefits</Text>
      </View>

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name[0]}</Text>
              </View>
              <View>
                <Text style={styles.memberName}>{item.name}</Text>
                <Text style={styles.relation}>{item.relation} • Age {item.age}</Text>
                <Text style={styles.status}>{item.state}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.switchButton}>
              <Text style={styles.switchText}>Switch</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={styles.addBtn} onPress={handleAddMember}>
        <Text style={styles.addBtnText}>+ Add Family Member</Text>
      </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 18,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  relation: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  status: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.secondary,
    marginTop: 2,
  },
  switchButton: {
    backgroundColor: 'rgba(15, 23, 42, 0.06)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 8,
  },
  switchText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  addBtn: {
    backgroundColor: colors.primary,
    margin: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

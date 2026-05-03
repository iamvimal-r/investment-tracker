import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { LinearGradient } from '../../constants/LinearGradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { authService, User } from '../../services/auth.service';

interface MenuItemProps {
  icon: any;
  label: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
  iconColor?: string;
}

function MenuItem({ icon, label, subtitle, onPress, danger, iconColor }: MenuItemProps) {
  const color = danger ? Colors.danger : (iconColor || Colors.primary);
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuLabel, danger && { color: Colors.danger }]}>{label}</Text>
        {subtitle && <Text style={styles.menuSub}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    authService.getUser().then(setUser);
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const initial = user?.username?.[0]?.toUpperCase() || 'U';

  return (
    <LinearGradient colors={Colors.gradientBackground} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Avatar Card */}
        <View style={styles.avatarCard}>
          <LinearGradient colors={Colors.gradientPrimary} style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </LinearGradient>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.username || 'Investor'}</Text>
            <Text style={styles.userEmail}>{user?.email || '—'}</Text>
          </View>
          <View style={[styles.activeBadge]}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>Active</Text>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="person-outline"
              label="Edit Profile"
              subtitle="Update name and email"
              onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available soon.')}
              iconColor={Colors.primary}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="lock-closed-outline"
              label="Change Password"
              subtitle="Update your password"
              onPress={() => Alert.alert('Coming Soon', 'Password change will be available soon.')}
              iconColor={Colors.accent}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="finger-print-outline"
              label="Biometric Auth"
              subtitle="Fingerprint / Face ID"
              onPress={() => Alert.alert('Coming Soon', 'Biometric login will be available soon.')}
              iconColor={Colors.warning}
            />
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="notifications-outline"
              label="Price Alerts"
              subtitle="Set price change notifications"
              onPress={() => Alert.alert('Coming Soon', 'Alerts will be available soon.')}
              iconColor={Colors.primary}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="cash-outline"
              label="Currency"
              subtitle="INR (Indian Rupee)"
              onPress={() => Alert.alert('Coming Soon', 'Multi-currency support coming soon.')}
              iconColor={Colors.gold}
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="information-circle-outline"
              label="App Version"
              subtitle="WealthLens v1.0.0"
              onPress={() => {}}
              iconColor={Colors.textMuted}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="shield-checkmark-outline"
              label="Privacy Policy"
              onPress={() => Alert.alert('Privacy', 'Your data is stored securely and never sold.')}
              iconColor={Colors.accent}
            />
          </View>
        </View>

        {/* Logout */}
        <View style={[styles.section, { marginBottom: 40 }]}>
          <View style={styles.menuCard}>
            <MenuItem
              icon="log-out-outline"
              label="Sign Out"
              onPress={handleLogout}
              danger
            />
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary },
  avatarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorderLight,
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 24, fontWeight: '800', color: Colors.white },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  userEmail: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.success + '22',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  activeText: { fontSize: 11, color: Colors.success, fontWeight: '700' },
  section: { marginHorizontal: 20, marginBottom: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  menuCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorderLight,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  menuSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  menuDivider: { height: 1, backgroundColor: Colors.cardBorderLight, marginLeft: 66 },
});

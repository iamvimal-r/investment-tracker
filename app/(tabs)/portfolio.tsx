import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, Alert, ActivityIndicator, SectionList,
} from 'react-native';
import { LinearGradient } from '../../constants/LinearGradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { investmentService, Investment, AssetType } from '../../services/investment.service';
import { InvestmentItem } from '../../components/InvestmentItem';
import { AddInvestmentModal } from '../../components/AddInvestmentModal';

const ASSET_LABELS: Record<AssetType, string> = {
  stock: '📈 Stocks',
  crypto: '₿ Crypto',
  mutual_fund: '🏦 Mutual Funds',
  gold: '🥇 Gold',
  fd: '🏛 Fixed Deposits',
};

type Section = { title: string; data: Investment[] };

export default function PortfolioScreen() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<AssetType | 'all'>('all');

  const loadData = async () => {
    try {
      const data = await investmentService.getAll();
      setInvestments(data);
    } catch (err) {
      console.error('Portfolio load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); loadData(); }, []));
  const onRefresh = () => { setRefreshing(true); loadData(); };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Remove Investment',
      `Are you sure you want to remove "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await investmentService.remove(id);
              setInvestments(prev => prev.filter(i => i.id !== id));
            } catch {
              Alert.alert('Error', 'Failed to remove investment');
            }
          },
        },
      ]
    );
  };

  const filtered = filter === 'all'
    ? investments
    : investments.filter(i => i.asset_type === filter);

  // Group by asset type
  const sections: Section[] = Object.entries(
    filtered.reduce((acc, inv) => {
      if (!acc[inv.asset_type]) acc[inv.asset_type] = [];
      acc[inv.asset_type].push(inv);
      return acc;
    }, {} as Record<string, Investment[]>)
  ).map(([type, data]) => ({
    title: ASSET_LABELS[type as AssetType] || type,
    data,
  }));

  const totalInvested = investments.reduce((s, i) => s + (i.invested_value ?? 0), 0);
  const currentValue = investments.reduce((s, i) => s + (i.current_value ?? 0), 0);
  const totalPnl = currentValue - totalInvested;

  if (loading) {
    return (
      <LinearGradient colors={Colors.gradientBackground} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading investments...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={Colors.gradientBackground} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Portfolio</Text>
        <Text style={styles.headerSub}>{investments.length} investments</Text>
      </View>

      {/* Quick Stats */}
      {investments.length > 0 && (
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Invested</Text>
            <Text style={styles.statValue}>₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Current</Text>
            <Text style={styles.statValue}>₹{currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>P&L</Text>
            <Text style={[styles.statValue, { color: totalPnl >= 0 ? Colors.success : Colors.danger }]}>
              {totalPnl >= 0 ? '+' : ''}₹{Math.abs(totalPnl).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </Text>
          </View>
        </View>
      )}

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {(['all', 'stock', 'crypto', 'mutual_fund', 'gold', 'fd'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'All' : ASSET_LABELS[f].split(' ')[1]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Investment List */}
      {investments.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="wallet-outline" size={60} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No Investments Yet</Text>
          <Text style={styles.emptySub}>Start building your portfolio by adding your first investment.</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowModal(true)}>
            <LinearGradient colors={Colors.gradientPrimary} style={styles.emptyBtnGradient}>
              <Ionicons name="add" size={18} color={Colors.white} />
              <Text style={styles.emptyBtnText}>Add Investment</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <InvestmentItem
              investment={item}
              onDelete={() => handleDelete(item.id, item.name)}
            />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)} activeOpacity={0.85}>
        <LinearGradient colors={Colors.gradientPrimary} style={styles.fabGradient}>
          <Ionicons name="add" size={28} color={Colors.white} />
        </LinearGradient>
      </TouchableOpacity>

      <AddInvestmentModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onAdded={loadData}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { color: Colors.textSecondary, fontSize: 14 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary },
  headerSub: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginHorizontal: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorderLight,
    marginBottom: 14,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: Colors.cardBorderLight },
  filterRow: { flexGrow: 0, marginBottom: 6 },
  filterContent: { paddingHorizontal: 20, gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorderLight,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  filterTextActive: { color: Colors.white },
  listContent: { paddingHorizontal: 20, paddingBottom: 120 },
  sectionHeader: { marginTop: 14, marginBottom: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textSecondary },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
  emptyBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  emptyBtnGradient: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
    alignItems: 'center',
  },
  emptyBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  fab: {
    position: 'absolute',
    bottom: 84,
    right: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  fabGradient: { width: 60, height: 60, justifyContent: 'center', alignItems: 'center' },
});

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from '../../constants/LinearGradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { investmentService, PortfolioSummary } from '../../services/investment.service';
import { authService } from '../../services/auth.service';
import { PnLCard } from '../../components/PnLCard';
import { AssetAllocationPie } from '../../components/AssetAllocationPie';
import { AddInvestmentModal } from '../../components/AddInvestmentModal';

export default function DashboardScreen() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [username, setUsername] = useState('Investor');
  const [showModal, setShowModal] = useState(false);

  const loadData = async () => {
    try {
      const [data, user] = await Promise.all([
        investmentService.getPortfolioSummary(),
        authService.getUser(),
      ]);
      setSummary(data);
      if (user?.username) setUsername(user.username);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); loadData(); }, []));

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <LinearGradient colors={Colors.gradientBackground} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your portfolio...</Text>
      </LinearGradient>
    );
  }

  const isOverallPositive = (summary?.total_pnl ?? 0) >= 0;
  const isDailyPositive = (summary?.daily_gain ?? 0) >= 0;

  return (
    <LinearGradient colors={Colors.gradientBackground} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.username}>{username} 👋</Text>
          </View>
          <TouchableOpacity style={styles.bellBtn}>
            <Ionicons name="notifications-outline" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Hero P&L Card */}
        {summary ? (
          <View style={styles.section}>
            <PnLCard
              label="Total Portfolio Value"
              value={summary.current_value}
              size="large"
              gradient={isOverallPositive ? Colors.gradientPrimary : Colors.gradientDanger}
              subtitle={`${summary.investment_count} investments tracked`}
            />

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <PnLCard
                label="Total P&L"
                value={summary.total_pnl}
                percent={summary.total_pnl_percent}
                isPositive={isOverallPositive}
              />
              <View style={{ width: 10 }} />
              <PnLCard
                label="Today's Gain"
                value={summary.daily_gain}
                percent={summary.daily_gain_percent}
                isPositive={isDailyPositive}
              />
            </View>

            {/* Invested vs Current */}
            <View style={styles.statsRow}>
              <PnLCard label="Invested" value={summary.total_invested} />
              <View style={{ width: 10 }} />
              <PnLCard label="Current Value" value={summary.current_value} />
            </View>
          </View>
        ) : (
          <View style={styles.emptyHero}>
            <Ionicons name="wallet-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyHeroText}>No investments yet</Text>
            <Text style={styles.emptyHeroSub}>Tap + to add your first investment</Text>
          </View>
        )}

        {/* Asset Allocation */}
        {summary && summary.asset_allocation.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="pie-chart" size={18} color={Colors.primary} />
              <Text style={styles.cardTitle}>Asset Allocation</Text>
            </View>
            <AssetAllocationPie
              allocation={summary.asset_allocation}
              totalValue={summary.current_value}
            />
          </View>
        )}

        {/* Top Performers */}
        {summary && summary.top_performers.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="trophy" size={18} color={Colors.gold} />
              <Text style={styles.cardTitle}>Top Performers</Text>
            </View>
            {summary.top_performers.map((perf, i) => {
              const isPos = perf.pnl_percent >= 0;
              const color = isPos ? Colors.success : Colors.danger;
              return (
                <View key={i} style={styles.performerRow}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{i + 1}</Text>
                  </View>
                  <View style={styles.performerInfo}>
                    <Text style={styles.performerName}>{perf.name}</Text>
                    <Text style={styles.performerType}>{perf.asset_type}</Text>
                  </View>
                  <View>
                    <Text style={[styles.performerPnl, { color }]}>
                      {isPos ? '+' : ''}{perf.pnl_percent.toFixed(2)}%
                    </Text>
                    <Text style={[styles.performerAbs, { color }]}>
                      {isPos ? '+' : ''}₹{Math.abs(perf.pnl).toFixed(0)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowModal(true)}
        activeOpacity={0.85}
      >
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 8,
  },
  greeting: { fontSize: 14, color: Colors.textSecondary, marginBottom: 2 },
  username: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorderLight,
  },
  section: { paddingHorizontal: 20, paddingTop: 16 },
  statsRow: { flexDirection: 'row', marginBottom: 10 },
  emptyHero: {
    margin: 20,
    padding: 40,
    backgroundColor: Colors.card,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorderLight,
    gap: 10,
  },
  emptyHeroText: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  emptyHeroSub: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorderLight,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  performerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorderLight,
    gap: 12,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(108,99,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  performerInfo: { flex: 1 },
  performerName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  performerType: { fontSize: 11, color: Colors.textMuted, textTransform: 'capitalize' },
  performerPnl: { fontSize: 14, fontWeight: '700', textAlign: 'right' },
  performerAbs: { fontSize: 11, textAlign: 'right' },
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

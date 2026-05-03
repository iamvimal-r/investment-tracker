import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, ActivityIndicator, Dimensions,
} from 'react-native';
import { LinearGradient } from '../../constants/LinearGradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { investmentService, PortfolioSummary, Investment } from '../../services/investment.service';
import { AssetAllocationPie } from '../../components/AssetAllocationPie';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function InsightsScreen() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [sum, invs] = await Promise.all([
        investmentService.getPortfolioSummary(),
        investmentService.getAll(),
      ]);
      setSummary(sum);
      setInvestments(invs);
    } catch (err) {
      console.error('Insights load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); loadData(); }, []));
  const onRefresh = () => { setRefreshing(true); loadData(); };

  if (loading) {
    return (
      <LinearGradient colors={Colors.gradientBackground} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Analyzing portfolio...</Text>
      </LinearGradient>
    );
  }

  const sortedByPnl = [...investments].sort((a, b) => (b.pnl_percent ?? 0) - (a.pnl_percent ?? 0));
  const best = sortedByPnl.slice(0, 3);
  const worst = sortedByPnl.slice(-3).reverse().filter(i => (i.pnl_percent ?? 0) < 0);

  // Max value for bar scaling
  const maxVal = Math.max(...investments.map(i => i.current_value ?? 0), 1);

  return (
    <LinearGradient colors={Colors.gradientBackground} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Insights</Text>
          <Text style={styles.headerSub}>Portfolio Analytics</Text>
        </View>

        {/* Key Metrics */}
        {summary && (
          <View style={styles.metricsGrid}>
            {[
              { label: 'Invested', value: `₹${(summary.total_invested / 1000).toFixed(1)}K`, icon: 'arrow-down-circle', color: Colors.primary },
              { label: 'Current', value: `₹${(summary.current_value / 1000).toFixed(1)}K`, icon: 'trending-up', color: Colors.accent },
              { label: 'Total P&L', value: `${summary.total_pnl >= 0 ? '+' : ''}${summary.total_pnl_percent.toFixed(1)}%`, icon: 'analytics', color: summary.total_pnl >= 0 ? Colors.success : Colors.danger },
              { label: 'Holdings', value: `${summary.investment_count}`, icon: 'wallet', color: Colors.warning },
            ].map((m, i) => (
              <View key={i} style={styles.metricCard}>
                <View style={[styles.metricIcon, { backgroundColor: m.color + '22' }]}>
                  <Ionicons name={m.icon as any} size={18} color={m.color} />
                </View>
                <Text style={styles.metricValue}>{m.value}</Text>
                <Text style={styles.metricLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Holdings Bar Chart (native, no chart library) */}
        {investments.length >= 1 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="bar-chart" size={18} color={Colors.primary} />
              <Text style={styles.cardTitle}>Holdings Value</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.barChart}>
                {investments.slice(0, 8).map((inv, i) => {
                  const val = inv.current_value ?? 0;
                  const heightPct = (val / maxVal) * 120;
                  const isPos = (inv.pnl ?? 0) >= 0;
                  const color = Colors.assetColors[inv.asset_type] || Colors.primary;
                  return (
                    <View key={inv.id} style={styles.barGroup}>
                      <Text style={styles.barValue}>
                        {val >= 100000 ? `${(val / 100000).toFixed(1)}L` : `${(val / 1000).toFixed(0)}K`}
                      </Text>
                      <View style={styles.barTrack}>
                        <View style={[
                          styles.bar,
                          { height: Math.max(heightPct, 4), backgroundColor: color },
                        ]} />
                      </View>
                      <Text style={styles.barLabel} numberOfLines={1}>
                        {inv.name.split(' ')[0].substring(0, 7)}
                      </Text>
                      <Text style={[styles.barPnl, { color: isPos ? Colors.success : Colors.danger }]}>
                        {isPos ? '+' : ''}{(inv.pnl_percent ?? 0).toFixed(1)}%
                      </Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
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

        {/* Best Performers */}
        {best.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="trophy" size={18} color={Colors.gold} />
              <Text style={styles.cardTitle}>Best Performers</Text>
            </View>
            {best.map((inv, i) => (
              <PerformerRow key={inv.id} investment={inv} rank={i + 1} />
            ))}
          </View>
        )}

        {/* Worst Performers */}
        {worst.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="trending-down" size={18} color={Colors.danger} />
              <Text style={styles.cardTitle}>Underperformers</Text>
            </View>
            {worst.map((inv, i) => (
              <PerformerRow key={inv.id} investment={inv} rank={i + 1} />
            ))}
          </View>
        )}

        {/* Empty State */}
        {investments.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="analytics-outline" size={60} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Data Yet</Text>
            <Text style={styles.emptySub}>Add investments to see portfolio insights and analytics.</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </LinearGradient>
  );
}

function PerformerRow({ investment, rank }: { investment: Investment; rank: number }) {
  const pnlPct = investment.pnl_percent ?? 0;
  const pnl = investment.pnl ?? 0;
  const color = pnlPct >= 0 ? Colors.success : Colors.danger;
  return (
    <View style={rowStyles.row}>
      <View style={rowStyles.rankBadge}>
        <Text style={rowStyles.rank}>#{rank}</Text>
      </View>
      <View style={rowStyles.info}>
        <Text style={rowStyles.name}>{investment.name}</Text>
        <Text style={rowStyles.type}>{investment.asset_type.replace('_', ' ')}</Text>
      </View>
      <View style={rowStyles.values}>
        <Text style={[rowStyles.pct, { color }]}>{pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%</Text>
        <Text style={[rowStyles.abs, { color }]}>{pnl >= 0 ? '+' : ''}₹{Math.abs(pnl).toFixed(0)}</Text>
      </View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorderLight, gap: 12,
  },
  rankBadge: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: 'rgba(108,99,255,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },
  rank: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  type: { fontSize: 11, color: Colors.textMuted, textTransform: 'capitalize', marginTop: 1 },
  values: { alignItems: 'flex-end' },
  pct: { fontSize: 14, fontWeight: '700' },
  abs: { fontSize: 11 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { color: Colors.textSecondary, fontSize: 14 },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary },
  headerSub: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  metricsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 20, gap: 10, marginBottom: 14,
  },
  metricCard: {
    width: '47%', backgroundColor: Colors.card,
    borderRadius: 16, padding: 16, borderWidth: 1,
    borderColor: Colors.cardBorderLight, gap: 8,
  },
  metricIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  metricValue: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  metricLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
  card: {
    backgroundColor: Colors.card, borderRadius: 20,
    padding: 18, marginHorizontal: 20, marginBottom: 14,
    borderWidth: 1, borderColor: Colors.cardBorderLight,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  // Native bar chart
  barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingBottom: 4, minHeight: 170 },
  barGroup: { alignItems: 'center', width: 56 },
  barValue: { fontSize: 9, color: Colors.textMuted, marginBottom: 4 },
  barTrack: { width: 28, height: 120, justifyContent: 'flex-end' },
  bar: { width: 28, borderRadius: 6, minHeight: 4 },
  barLabel: { fontSize: 10, color: Colors.textSecondary, marginTop: 5, width: 56, textAlign: 'center' },
  barPnl: { fontSize: 10, fontWeight: '700', marginTop: 2 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
});

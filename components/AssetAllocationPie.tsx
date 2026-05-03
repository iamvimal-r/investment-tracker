/**
 * Asset allocation display using a native segmented bar — no chart library needed.
 * Upgrade to a pie chart with: npm install react-native-chart-kit react-native-svg
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { AssetAllocation } from '../services/investment.service';

interface AssetAllocationPieProps {
  allocation: AssetAllocation[];
  totalValue: number;
}

const ASSET_LABELS: Record<string, string> = {
  stock: 'Stocks',
  crypto: 'Crypto',
  mutual_fund: 'Mutual Funds',
  gold: 'Gold',
  fd: 'Fixed Deposit',
};

export function AssetAllocationPie({ allocation, totalValue }: AssetAllocationPieProps) {
  if (!allocation || allocation.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No allocation data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Segmented bar */}
      <View style={styles.barContainer}>
        {allocation.map((item, i) => {
          const color = Colors.assetColors[item.asset_type] || '#6C63FF';
          return (
            <View
              key={item.asset_type}
              style={[
                styles.segment,
                {
                  flex: item.percentage,
                  backgroundColor: color,
                  borderTopLeftRadius: i === 0 ? 8 : 0,
                  borderBottomLeftRadius: i === 0 ? 8 : 0,
                  borderTopRightRadius: i === allocation.length - 1 ? 8 : 0,
                  borderBottomRightRadius: i === allocation.length - 1 ? 8 : 0,
                },
              ]}
            />
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {allocation.map((item, i) => {
          const pnl = item.current_value - item.invested_value;
          const pnlPct = item.invested_value ? (pnl / item.invested_value) * 100 : 0;
          const color = Colors.assetColors[item.asset_type] || '#6C63FF';
          const pnlColor = pnl >= 0 ? Colors.success : Colors.danger;
          return (
            <View key={item.asset_type} style={styles.legendRow}>
              {/* Color dot */}
              <View style={[styles.dot, { backgroundColor: color }]} />
              {/* Name */}
              <Text style={styles.legendName} numberOfLines={1}>
                {ASSET_LABELS[item.asset_type] || item.asset_type}
              </Text>
              {/* Percentage */}
              <Text style={styles.legendPct}>{item.percentage.toFixed(1)}%</Text>
              {/* P&L */}
              <Text style={[styles.legendPnl, { color: pnlColor }]}>
                {pnl >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%
              </Text>
              {/* Value */}
              <Text style={styles.legendValue}>
                ₹{(item.current_value / 1000).toFixed(1)}K
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  empty: { height: 80, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: Colors.textMuted, fontSize: 14 },
  barContainer: {
    flexDirection: 'row',
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
    gap: 2,
  },
  segment: { height: 16 },
  legend: { gap: 10 },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  legendName: { flex: 1, fontSize: 13, color: Colors.textSecondary },
  legendPct: { fontSize: 12, color: Colors.textMuted, minWidth: 36, textAlign: 'right' },
  legendPnl: { fontSize: 12, fontWeight: '700', minWidth: 44, textAlign: 'right' },
  legendValue: { fontSize: 12, color: Colors.textMuted, minWidth: 44, textAlign: 'right' },
});

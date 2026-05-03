import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Investment } from '../services/investment.service';

interface InvestmentItemProps {
  investment: Investment;
  onPress?: () => void;
  onDelete?: () => void;
}

const ASSET_ICONS: Record<string, any> = {
  stock: 'stats-chart',
  crypto: 'logo-bitcoin',
  mutual_fund: 'pie-chart',
  gold: 'diamond',
  fd: 'business',
};

const ASSET_LABELS: Record<string, string> = {
  stock: 'Stock',
  crypto: 'Crypto',
  mutual_fund: 'Mutual Fund',
  gold: 'Gold',
  fd: 'Fixed Deposit',
};

export function InvestmentItem({ investment, onPress, onDelete }: InvestmentItemProps) {
  const pnl = investment.pnl ?? 0;
  const pnlPct = investment.pnl_percent ?? 0;
  const isPositive = pnl >= 0;
  const color = isPositive ? Colors.success : Colors.danger;
  const assetColor = Colors.assetColors[investment.asset_type] || Colors.primary;
  const currentValue = investment.current_value ?? investment.buy_price * investment.quantity;
  const investedValue = investment.invested_value ?? investment.buy_price * investment.quantity;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      {/* Asset icon */}
      <View style={[styles.iconWrapper, { backgroundColor: assetColor + '22' }]}>
        <Ionicons
          name={ASSET_ICONS[investment.asset_type] || 'trending-up'}
          size={20}
          color={assetColor}
        />
      </View>

      {/* Name & type */}
      <View style={styles.nameSection}>
        <Text style={styles.name} numberOfLines={1}>{investment.name}</Text>
        <Text style={styles.meta}>
          {ASSET_LABELS[investment.asset_type]} · {investment.quantity} units
        </Text>
      </View>

      {/* Values */}
      <View style={styles.valueSection}>
        <Text style={styles.currentValue}>
          ₹{currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </Text>
        <View style={[styles.pnlBadge, { backgroundColor: color + '22' }]}>
          <Text style={[styles.pnlText, { color }]}>
            {isPositive ? '+' : ''}{pnlPct.toFixed(2)}%
          </Text>
        </View>
      </View>

      {/* Delete */}
      {onDelete && (
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={(e) => { e.stopPropagation?.(); onDelete(); }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorderLight,
    gap: 12,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameSection: { flex: 1 },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  meta: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  valueSection: { alignItems: 'flex-end', gap: 4 },
  currentValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  pnlBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pnlText: {
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: { padding: 4 },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from '../constants/LinearGradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface PnLCardProps {
  label: string;
  value: number;
  percent?: number;
  subtitle?: string;
  currency?: string;
  isPositive?: boolean;
  size?: 'large' | 'small';
  gradient?: [string, string];
}

function formatCurrency(val: number, currency: string = '₹'): string {
  const absVal = Math.abs(val);
  if (absVal >= 10000000) return `${currency}${(val / 10000000).toFixed(2)}Cr`;
  if (absVal >= 100000) return `${currency}${(val / 100000).toFixed(2)}L`;
  if (absVal >= 1000) return `${currency}${(val / 1000).toFixed(2)}K`;
  return `${currency}${val.toFixed(2)}`;
}

export function PnLCard({
  label, value, percent, subtitle, currency = '₹',
  isPositive, size = 'small', gradient,
}: PnLCardProps) {
  const positive = isPositive ?? value >= 0;
  const sign = positive ? '+' : '';
  const color = positive ? Colors.success : Colors.danger;
  const defaultGradient = positive ? Colors.gradientAccent : Colors.gradientDanger;
  const useGradient = gradient || (size === 'large' ? defaultGradient : null);

  if (size === 'large') {
    return (
      <LinearGradient
        colors={useGradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.largeCard}
      >
        <View style={styles.largeCardInner}>
          <Text style={styles.largeLabel}>{label}</Text>
          <Text style={styles.largeValue}>
            {value < 0 ? '-' : ''}{formatCurrency(Math.abs(value), currency)}
          </Text>
          {percent !== undefined && (
            <View style={styles.percentBadge}>
              <Ionicons
                name={positive ? 'trending-up' : 'trending-down'}
                size={14}
                color={Colors.white}
              />
              <Text style={styles.percentText}>
                {sign}{percent.toFixed(2)}%
              </Text>
            </View>
          )}
          {subtitle && <Text style={styles.largeSubtitle}>{subtitle}</Text>}
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.smallCard}>
      <Text style={styles.smallLabel}>{label}</Text>
      <Text style={[styles.smallValue, { color }]}>
        {value < 0 ? '-' : sign}{formatCurrency(Math.abs(value), currency)}
      </Text>
      {percent !== undefined && (
        <Text style={[styles.smallPercent, { color }]}>
          {sign}{percent.toFixed(2)}%
        </Text>
      )}
      {subtitle && <Text style={styles.smallSubtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  largeCard: {
    borderRadius: 20,
    padding: 2,
    marginBottom: 16,
  },
  largeCardInner: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 18,
    padding: 22,
  },
  largeLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  largeValue: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 10,
  },
  percentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  percentText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  largeSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
  },
  smallCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorderLight,
    flex: 1,
  },
  smallLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  smallValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  smallPercent: {
    fontSize: 12,
    fontWeight: '600',
  },
  smallSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
});

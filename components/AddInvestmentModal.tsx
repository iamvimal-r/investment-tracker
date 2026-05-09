import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, ScrollView, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { LinearGradient } from '../constants/LinearGradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { investmentService, InvestmentCreate, AssetType } from '../services/investment.service';

interface AddInvestmentModalProps {
  visible: boolean;
  onClose: () => void;
  onAdded: () => void;
}

const ASSET_TYPES: { key: AssetType; label: string; icon: any; hint: string; quantityLabel?: string; priceLabel?: string }[] = [
  { key: 'stock',       label: 'Stock',       icon: 'stats-chart',    hint: 'e.g. RELIANCE.NS' },
  { key: 'crypto',      label: 'Crypto',      icon: 'logo-bitcoin',   hint: 'e.g. bitcoin' },
  { key: 'mutual_fund', label: 'Mutual Fund', icon: 'pie-chart',      hint: 'Scheme code e.g. 120503' },
  { key: 'gold',        label: 'Gold',        icon: 'diamond',        hint: 'e.g. Gold-24k' },
  { key: 'fd',          label: 'Fixed Dep.',  icon: 'business',       hint: 'e.g. SBI-FD-2024' },
  // Pension & Insurance
  { key: 'nps',         label: 'NPS',         icon: 'shield-checkmark', hint: 'e.g. NPS-Tier1-SBI',    quantityLabel: 'Units / Contributions', priceLabel: 'NAV / Avg. Cost (₹)' },
  { key: 'pf',          label: 'PF',          icon: 'briefcase',      hint: 'e.g. EPF-UAN-123456',   quantityLabel: 'Years / Count',         priceLabel: 'Total Corpus (₹)' },
  { key: 'lic',         label: 'LIC',         icon: 'heart',          hint: 'e.g. LIC-Jeevan-Anand', quantityLabel: 'No. of Policies',       priceLabel: 'Annual Premium (₹)' },
  { key: 'post_life',   label: 'Post Life',   icon: 'mail',           hint: 'e.g. PLI-Policy-12345', quantityLabel: 'No. of Policies',       priceLabel: 'Annual Premium (₹)' },
  { key: 'tata_aia',    label: 'TATA AIA',    icon: 'umbrella',       hint: 'e.g. TATA-AIA-Fortune', quantityLabel: 'No. of Policies',       priceLabel: 'Annual Premium (₹)' },
];

export function AddInvestmentModal({ visible, onClose, onAdded }: AddInvestmentModalProps) {
  const [assetType, setAssetType] = useState<AssetType>('stock');
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [buyDate, setBuyDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedType = ASSET_TYPES.find(t => t.key === assetType)!;

  const reset = () => {
    setSymbol(''); setName(''); setQuantity('');
    setBuyPrice(''); setBuyDate(new Date().toISOString().split('T')[0]);
    setNotes('');
  };

  const handleAdd = async () => {
    if (!symbol.trim() || !name.trim() || !quantity || !buyPrice) {
      Alert.alert('Missing Fields', 'Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const payload: InvestmentCreate = {
        asset_type: assetType,
        symbol: symbol.trim(),
        name: name.trim(),
        quantity: parseFloat(quantity),
        buy_price: parseFloat(buyPrice),
        buy_date: buyDate,
        notes: notes.trim() || undefined,
      };
      await investmentService.add(payload);
      reset();
      onAdded();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to add investment';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add Investment</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Asset Type Picker */}
            <Text style={styles.sectionLabel}>Asset Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeRow}>
              {ASSET_TYPES.map(type => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.typeChip,
                    assetType === type.key && styles.typeChipActive,
                    { borderColor: assetType === type.key ? Colors.assetColors[type.key] : Colors.cardBorderLight }
                  ]}
                  onPress={() => setAssetType(type.key)}
                >
                  <Ionicons
                    name={type.icon}
                    size={16}
                    color={assetType === type.key ? Colors.assetColors[type.key] : Colors.textMuted}
                  />
                  <Text style={[
                    styles.typeChipText,
                    { color: assetType === type.key ? Colors.assetColors[type.key] : Colors.textMuted }
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Symbol */}
            <Text style={styles.label}>Symbol / Code *</Text>
            <TextInput
              style={styles.input}
              placeholder={selectedType.hint}
              placeholderTextColor={Colors.textMuted}
              value={symbol}
              onChangeText={setSymbol}
              autoCapitalize="none"
            />

            {/* Name */}
            <Text style={styles.label}>Asset Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Reliance Industries"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
            />

            {/* Qty + Price — labels adapt for insurance types */}
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{selectedType.quantityLabel || 'Quantity'} *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textMuted}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{selectedType.priceLabel || 'Buy Price (₹)'} *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textMuted}
                  value={buyPrice}
                  onChangeText={setBuyPrice}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Buy Date */}
            <Text style={styles.label}>Purchase Date *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.textMuted}
              value={buyDate}
              onChangeText={setBuyDate}
            />

            {/* Total Preview */}
            {quantity && buyPrice && (
              <View style={styles.totalPreview}>
                <Text style={styles.totalLabel}>Total Invested</Text>
                <Text style={styles.totalValue}>
                  ₹{(parseFloat(quantity || '0') * parseFloat(buyPrice || '0')).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </Text>
              </View>
            )}

            {/* Notes */}
            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Any notes..."
              placeholderTextColor={Colors.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={2}
            />

            {/* Submit */}
            <TouchableOpacity
              style={styles.addBtn}
              onPress={handleAdd}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient colors={Colors.gradientPrimary} style={styles.addBtnGradient}>
                {loading
                  ? <ActivityIndicator color={Colors.white} />
                  : <>
                    <Ionicons name="add-circle" size={20} color={Colors.white} />
                    <Text style={styles.addBtnText}>Add Investment</Text>
                  </>
                }
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '92%',
    borderTopWidth: 1,
    borderColor: Colors.cardBorder,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.cardBorderLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  closeBtn: { padding: 4 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  typeRow: { marginBottom: 20, flexGrow: 0 },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: Colors.card,
    marginRight: 8,
  },
  typeChipActive: { backgroundColor: 'rgba(108,99,255,0.1)' },
  typeChipText: { fontSize: 13, fontWeight: '600' },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorderLight,
    paddingHorizontal: 14,
    height: 48,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  notesInput: { height: 72, paddingTop: 12, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  totalPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(108,99,255,0.1)',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  totalLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  totalValue: { fontSize: 16, color: Colors.primary, fontWeight: '800' },
  addBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 20 },
  addBtnGradient: {
    flexDirection: 'row',
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  addBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, FlatList, Image,
} from 'react-native';
import { LinearGradient } from '../../constants/LinearGradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { investmentService } from '../../services/investment.service';

type Tab = 'crypto' | 'stocks' | 'mf';

export default function MarketScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('crypto');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [topCrypto, setTopCrypto] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadTopCrypto();
  }, []);

  const loadTopCrypto = async () => {
    setLoading(true);
    try {
      const data = await investmentService.getTrendingCrypto();
      setTopCrypto(data);
    } catch (err) {
      console.error('Crypto load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await investmentService.searchAssets(q, activeTab === 'mf' ? 'mutual_fund' : activeTab === 'stocks' ? 'stock' : 'crypto');
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const renderCryptoCard = ({ item }: { item: any }) => {
    const isPositive = item.day_change_percent >= 0;
    const color = isPositive ? Colors.success : Colors.danger;
    return (
      <View style={styles.cryptoCard}>
        {item.image && (
          <Image source={{ uri: item.image }} style={styles.coinIcon} />
        )}
        <View style={styles.cryptoInfo}>
          <Text style={styles.cryptoName}>{item.name}</Text>
          <Text style={styles.cryptoSymbol}>{item.symbol?.toUpperCase()}</Text>
        </View>
        <View style={styles.cryptoValues}>
          <Text style={styles.cryptoPrice}>
            ₹{(item.current_price || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </Text>
          <View style={[styles.changeBadge, { backgroundColor: color + '22' }]}>
            <Ionicons name={isPositive ? 'trending-up' : 'trending-down'} size={12} color={color} />
            <Text style={[styles.changeText, { color }]}>
              {isPositive ? '+' : ''}{(item.day_change_percent || 0).toFixed(2)}%
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSearchResult = ({ item }: { item: any }) => (
    <View style={styles.searchResultItem}>
      <View style={styles.searchResultInfo}>
        <Text style={styles.searchResultName}>{item.name}</Text>
        <Text style={styles.searchResultMeta}>
          {item.symbol?.toUpperCase()} · {item.exchange || item.asset_type}
        </Text>
      </View>
      <View style={[styles.typeBadge, { backgroundColor: Colors.assetColors[item.asset_type] + '22' }]}>
        <Text style={[styles.typeBadgeText, { color: Colors.assetColors[item.asset_type] }]}>
          {item.asset_type?.replace('_', ' ')}
        </Text>
      </View>
    </View>
  );

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'crypto', label: 'Crypto', icon: 'logo-bitcoin' },
    { key: 'stocks', label: 'Stocks', icon: 'stats-chart' },
    { key: 'mf', label: 'Mutual Funds', icon: 'pie-chart' },
  ];

  return (
    <LinearGradient colors={Colors.gradientBackground} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Market</Text>
        <Text style={styles.headerSub}>Real-time prices & discovery</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder={activeTab === 'crypto' ? 'Search bitcoin, ethereum...' : activeTab === 'mf' ? 'Search fund name...' : 'Search RELIANCE, TCS...'}
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
        />
        {searching && <ActivityIndicator size="small" color={Colors.primary} />}
        {searchQuery.length > 0 && !searching && (
          <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Selector */}
      <View style={styles.tabRow}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => { setActiveTab(tab.key); setSearchQuery(''); setSearchResults([]); }}
          >
            <Ionicons
              name={tab.icon}
              size={14}
              color={activeTab === tab.key ? Colors.white : Colors.textMuted}
            />
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Search Results</Text>
            <FlatList
              data={searchResults}
              keyExtractor={(_, i) => i.toString()}
              renderItem={renderSearchResult}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Crypto Market */}
        {activeTab === 'crypto' && !searchQuery && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="flame" size={18} color={Colors.warning} />
              <Text style={styles.sectionTitle}>Top Cryptocurrencies</Text>
            </View>
            {loading ? (
              <ActivityIndicator color={Colors.primary} style={{ paddingVertical: 20 }} />
            ) : (
              <FlatList
                data={topCrypto}
                keyExtractor={(_, i) => i.toString()}
                renderItem={renderCryptoCard}
                scrollEnabled={false}
              />
            )}
          </View>
        )}

        {/* Stocks hint */}
        {activeTab === 'stocks' && !searchQuery && (
          <View style={styles.hintCard}>
            <Ionicons name="search" size={40} color={Colors.primary} />
            <Text style={styles.hintTitle}>Search Indian Stocks</Text>
            <Text style={styles.hintText}>
              Search by company name or NSE/BSE symbol{'\n'}
              e.g. "RELIANCE", "TCS", "INFY"
            </Text>
          </View>
        )}

        {/* MF hint */}
        {activeTab === 'mf' && !searchQuery && (
          <View style={styles.hintCard}>
            <Ionicons name="pie-chart" size={40} color={Colors.accent} />
            <Text style={styles.hintTitle}>Search Mutual Funds</Text>
            <Text style={styles.hintText}>
              Search by fund name{'\n'}
              e.g. "SBI Bluechip", "Axis Flexi Cap"
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary },
  headerSub: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.cardBorderLight,
    gap: 10,
    marginBottom: 14,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: 15 },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.cardBorderLight,
    marginBottom: 16,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 5,
  },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  tabTextActive: { color: Colors.white },
  content: { paddingHorizontal: 20 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorderLight,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  cryptoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorderLight,
    gap: 12,
  },
  coinIcon: { width: 36, height: 36, borderRadius: 18 },
  cryptoInfo: { flex: 1 },
  cryptoName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  cryptoSymbol: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  cryptoValues: { alignItems: 'flex-end', gap: 4 },
  cryptoPrice: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  changeText: { fontSize: 11, fontWeight: '700' },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorderLight,
    gap: 12,
  },
  searchResultInfo: { flex: 1 },
  searchResultName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  searchResultMeta: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeBadgeText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  hintCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorderLight,
    gap: 12,
    marginBottom: 14,
  },
  hintTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  hintText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
});

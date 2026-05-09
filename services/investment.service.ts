import api from '../constants/Api';

export type AssetType = 'stock' | 'crypto' | 'mutual_fund' | 'gold' | 'fd'
  | 'nps' | 'pf' | 'lic' | 'post_life' | 'tata_aia';

export interface Investment {
  id: string;
  user_email: string;
  asset_type: AssetType;
  symbol: string;
  name: string;
  quantity: number;
  buy_price: number;
  buy_date: string;
  currency: string;
  notes?: string;
  current_price?: number;
  current_value?: number;
  invested_value?: number;
  pnl?: number;
  pnl_percent?: number;
  day_change?: number;
  day_change_percent?: number;
  created_at?: string;
}

export interface InvestmentCreate {
  asset_type: AssetType;
  symbol: string;
  name: string;
  quantity: number;
  buy_price: number;
  buy_date: string;
  currency?: string;
  notes?: string;
}

export interface InvestmentUpdate {
  quantity?: number;
  buy_price?: number;
  buy_date?: string;
  notes?: string;
}

export interface AssetAllocation {
  asset_type: string;
  invested_value: number;
  current_value: number;
  percentage: number;
}

export interface TopPerformer {
  name: string;
  symbol: string;
  asset_type: string;
  pnl_percent: number;
  pnl: number;
}

export interface PortfolioSummary {
  total_invested: number;
  current_value: number;
  total_pnl: number;
  total_pnl_percent: number;
  daily_gain: number;
  daily_gain_percent: number;
  asset_allocation: AssetAllocation[];
  top_performers: TopPerformer[];
  investment_count: number;
}

export const investmentService = {
  async getAll(): Promise<Investment[]> {
    const { data } = await api.get('/investments/');
    return data as Investment[];
  },

  async add(investment: InvestmentCreate): Promise<Investment> {
    const { data } = await api.post('/investments/', investment);
    return data as Investment;
  },

  async update(id: string, update: InvestmentUpdate): Promise<Investment> {
    const { data } = await api.put(`/investments/${id}`, update);
    return data as Investment;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/investments/${id}`);
  },

  async getPortfolioSummary(): Promise<PortfolioSummary> {
    const { data } = await api.get('/investments/portfolio/summary');
    return data as PortfolioSummary;
  },

  async searchAssets(query: string, assetType: string): Promise<any[]> {
    const { data } = await api.get('/investments/market/search', { q: query, asset_type: assetType });
    return data as any[];
  },

  async getPrice(symbol: string, assetType: string): Promise<any> {
    const { data } = await api.get('/investments/market/price', { symbol, asset_type: assetType });
    return data;
  },

  async getPriceHistory(symbol: string, assetType: string, period: string): Promise<any> {
    const { data } = await api.get('/investments/market/history', { symbol, asset_type: assetType, period });
    return data;
  },

  async getTrendingCrypto(): Promise<any[]> {
    const { data } = await api.get('/investments/market/trending/crypto');
    return data as any[];
  },
};

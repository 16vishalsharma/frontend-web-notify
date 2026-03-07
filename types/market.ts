export interface ICryptoPrice {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price_inr: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d: number;
  high_24h: number;
  low_24h: number;
  last_updated: string;
}

export interface IMetalData {
  gold: {
    name: string;
    price_inr_per_oz: number | null;
    price_inr_per_gram: number | null;
    price_inr_per_10gram: number | null;
    price_change_percentage_24h: number | null;
    price_change_24h: number | null;
    high_24h: number | null;
    low_24h: number | null;
    image: string | null;
  };
  silver: {
    name: string;
    price_inr_per_gram: number | null;
    price_inr_per_kg: number | null;
  };
  source: string;
  last_updated: string;
}

export interface IStockPrice {
  symbol: string;
  name: string;
  type: 'index' | 'stock';
  currency: string;
  current_price: number;
  previous_close: number;
  change: number;
  change_percent: number;
  day_high: number | null;
  day_low: number | null;
  volume: number | null;
  last_updated: string;
}

export interface IMarketAllResponse {
  success: boolean;
  data: {
    crypto: ICryptoPrice[];
    metals: IMetalData | null;
    stocks: IStockPrice[];
    last_updated: string;
    from_db?: boolean;
    message?: string;
  };
}

export interface IMetalPrice {
  _id: string;
  date: string;
  gold_usd_per_oz: number;
  gold_inr_per_gram: number;
  gold_inr_per_10gram: number;
  silver_usd_per_oz: number;
  silver_inr_per_gram: number;
  silver_inr_per_kg: number;
  platinum_usd_per_oz: number;
  palladium_usd_per_oz: number;
  usd_to_inr_rate: number;
  fetchedAt: string;
  source: string;
}

export interface IMetalPriceResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  data: IMetalPrice[];
}

import axios from 'axios';
import { IMetalPrice } from '@appTypes/index';

const OUNCE_TO_GRAM = 31.1035;

const GOLD_API = 'https://api.gold-api.com/price';
const FX_API = 'https://api.exchangerate-api.com/v4/latest/USD';

export async function fetchFallbackMetalPrice(): Promise<IMetalPrice | null> {
  try {
    const [goldRes, silverRes, platRes, palladRes, fxRes] = await Promise.all([
      axios.get(`${GOLD_API}/XAU`, { timeout: 6000 }),
      axios.get(`${GOLD_API}/XAG`, { timeout: 6000 }),
      axios.get(`${GOLD_API}/XPT`, { timeout: 6000 }).catch(() => null),
      axios.get(`${GOLD_API}/XPD`, { timeout: 6000 }).catch(() => null),
      axios.get(FX_API, { timeout: 6000 }),
    ]);

    const goldUsdPerOz = Number(goldRes.data?.price) || 0;
    const silverUsdPerOz = Number(silverRes.data?.price) || 0;
    const platinumUsdPerOz = Number(platRes?.data?.price) || 0;
    const palladiumUsdPerOz = Number(palladRes?.data?.price) || 0;
    const usdToInr = Number(fxRes.data?.rates?.INR) || 0;

    if (!goldUsdPerOz || !usdToInr) return null;

    const goldInrPerGram = (goldUsdPerOz * usdToInr) / OUNCE_TO_GRAM;
    const silverInrPerGram = (silverUsdPerOz * usdToInr) / OUNCE_TO_GRAM;
    const fetchedAt = goldRes.data?.updatedAt || new Date().toISOString();

    return {
      _id: `fallback-${Date.now()}`,
      date: fetchedAt,
      gold_usd_per_oz: goldUsdPerOz,
      gold_inr_per_gram: goldInrPerGram,
      gold_inr_per_10gram: goldInrPerGram * 10,
      silver_usd_per_oz: silverUsdPerOz,
      silver_inr_per_gram: silverInrPerGram,
      silver_inr_per_kg: silverInrPerGram * 1000,
      platinum_usd_per_oz: platinumUsdPerOz,
      palladium_usd_per_oz: palladiumUsdPerOz,
      usd_to_inr_rate: Number(usdToInr.toFixed(2)),
      fetchedAt,
      source: 'gold-api.com (fallback)',
    };
  } catch {
    return null;
  }
}

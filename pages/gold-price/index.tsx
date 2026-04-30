import React from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import axios from 'axios';
import { Layout, SEO } from '@components/common';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
  Grid,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { IMetalPrice } from '@appTypes/index';
import { formatDateTime } from '@utils/index';

const formatCurrency = (value: number, currency: 'USD' | 'INR') => {
  if (!value) return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
};

const INDIAN_CITIES = [
  'Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Hyderabad', 'Kolkata',
  'Ahmedabad', 'Pune', 'Jaipur', 'Lucknow', 'Surat', 'Kanpur',
  'Nagpur', 'Indore', 'Bhopal', 'Patna', 'Chandigarh', 'Coimbatore',
];

interface GoldPricePageProps {
  prices: IMetalPrice[];
  latest: IMetalPrice | null;
  todayDate: string;
}

const GoldPricePage: React.FC<GoldPricePageProps> = ({ prices, latest, todayDate }) => {
  const gold22kPer10g = latest ? latest.gold_inr_per_10gram * 0.916 : 0;
  const gold24kPer10g = latest ? latest.gold_inr_per_10gram : 0;
  const gold18kPer10g = latest ? latest.gold_inr_per_10gram * 0.75 : 0;

  // JSON-LD: Product (Gold) for rich snippets
  const productSchema = latest
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Gold Price in India (24K)',
        description: `Live gold price in India today. 24K gold is ${formatCurrency(gold24kPer10g, 'INR')} per 10 gram.`,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'INR',
          price: gold24kPer10g.toFixed(2),
          availability: 'https://schema.org/InStock',
          priceValidUntil: todayDate,
        },
      }
    : null;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: process.env.NEXT_PUBLIC_SITE_URL || 'https://notify.com' },
      { '@type': 'ListItem', position: 2, name: 'Gold Price', item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://notify.com'}/gold-price` },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the gold price today in India?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Today's gold price in India is ${formatCurrency(gold24kPer10g, 'INR')} per 10 gram for 24 karat gold and ${formatCurrency(gold22kPer10g, 'INR')} per 10 gram for 22 karat gold.`,
        },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between 22K and 24K gold?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '24K gold is 99.9% pure gold while 22K gold contains 91.6% gold mixed with metals like silver and copper for durability. 24K is used for investment and 22K for jewelry.',
        },
      },
      {
        '@type': 'Question',
        name: 'How is gold price determined in India?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Gold prices in India are determined by international gold rates (in USD per ounce), the USD to INR exchange rate, import duties, GST, and local demand. Prices update multiple times daily.',
        },
      },
      {
        '@type': 'Question',
        name: 'Should I invest in gold now?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Gold is considered a hedge against inflation and currency depreciation. Diversifying 5-15% of your portfolio in gold (physical, ETF, or sovereign gold bonds) is generally recommended. Consult a financial advisor for personalized advice.',
        },
      },
    ],
  };

  const seoTitle = latest
    ? `Gold Price Today ${formatCurrency(gold24kPer10g, 'INR')} per 10g | Live 22K & 24K Rates India`
    : 'Gold Price Today in India | 22K, 24K Live Rates';
  const seoDescription = latest
    ? `Live gold price today in India: 24K gold ${formatCurrency(gold24kPer10g, 'INR')} per 10g, 22K gold ${formatCurrency(gold22kPer10g, 'INR')} per 10g. Updated ${formatDateTime(latest.fetchedAt)}. Check silver, platinum, palladium rates.`
    : 'Live gold price in India for 22K, 24K & 18K. Daily updated rates for major Indian cities including Delhi, Mumbai, Chennai, Bangalore.';

  return (
    <Layout>
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords="gold price today, gold rate today, 22k gold price, 24k gold price, silver price today, gold price india, gold rate delhi mumbai chennai, sone ka bhav, today gold price"
        jsonLd={productSchema ? [productSchema, breadcrumbSchema, faqSchema] : [breadcrumbSchema, faqSchema]}
        modifiedTime={latest?.fetchedAt}
      />

      {/* H1 — most important for SEO */}
      <Typography component="h1" variant="h1" sx={{ mb: 1, fontSize: { xs: '1.5rem', md: '2rem' } }}>
        Gold Price Today in India — {new Date(todayDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Live 22 Karat and 24 Karat gold rates in India. Silver, platinum &amp; palladium prices updated daily from international markets.
      </Typography>

      {latest && (
        <>
          {/* Featured snippet-friendly summary */}
          <Card sx={{ mb: 4, bgcolor: '#fffbeb', borderLeft: '4px solid #FFD700' }}>
            <CardContent>
              <Typography variant="h2" sx={{ fontSize: '1.25rem', mb: 1.5, fontWeight: 600 }}>
                Today&apos;s Gold Rate Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">24K Gold (10g)</Typography>
                    <Typography variant="h5" fontWeight={700} color="#B8860B">
                      {formatCurrency(gold24kPer10g, 'INR')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">22K Gold (10g)</Typography>
                    <Typography variant="h5" fontWeight={700} color="#B8860B">
                      {formatCurrency(gold22kPer10g, 'INR')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">18K Gold (10g)</Typography>
                    <Typography variant="h5" fontWeight={700} color="#B8860B">
                      {formatCurrency(gold18kPer10g, 'INR')}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Last updated: {formatDateTime(latest.fetchedAt)} · Source: {latest.source} · USD/INR: {latest.usd_to_inr_rate}
              </Typography>
            </CardContent>
          </Card>

          {/* All metals overview */}
          <Typography variant="h2" sx={{ fontSize: '1.5rem', mb: 2, fontWeight: 600 }}>
            Live Precious Metal Prices
          </Typography>
          <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <PriceCard title="Gold" usd={latest.gold_usd_per_oz} usdLabel="/oz" inr={latest.gold_inr_per_10gram} inrLabel="/10g" color="#FFD700" />
            <PriceCard title="Silver" usd={latest.silver_usd_per_oz} usdLabel="/oz" inr={latest.silver_inr_per_kg} inrLabel="/kg" color="#C0C0C0" />
            <PriceCard title="Platinum" usd={latest.platinum_usd_per_oz} usdLabel="/oz" color="#E5E4E2" />
            <PriceCard title="Palladium" usd={latest.palladium_usd_per_oz} usdLabel="/oz" color="#CED0CE" />
          </Box>

          {/* City-wise links — key for SEO */}
          <Typography variant="h2" sx={{ fontSize: '1.5rem', mb: 2, fontWeight: 600 }}>
            Gold Price in Major Indian Cities
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
            {INDIAN_CITIES.map((city) => (
              <Chip
                key={city}
                component={Link}
                href={`/gold-price/${city.toLowerCase()}`}
                clickable
                icon={<LocationOnIcon />}
                label={`Gold rate in ${city}`}
                variant="outlined"
                sx={{ '&:hover': { bgcolor: 'primary.main', color: 'white' } }}
              />
            ))}
          </Box>

          {/* Price history table */}
          <Typography variant="h2" sx={{ fontSize: '1.5rem', mb: 2, fontWeight: 600 }}>
            Gold &amp; Silver Price History
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell align="right"><strong>Gold (INR/10g)</strong></TableCell>
                  <TableCell align="right"><strong>Silver (INR/kg)</strong></TableCell>
                  <TableCell align="right"><strong>Gold (USD/oz)</strong></TableCell>
                  <TableCell align="right"><strong>Silver (USD/oz)</strong></TableCell>
                  <TableCell align="right"><strong>USD/INR</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...prices].reverse().slice(0, 30).map((price) => (
                  <TableRow key={price._id} hover>
                    <TableCell>{formatDateTime(price.fetchedAt)}</TableCell>
                    <TableCell align="right">{formatCurrency(price.gold_inr_per_10gram, 'INR')}</TableCell>
                    <TableCell align="right">{formatCurrency(price.silver_inr_per_kg, 'INR')}</TableCell>
                    <TableCell align="right">{formatCurrency(price.gold_usd_per_oz, 'USD')}</TableCell>
                    <TableCell align="right">{formatCurrency(price.silver_usd_per_oz, 'USD')}</TableCell>
                    <TableCell align="right">{price.usd_to_inr_rate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Educational SEO content */}
          <Divider sx={{ my: 4 }} />
          <Box sx={{ mb: 4 }}>
            <Typography variant="h2" sx={{ fontSize: '1.5rem', mb: 2, fontWeight: 600 }}>
              Understanding Gold Prices in India
            </Typography>
            <Typography paragraph>
              Gold is one of the most popular investment options in India, both for jewelry and as a hedge against inflation.
              Gold prices in India are influenced by international gold rates (quoted in USD per troy ounce), the USD to INR exchange rate,
              import duties, GST (currently 3% on gold), and local demand-supply dynamics.
            </Typography>

            <Typography variant="h3" sx={{ fontSize: '1.15rem', mt: 3, mb: 1, fontWeight: 600 }}>
              22K vs 24K vs 18K Gold — What&apos;s the Difference?
            </Typography>
            <Typography paragraph>
              <strong>24 Karat Gold (99.9% pure)</strong>: Considered the purest form of gold, ideal for investment purposes like gold coins, bars, and bullion.
              It&apos;s too soft for jewelry. <br />
              <strong>22 Karat Gold (91.6% pure)</strong>: Mixed with metals like silver, copper, or zinc for added durability.
              Most Indian jewelry is made of 22K gold. Hallmarked as &quot;916&quot;. <br />
              <strong>18 Karat Gold (75% pure)</strong>: Contains 25% other metals, making it more durable and affordable.
              Commonly used for diamond and gemstone jewelry.
            </Typography>

            <Typography variant="h3" sx={{ fontSize: '1.15rem', mt: 3, mb: 1, fontWeight: 600 }}>
              Factors Affecting Gold Prices
            </Typography>
            <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
              <li>International gold rates (COMEX, LBMA)</li>
              <li>USD to INR exchange rate fluctuations</li>
              <li>Inflation and interest rate changes</li>
              <li>Geopolitical tensions and global uncertainty</li>
              <li>RBI gold reserves and central bank policies</li>
              <li>Festive and wedding season demand in India</li>
              <li>Import duties (currently 6%) and GST</li>
            </ul>

            <Typography variant="h3" sx={{ fontSize: '1.15rem', mt: 3, mb: 1, fontWeight: 600 }}>
              Ways to Invest in Gold
            </Typography>
            <Typography paragraph>
              <strong>Physical Gold</strong>: Coins, bars, jewelry — comes with making charges and storage concerns.<br />
              <strong>Gold ETFs</strong>: Exchange-traded funds that track gold prices. Easy to buy/sell on stock exchanges.<br />
              <strong>Sovereign Gold Bonds (SGB)</strong>: Issued by RBI, offer 2.5% annual interest plus capital appreciation. Tax-free at maturity.<br />
              <strong>Digital Gold</strong>: Buy gold online through platforms like PhonePe, Paytm, with as little as ₹1.<br />
              <strong>Gold Mutual Funds</strong>: Funds that invest in gold ETFs, suitable for SIP investors.
            </Typography>
          </Box>
        </>
      )}

      {!latest && (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography color="text.secondary">No price data available right now. Please check back later.</Typography>
        </Box>
      )}
    </Layout>
  );
};

interface PriceCardProps {
  title: string;
  usd: number;
  usdLabel: string;
  inr?: number;
  inrLabel?: string;
  color: string;
}

const PriceCard: React.FC<PriceCardProps> = ({ title, usd, usdLabel, inr, inrLabel, color }) => (
  <Card variant="outlined" sx={{ borderTop: `4px solid ${color}` }}>
    <CardContent>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        {formatCurrency(usd, 'USD')}
        <Typography component="span" variant="body2" color="text.secondary"> {usdLabel}</Typography>
      </Typography>
      {inr !== undefined && inrLabel && (
        <Typography variant="body1" sx={{ mt: 0.5 }}>
          {formatCurrency(inr, 'INR')}
          <Typography component="span" variant="body2" color="text.secondary"> {inrLabel}</Typography>
        </Typography>
      )}
    </CardContent>
  </Card>
);

export const getServerSideProps: GetServerSideProps<GoldPricePageProps> = async ({ res }) => {
  // Cache at the CDN/edge for 5 min, allow stale for 10 min
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  try {
    const { data } = await axios.get(`${apiUrl}/api/metal-prices`, {
      params: { limit: 30 },
      timeout: 5000,
    });
    const prices: IMetalPrice[] = data.data || [];
    const latest = prices.length > 0 ? prices[prices.length - 1] : null;

    return {
      props: {
        prices,
        latest,
        todayDate: new Date().toISOString(),
      },
    };
  } catch {
    return {
      props: {
        prices: [],
        latest: null,
        todayDate: new Date().toISOString(),
      },
    };
  }
};

export default GoldPricePage;

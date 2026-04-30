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
  Breadcrumbs,
  Divider,
  Grid,
  Chip,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { IMetalPrice } from '@appTypes/index';
import { formatDateTime, fetchFallbackMetalPrice } from '@utils/index';

const formatCurrency = (value: number) =>
  !value ? '-' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(value);

const VALID_CITIES: Record<string, { name: string; state: string }> = {
  delhi: { name: 'Delhi', state: 'Delhi NCR' },
  mumbai: { name: 'Mumbai', state: 'Maharashtra' },
  chennai: { name: 'Chennai', state: 'Tamil Nadu' },
  bangalore: { name: 'Bangalore', state: 'Karnataka' },
  hyderabad: { name: 'Hyderabad', state: 'Telangana' },
  kolkata: { name: 'Kolkata', state: 'West Bengal' },
  ahmedabad: { name: 'Ahmedabad', state: 'Gujarat' },
  pune: { name: 'Pune', state: 'Maharashtra' },
  jaipur: { name: 'Jaipur', state: 'Rajasthan' },
  lucknow: { name: 'Lucknow', state: 'Uttar Pradesh' },
  surat: { name: 'Surat', state: 'Gujarat' },
  kanpur: { name: 'Kanpur', state: 'Uttar Pradesh' },
  nagpur: { name: 'Nagpur', state: 'Maharashtra' },
  indore: { name: 'Indore', state: 'Madhya Pradesh' },
  bhopal: { name: 'Bhopal', state: 'Madhya Pradesh' },
  patna: { name: 'Patna', state: 'Bihar' },
  chandigarh: { name: 'Chandigarh', state: 'Chandigarh' },
  coimbatore: { name: 'Coimbatore', state: 'Tamil Nadu' },
};

interface CityGoldPricePageProps {
  city: string;
  cityName: string;
  cityState: string;
  prices: IMetalPrice[];
  latest: IMetalPrice | null;
}

const CityGoldPricePage: React.FC<CityGoldPricePageProps> = ({ city, cityName, cityState, prices, latest }) => {
  const gold24kPer10g = latest ? latest.gold_inr_per_10gram : 0;
  const gold22kPer10g = gold24kPer10g * 0.916;
  const gold18kPer10g = gold24kPer10g * 0.75;
  const gold24kPerGram = gold24kPer10g / 10;
  const gold22kPerGram = gold22kPer10g / 10;
  const silverPerKg = latest ? latest.silver_inr_per_kg : 0;
  const silverPer10g = silverPerKg / 100;

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://notify.com';

  const productSchema = latest
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: `Gold Price in ${cityName}`,
        description: `Today's gold price in ${cityName}: 24K gold ${formatCurrency(gold24kPer10g)} per 10g, 22K gold ${formatCurrency(gold22kPer10g)} per 10g.`,
        offers: [
          { '@type': 'Offer', name: '24K Gold (10 gram)', priceCurrency: 'INR', price: gold24kPer10g.toFixed(0), availability: 'https://schema.org/InStock' },
          { '@type': 'Offer', name: '22K Gold (10 gram)', priceCurrency: 'INR', price: gold22kPer10g.toFixed(0), availability: 'https://schema.org/InStock' },
        ],
      }
    : null;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Gold Price', item: `${SITE_URL}/gold-price` },
      { '@type': 'ListItem', position: 3, name: `Gold Price in ${cityName}`, item: `${SITE_URL}/gold-price/${city}` },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the gold price today in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Today's gold price in ${cityName} is ${formatCurrency(gold24kPer10g)} per 10 gram for 24 karat gold and ${formatCurrency(gold22kPer10g)} per 10 gram for 22 karat gold.`,
        },
      },
      {
        '@type': 'Question',
        name: `What is the silver price today in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Silver price today in ${cityName} is ${formatCurrency(silverPerKg)} per kilogram.`,
        },
      },
      {
        '@type': 'Question',
        name: `Where to buy gold in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `You can buy gold from authorized BIS hallmarked jewelers, banks (gold coins), online through digital gold platforms, or invest via Gold ETFs and Sovereign Gold Bonds. Always verify hallmark before purchase.`,
        },
      },
    ],
  };

  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const seoTitle = latest
    ? `Gold Price in ${cityName} Today ${formatCurrency(gold24kPer10g)}/10g | 22K & 24K Rates`
    : `Gold Price in ${cityName} Today | Live 22K & 24K Rates`;
  const seoDescription = latest
    ? `Gold rate today in ${cityName}, ${cityState}: 24K ${formatCurrency(gold24kPer10g)} per 10g, 22K ${formatCurrency(gold22kPer10g)} per 10g. Silver ${formatCurrency(silverPerKg)}/kg. Updated ${formatDateTime(latest.fetchedAt)}.`
    : `Today's live gold price in ${cityName}, ${cityState}. Check 22K, 24K & 18K gold rates with daily updates. Silver and platinum prices included.`;

  const otherCities = Object.entries(VALID_CITIES).filter(([slug]) => slug !== city);

  return (
    <Layout>
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={`gold price ${cityName}, gold rate ${cityName} today, 22k gold ${cityName}, 24k gold ${cityName}, silver price ${cityName}, ${cityName} sone ka bhav`}
        jsonLd={productSchema ? [productSchema, breadcrumbSchema, faqSchema] : [breadcrumbSchema, faqSchema]}
        modifiedTime={latest?.fetchedAt}
      />

      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/" style={{ color: 'inherit' }}>Home</Link>
        <Link href="/gold-price" style={{ color: 'inherit' }}>Gold Price</Link>
        <Typography color="text.primary">{cityName}</Typography>
      </Breadcrumbs>

      <Typography component="h1" variant="h1" sx={{ mb: 1, fontSize: { xs: '1.5rem', md: '2rem' } }}>
        Gold Price in {cityName} Today — {today}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Live 22K and 24K gold rates in {cityName}, {cityState}. Silver, platinum &amp; palladium prices updated daily.
      </Typography>

      {latest && (
        <>
          {/* Featured snippet table */}
          <Card sx={{ mb: 4, bgcolor: '#fffbeb', borderLeft: '4px solid #FFD700' }}>
            <CardContent>
              <Typography component="h2" variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Today&apos;s Gold Rate in {cityName}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Gram</strong></TableCell>
                      <TableCell align="right"><strong>22K Gold (₹)</strong></TableCell>
                      <TableCell align="right"><strong>24K Gold (₹)</strong></TableCell>
                      <TableCell align="right"><strong>18K Gold (₹)</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>1 gram</TableCell>
                      <TableCell align="right">{formatCurrency(gold22kPerGram)}</TableCell>
                      <TableCell align="right">{formatCurrency(gold24kPerGram)}</TableCell>
                      <TableCell align="right">{formatCurrency(gold18kPer10g / 10)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>8 gram</TableCell>
                      <TableCell align="right">{formatCurrency(gold22kPerGram * 8)}</TableCell>
                      <TableCell align="right">{formatCurrency(gold24kPerGram * 8)}</TableCell>
                      <TableCell align="right">{formatCurrency((gold18kPer10g / 10) * 8)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>10 gram</TableCell>
                      <TableCell align="right"><strong>{formatCurrency(gold22kPer10g)}</strong></TableCell>
                      <TableCell align="right"><strong>{formatCurrency(gold24kPer10g)}</strong></TableCell>
                      <TableCell align="right">{formatCurrency(gold18kPer10g)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>100 gram</TableCell>
                      <TableCell align="right">{formatCurrency(gold22kPer10g * 10)}</TableCell>
                      <TableCell align="right">{formatCurrency(gold24kPer10g * 10)}</TableCell>
                      <TableCell align="right">{formatCurrency(gold18kPer10g * 10)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Last updated: {formatDateTime(latest.fetchedAt)} · Source: {latest.source}
              </Typography>
            </CardContent>
          </Card>

          {/* Silver in this city */}
          <Card sx={{ mb: 4, bgcolor: '#f8fafc', borderLeft: '4px solid #C0C0C0' }}>
            <CardContent>
              <Typography component="h2" variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Silver Price in {cityName} Today
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">1 gram</Typography>
                  <Typography variant="h6">{formatCurrency(silverPerKg / 1000)}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">10 gram</Typography>
                  <Typography variant="h6">{formatCurrency(silverPer10g)}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">100 gram</Typography>
                  <Typography variant="h6">{formatCurrency(silverPerKg / 10)}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">1 kg</Typography>
                  <Typography variant="h6">{formatCurrency(silverPerKg)}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Price history */}
          <Typography component="h2" variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Last 30 Days Gold Price in {cityName}
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell align="right"><strong>22K (₹/10g)</strong></TableCell>
                  <TableCell align="right"><strong>24K (₹/10g)</strong></TableCell>
                  <TableCell align="right"><strong>Silver (₹/kg)</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...prices].reverse().slice(0, 30).map((price) => (
                  <TableRow key={price._id} hover>
                    <TableCell>{formatDateTime(price.fetchedAt)}</TableCell>
                    <TableCell align="right">{formatCurrency(price.gold_inr_per_10gram * 0.916)}</TableCell>
                    <TableCell align="right">{formatCurrency(price.gold_inr_per_10gram)}</TableCell>
                    <TableCell align="right">{formatCurrency(price.silver_inr_per_kg)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Other cities */}
          <Divider sx={{ my: 4 }} />
          <Typography component="h2" variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Gold Price in Other Cities
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
            {otherCities.map(([slug, info]) => (
              <Chip
                key={slug}
                component={Link}
                href={`/gold-price/${slug}`}
                clickable
                icon={<LocationOnIcon />}
                label={`Gold rate in ${info.name}`}
                variant="outlined"
                sx={{ '&:hover': { bgcolor: 'primary.main', color: 'white' } }}
              />
            ))}
          </Box>

          {/* Educational SEO content */}
          <Divider sx={{ my: 4 }} />
          <Box>
            <Typography component="h2" variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              About Gold Prices in {cityName}
            </Typography>
            <Typography paragraph>
              Gold is a popular investment and jewelry metal in {cityName}, {cityState}. The price of gold in {cityName} typically reflects
              the international gold rate, the USD/INR exchange rate, plus any local making charges and GST (3% on gold in India).
              Most jewelers in {cityName} sell BIS hallmarked 22 karat gold for ornaments and 24 karat gold coins/bars for investment.
            </Typography>

            <Typography component="h3" variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
              Buying Gold in {cityName} — What to Check
            </Typography>
            <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
              <li>Look for the <strong>BIS Hallmark (HUID)</strong> on every piece of gold jewelry — mandatory since 2023.</li>
              <li>Check the <strong>karat marking</strong> (22K = 916, 18K = 750).</li>
              <li>Ask for the <strong>making charges</strong> separately on the bill (usually 8-25%).</li>
              <li>Verify <strong>wastage charges</strong> and <strong>GST (3%)</strong> on the invoice.</li>
              <li>For investment, prefer <strong>gold coins</strong> from RBI-authorized banks or government mints over jewelry.</li>
            </ul>

            <Typography component="h3" variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
              Why Gold Prices Vary Between Cities
            </Typography>
            <Typography paragraph>
              Although the international gold rate is the same, prices in different Indian cities like {cityName} vary slightly due to
              local taxes (state-level), transportation costs, jeweler margins, and demand patterns. Prices also tend to be slightly lower
              in cities with major gold trading hubs.
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

export const getServerSideProps: GetServerSideProps<CityGoldPricePageProps> = async ({ params, res }) => {
  const citySlug = String(params?.city || '').toLowerCase();

  if (!VALID_CITIES[citySlug]) {
    return { notFound: true };
  }

  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  let prices: IMetalPrice[] = [];
  let latest: IMetalPrice | null = null;

  try {
    const { data } = await axios.get(`${apiUrl}/api/metal-prices`, { params: { limit: 30 }, timeout: 5000 });
    prices = data.data || [];
    latest = prices.length > 0 ? prices[prices.length - 1] : null;
  } catch {
    // primary API unavailable — fall through to fallback below
  }

  if (!latest) {
    const fallback = await fetchFallbackMetalPrice();
    if (fallback) {
      latest = fallback;
      prices = [fallback];
    }
  }

  return {
    props: {
      city: citySlug,
      cityName: VALID_CITIES[citySlug].name,
      cityState: VALID_CITIES[citySlug].state,
      prices,
      latest,
    },
  };
};

export default CityGoldPricePage;

import React, { useEffect } from 'react';
import { Layout, Loading } from '@components/common';
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
} from '@mui/material';
import useAppDispatch from '@hooks/useAppDispatch';
import useAppSelector from '@hooks/useAppSelector';
import { fetchMetalPrices } from '@lib/public/metalPrices/metalPricesSlice';
import { formatDateTime } from '@utils/index';

const formatCurrency = (value: number, currency: 'USD' | 'INR') => {
  if (!value) return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
};

const GoldPricePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { prices, loading, error } = useAppSelector((state) => state.metalPrices);

  useEffect(() => {
    dispatch(fetchMetalPrices());
  }, [dispatch]);

  const latest = prices.length > 0 ? prices[prices.length - 1] : null;

  return (
    <Layout>
      <Typography variant="h1" className="mb-2">Gold & Metal Prices</Typography>
      <Typography variant="body1" color="text.secondary" className="mb-6">
        Live gold, silver, platinum & palladium prices updated daily
      </Typography>

      {loading && <Loading message="Loading metal prices..." />}
      {error && <Typography color="error">{error}</Typography>}

      {!loading && latest && (
        <>
          <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <PriceCard
              title="Gold"
              usd={latest.gold_usd_per_oz}
              usdLabel="/oz"
              inr={latest.gold_inr_per_10gram}
              inrLabel="/10g"
              color="#FFD700"
            />
            <PriceCard
              title="Silver"
              usd={latest.silver_usd_per_oz}
              usdLabel="/oz"
              inr={latest.silver_inr_per_kg}
              inrLabel="/kg"
              color="#C0C0C0"
            />
            <PriceCard
              title="Platinum"
              usd={latest.platinum_usd_per_oz}
              usdLabel="/oz"
              color="#E5E4E2"
            />
            <PriceCard
              title="Palladium"
              usd={latest.palladium_usd_per_oz}
              usdLabel="/oz"
              color="#CED0CE"
            />
          </Box>

          <Box className="mb-4 flex items-center gap-2">
            <Typography variant="body2" color="text.secondary">
              USD/INR Rate: <strong>{latest.usd_to_inr_rate}</strong>
            </Typography>
            <Chip label={`Source: ${latest.source}`} size="small" variant="outlined" />
          </Box>

          <Typography variant="h2" className="mb-4">Price History</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell align="right"><strong>Gold (USD/oz)</strong></TableCell>
                  <TableCell align="right"><strong>Gold (INR/10g)</strong></TableCell>
                  <TableCell align="right"><strong>Silver (USD/oz)</strong></TableCell>
                  <TableCell align="right"><strong>Silver (INR/kg)</strong></TableCell>
                  <TableCell align="right"><strong>Platinum (USD/oz)</strong></TableCell>
                  <TableCell align="right"><strong>Palladium (USD/oz)</strong></TableCell>
                  <TableCell align="right"><strong>USD/INR</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...prices].reverse().map((price) => (
                  <TableRow key={price._id} hover>
                    <TableCell>{formatDateTime(price.fetchedAt)}</TableCell>
                    <TableCell align="right">{formatCurrency(price.gold_usd_per_oz, 'USD')}</TableCell>
                    <TableCell align="right">{formatCurrency(price.gold_inr_per_10gram, 'INR')}</TableCell>
                    <TableCell align="right">{formatCurrency(price.silver_usd_per_oz, 'USD')}</TableCell>
                    <TableCell align="right">{formatCurrency(price.silver_inr_per_kg, 'INR')}</TableCell>
                    <TableCell align="right">{formatCurrency(price.platinum_usd_per_oz, 'USD')}</TableCell>
                    <TableCell align="right">{formatCurrency(price.palladium_usd_per_oz, 'USD')}</TableCell>
                    <TableCell align="right">{price.usd_to_inr_rate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {!loading && prices.length === 0 && !error && (
        <Box className="text-center py-10">
          <Typography color="text.secondary">No price data available.</Typography>
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

export default GoldPricePage;

import React, { useEffect, useState } from 'react';
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
  Tabs,
  Tab,
  Avatar,
  IconButton,
  NoSsr,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import DiamondIcon from '@mui/icons-material/Diamond';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import useAppDispatch from '@hooks/useAppDispatch';
import useAppSelector from '@hooks/useAppSelector';
import { fetchMarketData } from '@lib/public/market/marketSlice';
import { ICryptoPrice, IMetalData, IStockPrice } from '../../types';

const formatINR = (value: number | null) => {
  if (!value) return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatLargeNumber = (value: number | null) => {
  if (!value) return '-';
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e7) return `${(value / 1e7).toFixed(2)}Cr`;
  if (value >= 1e5) return `${(value / 1e5).toFixed(2)}L`;
  return value.toLocaleString('en-IN');
};

const ChangeIndicator: React.FC<{ value: number | null; suffix?: string }> = ({ value, suffix = '%' }) => {
  if (value === null || value === undefined) return <span>-</span>;
  const isPositive = value >= 0;
  return (
    <Box className="flex items-center gap-1" sx={{ color: isPositive ? '#16a34a' : '#dc2626' }}>
      {isPositive ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
      <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>
        {isPositive ? '+' : ''}{value.toFixed(2)}{suffix}
      </Typography>
    </Box>
  );
};

const ShareMarketPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { crypto, metals, stocks, loading, error, lastUpdated, fromDb, message } = useAppSelector((state) => state.market);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    dispatch(fetchMarketData());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchMarketData());
  };

  const indices = stocks.filter((s) => s.type === 'index');
  const stocksList = stocks.filter((s) => s.type === 'stock');

  return (
    <Layout>
      <Box className="flex items-center justify-between mb-2">
        <Box>
          <Typography variant="h1">Share Market</Typography>
          <Typography variant="body1" color="text.secondary" className="mt-1">
            Live Crypto, Metals & Indian Stock Market Data
          </Typography>
        </Box>
        <Box className="flex items-center gap-2">
          {fromDb && (
            <Chip label="Saved Data" size="small" color="warning" variant="outlined" />
          )}
          {lastUpdated && (
            <Typography variant="caption" color="text.secondary">
              Updated: {new Date(lastUpdated).toLocaleTimeString('en-IN')}
            </Typography>
          )}
          <IconButton onClick={handleRefresh} disabled={loading} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      <NoSsr>
        {loading && <Loading message="Fetching live market data..." />}
        {error && <Typography color="error" className="mb-4">{error}</Typography>}

        {!loading && (
          <>
            {/* Market Indices Summary */}
            {indices.length > 0 && (
              <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {indices.map((index) => (
                  <Card key={index.symbol} variant="outlined" sx={{
                    borderTop: `4px solid ${index.change >= 0 ? '#16a34a' : '#dc2626'}`,
                  }}>
                    <CardContent className="flex justify-between items-center">
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">{index.name}</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          {formatINR(index.current_price)}
                        </Typography>
                      </Box>
                      <Box className="text-right">
                        <ChangeIndicator value={index.change} suffix="" />
                        <ChangeIndicator value={index.change_percent} />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}

            {/* Tabs */}
            <Paper variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab icon={<CurrencyBitcoinIcon />} iconPosition="start" label="Crypto" />
                <Tab icon={<DiamondIcon />} iconPosition="start" label="Metals" />
                <Tab icon={<ShowChartIcon />} iconPosition="start" label="Stocks" />
              </Tabs>

              <Box sx={{ p: 3 }}>
                {tab === 0 && <CryptoSection crypto={crypto} />}
                {tab === 1 && <MetalsSection metals={metals} />}
                {tab === 2 && <StocksSection stocks={stocksList} />}
              </Box>
            </Paper>
          </>
        )}

        {!loading && !error && crypto.length === 0 && stocks.length === 0 && !metals && (
          <Box className="text-center py-10">
            <Typography color="text.secondary">No market data available. Click refresh to try again.</Typography>
          </Box>
        )}
      </NoSsr>
    </Layout>
  );
};

// --- Crypto Section ---
const CryptoSection: React.FC<{ crypto: ICryptoPrice[] }> = ({ crypto }) => {
  if (crypto.length === 0) {
    return <Typography color="text.secondary">No crypto data available.</Typography>;
  }

  return (
    <>
      <Grid container spacing={3} className="mb-6">
        {crypto.map((coin) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={coin.id}>
            <Card variant="outlined" sx={{
              borderLeft: `4px solid ${coin.price_change_percentage_24h >= 0 ? '#16a34a' : '#dc2626'}`,
            }}>
              <CardContent>
                <Box className="flex items-center gap-3 mb-3">
                  <Avatar src={coin.image} alt={coin.name} sx={{ width: 40, height: 40 }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{coin.name}</Typography>
                    <Chip label={coin.symbol} size="small" variant="outlined" />
                  </Box>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  {formatINR(coin.current_price_inr)}
                </Typography>
                <Box className="flex gap-4">
                  <Box>
                    <Typography variant="caption" color="text.secondary">24h</Typography>
                    <ChangeIndicator value={coin.price_change_percentage_24h} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">7d</Typography>
                    <ChangeIndicator value={coin.price_change_percentage_7d} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell><strong>Coin</strong></TableCell>
              <TableCell align="right"><strong>Price (INR)</strong></TableCell>
              <TableCell align="right"><strong>24h Change</strong></TableCell>
              <TableCell align="right"><strong>Market Cap</strong></TableCell>
              <TableCell align="right"><strong>24h Volume</strong></TableCell>
              <TableCell align="right"><strong>24h High</strong></TableCell>
              <TableCell align="right"><strong>24h Low</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {crypto.map((coin) => (
              <TableRow key={coin.id} hover>
                <TableCell>
                  <Box className="flex items-center gap-2">
                    <Avatar src={coin.image} alt={coin.name} sx={{ width: 24, height: 24 }} />
                    <strong>{coin.name}</strong>
                    <Typography variant="caption" color="text.secondary">{coin.symbol}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="right"><strong>{formatINR(coin.current_price_inr)}</strong></TableCell>
                <TableCell align="right"><ChangeIndicator value={coin.price_change_percentage_24h} /></TableCell>
                <TableCell align="right">{formatLargeNumber(coin.market_cap)}</TableCell>
                <TableCell align="right">{formatLargeNumber(coin.total_volume)}</TableCell>
                <TableCell align="right">{formatINR(coin.high_24h)}</TableCell>
                <TableCell align="right">{formatINR(coin.low_24h)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

// --- Metals Section ---
const MetalsSection: React.FC<{ metals: IMetalData | null }> = ({ metals }) => {
  if (!metals) {
    return <Typography color="text.secondary">No metals data available.</Typography>;
  }

  return (
    <Grid container spacing={3}>
      {/* Gold Card */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card variant="outlined" sx={{ borderTop: '4px solid #FFD700' }}>
          <CardContent>
            <Box className="flex items-center gap-2 mb-3">
              {metals.gold.image && (
                <Avatar src={metals.gold.image} alt="Gold" sx={{ width: 32, height: 32 }} />
              )}
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#b8860b' }}>
                Gold (XAUT)
              </Typography>
            </Box>

            {metals.gold.price_inr_per_oz && (
              <Box className="mb-3">
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {formatINR(metals.gold.price_inr_per_oz)}
                  <Typography component="span" variant="body2" color="text.secondary"> /oz</Typography>
                </Typography>
                <ChangeIndicator value={metals.gold.price_change_percentage_24h} />
              </Box>
            )}

            {metals.gold.price_inr_per_gram && (
              <Box className="mt-3 pt-3" sx={{ borderTop: '1px solid #eee' }}>
                <Box className="grid grid-cols-2 gap-3">
                  <Box>
                    <Typography variant="body2" color="text.secondary">Per gram</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {formatINR(metals.gold.price_inr_per_gram)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Per 10g</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {formatINR(metals.gold.price_inr_per_10gram)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">24h High</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {formatINR(metals.gold.high_24h)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">24h Low</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {formatINR(metals.gold.low_24h)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Silver Card */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card variant="outlined" sx={{ borderTop: '4px solid #C0C0C0' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#708090' }}>
              Silver
            </Typography>

            {metals.silver.price_inr_per_gram ? (
              <Box>
                <Box className="grid grid-cols-2 gap-3 mt-1">
                  <Box>
                    <Typography variant="body2" color="text.secondary">Per gram</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {formatINR(metals.silver.price_inr_per_gram)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Per kg</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {formatINR(metals.silver.price_inr_per_kg)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Typography color="text.secondary">Silver prices unavailable on free API tier.</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid size={12}>
        <Typography variant="caption" color="text.secondary">
          Source: {metals.source} — Gold prices derived from XAUT token (1 XAUT = 1 troy oz of gold)
        </Typography>
      </Grid>
    </Grid>
  );
};

// --- Stocks Section ---
const StocksSection: React.FC<{ stocks: IStockPrice[] }> = ({ stocks }) => {
  if (stocks.length === 0) {
    return <Typography color="text.secondary">No stock data available.</Typography>;
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
            <TableCell><strong>Company</strong></TableCell>
            <TableCell align="right"><strong>Price (INR)</strong></TableCell>
            <TableCell align="right"><strong>Change</strong></TableCell>
            <TableCell align="right"><strong>Change %</strong></TableCell>
            <TableCell align="right"><strong>Day High</strong></TableCell>
            <TableCell align="right"><strong>Day Low</strong></TableCell>
            <TableCell align="right"><strong>Prev Close</strong></TableCell>
            <TableCell align="right"><strong>Volume</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stocks.map((stock) => (
            <TableRow key={stock.symbol} hover>
              <TableCell>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{stock.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{stock.symbol}</Typography>
                </Box>
              </TableCell>
              <TableCell align="right">
                <strong>{formatINR(stock.current_price)}</strong>
              </TableCell>
              <TableCell align="right">
                <ChangeIndicator value={stock.change} suffix="" />
              </TableCell>
              <TableCell align="right">
                <ChangeIndicator value={stock.change_percent} />
              </TableCell>
              <TableCell align="right">{formatINR(stock.day_high)}</TableCell>
              <TableCell align="right">{formatINR(stock.day_low)}</TableCell>
              <TableCell align="right">{formatINR(stock.previous_close)}</TableCell>
              <TableCell align="right">{formatLargeNumber(stock.volume)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ShareMarketPage;

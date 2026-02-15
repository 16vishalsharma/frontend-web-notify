import React from 'react';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { Toaster } from 'react-hot-toast';
import { store } from '@store/index';
import theme from '@styles/theme';
import createEmotionCache from '../createEmotionCache';
import '@styles/globals.css';

const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

const MyApp: React.FC<MyAppProps> = ({ Component, pageProps, emotionCache = clientSideEmotionCache }) => {
  return (
    <CacheProvider value={emotionCache}>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Component {...pageProps} />
          <Toaster position="top-right" />
        </ThemeProvider>
      </Provider>
    </CacheProvider>
  );
};

export default MyApp;

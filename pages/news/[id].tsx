import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout, Loading } from '@components/common';
import { Typography, Card, CardContent, Chip, Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import useAppDispatch from '@hooks/useAppDispatch';
import useAppSelector from '@hooks/useAppSelector';
import { fetchNewsById, clearCurrentNews } from '@lib/public/news/newsSlice';
import { formatDateTime } from '@utils/index';

const NewsDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useAppDispatch();
  const { currentNews, loading, error } = useAppSelector((state) => state.news);

  useEffect(() => {
    if (id && typeof id === 'string') {
      dispatch(fetchNewsById(id));
    }
    return () => {
      dispatch(clearCurrentNews());
    };
  }, [dispatch, id]);

  if (loading) return <Layout><Loading message="Loading article..." /></Layout>;
  if (error) return <Layout><Typography color="error">{error}</Typography></Layout>;
  if (!currentNews) return <Layout><Typography>News not found.</Typography></Layout>;

  return (
    <Layout maxWidth="md">
      <Button
        component={Link}
        href="/news"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2 }}
      >
        Back to News
      </Button>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box className="flex gap-2 mb-3">
            <Chip label={currentNews.category} color="primary" />
            <Chip label={currentNews.topic} variant="outlined" />
          </Box>

          <Typography variant="h1" className="mb-3">{currentNews.title}</Typography>

          <Box className="flex items-center gap-2 text-gray-500 mb-6">
            <span>Published: {formatDateTime(currentNews.publishedAt)}</span>
            {currentNews.source && (
              <span>
                | Source:{' '}
                {currentNews.sourceUrl ? (
                  <a href={currentNews.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {currentNews.source}
                  </a>
                ) : (
                  currentNews.source
                )}
              </span>
            )}
          </Box>

          {currentNews.imageUrl && (
            <Box
              component="img"
              src={currentNews.imageUrl}
              alt={currentNews.title}
              sx={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 2, mb: 4 }}
            />
          )}

          <Typography
            variant="body1"
            sx={{ lineHeight: 1.8, fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}
          >
            {currentNews.summary}
          </Typography>

          {currentNews.tags && currentNews.tags.length > 0 && (
            <Box className="mt-6 flex flex-wrap gap-2">
              <Typography variant="subtitle2" className="mr-2">Tags:</Typography>
              {currentNews.tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" variant="outlined" />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
};

export default NewsDetailPage;

import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout, Loading } from '@components/common';
import { Typography, Box, ToggleButtonGroup, ToggleButton, Button, CircularProgress } from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import useAppDispatch from '@hooks/useAppDispatch';
import useAppSelector from '@hooks/useAppSelector';
import { fetchAllNews, fetchMoreNews, setCurrentTopic, setSortOrder } from '@lib/public/news/newsSlice';
import NewsCard from '@components/news/NewsCard';
import TopicFilter from '@components/news/TopicFilter';

const NewsPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { newsList, loading, loadingMore, error, currentTopic, sortOrder, page, totalPages } = useAppSelector((state) => state.news);

  const topic = (router.query.topic as string) || '';

  useEffect(() => {
    dispatch(setCurrentTopic(topic));
    dispatch(fetchAllNews({
      ...(topic ? { topic } : {}),
      sort: sortOrder === 'oldest' ? 'publishedAt' : '-publishedAt',
      page: 1,
    }));
  }, [dispatch, topic, sortOrder]);

  const handleTopicChange = (newTopic: string) => {
    if (newTopic) {
      router.push(`/news?topic=${newTopic}`, undefined, { shallow: true });
    } else {
      router.push('/news', undefined, { shallow: true });
    }
  };

  const handleSortChange = (_: React.MouseEvent<HTMLElement>, newSort: 'latest' | 'oldest' | null) => {
    if (newSort) {
      dispatch(setSortOrder(newSort));
    }
  };

  const handleLoadMore = () => {
    dispatch(fetchMoreNews({
      ...(topic ? { topic } : {}),
      sort: sortOrder === 'oldest' ? 'publishedAt' : '-publishedAt',
      page: page + 1,
    }));
  };

  const hasMore = page < totalPages;

  return (
    <Layout>
      <Typography variant="h1" className="mb-2">Market & Business News</Typography>
      <Typography variant="body1" color="text.secondary" className="mb-6">
        Stay updated with the latest market trends and business news
      </Typography>

      <Box className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <TopicFilter currentTopic={currentTopic} onTopicChange={handleTopicChange} />
        <ToggleButtonGroup
          value={sortOrder}
          exclusive
          onChange={handleSortChange}
          size="small"
        >
          <ToggleButton value="latest" sx={{ textTransform: 'none', gap: 0.5 }}>
            <SortIcon fontSize="small" /> Latest
          </ToggleButton>
          <ToggleButton value="oldest" sx={{ textTransform: 'none', gap: 0.5 }}>
            <SortIcon fontSize="small" sx={{ transform: 'scaleY(-1)' }} /> Oldest
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {loading && <Loading message="Loading news..." />}
      {error && <Typography color="error">{error}</Typography>}

      {!loading && newsList.length === 0 && (
        <Box className="text-center py-10">
          <Typography color="text.secondary">No news found.</Typography>
        </Box>
      )}

      <Box>
        {newsList.map((news) => (
          <NewsCard key={news._id} news={news} />
        ))}
      </Box>

      {!loading && hasMore && (
        <Box className="flex justify-center py-6">
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            disabled={loadingMore}
            sx={{ minWidth: 160 }}
          >
            {loadingMore ? <CircularProgress size={24} /> : 'Load More'}
          </Button>
        </Box>
      )}
    </Layout>
  );
};

export default NewsPage;

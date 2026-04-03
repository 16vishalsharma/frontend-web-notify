import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Layout, Loading } from '@components/common';
import { Typography, Box, ToggleButtonGroup, ToggleButton, IconButton, CircularProgress, Divider, Tooltip } from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import useAppDispatch from '@hooks/useAppDispatch';
import useAppSelector from '@hooks/useAppSelector';
import { fetchAllNews, fetchMoreNews, setCurrentTopic, setSortOrder } from '@lib/public/news/newsSlice';
import NewsCard from '@components/news/NewsCard';
import TopicFilter from '@components/news/TopicFilter';
import { INews } from '@appTypes/index';

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

  const handleRefresh = () => {
    dispatch(fetchAllNews({
      ...(topic ? { topic } : {}),
      sort: sortOrder === 'oldest' ? 'publishedAt' : '-publishedAt',
      page: 1,
    }));
  };

  const handleLoadMore = useCallback(() => {
    if (loadingMore || loading) return;
    dispatch(fetchMoreNews({
      ...(topic ? { topic } : {}),
      sort: sortOrder === 'oldest' ? 'publishedAt' : '-publishedAt',
      page: page + 1,
    }));
  }, [dispatch, topic, sortOrder, page, loadingMore, loading]);

  const hasMore = page < totalPages;

  // Infinite scroll: observe a sentinel element at the bottom
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { rootMargin: '200px' }
    );

    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [hasMore, loading, handleLoadMore]);

  // Group news by date and sort groups by latest date first
  const groupedNews = useMemo(() => {
    const map = new Map<string, INews[]>();

    newsList.forEach((news) => {
      const dateKey = new Date(news.publishedAt).toDateString();
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(news);
    });

    const groups: { date: string; label: string; items: INews[] }[] = [];

    map.forEach((items, dateKey) => {
      const newsDate = new Date(dateKey);
      const formattedDate = newsDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const compareDate = new Date(newsDate);
      compareDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today.getTime() - compareDate.getTime()) / (1000 * 60 * 60 * 24));

      let label = formattedDate;
      if (diffDays === 0) label = `Today — ${formattedDate}`;
      else if (diffDays === 1) label = `Yesterday — ${formattedDate}`;

      groups.push({ date: dateKey, label, items });
    });

    // Sort groups: latest date first (or oldest first based on sortOrder)
    groups.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'oldest' ? dateA - dateB : dateB - dateA;
    });

    return groups;
  }, [newsList, sortOrder]);

  return (
    <Layout>
      <Typography variant="h1" className="mb-2">Market & Business News</Typography>
      <Typography variant="body1" color="text.secondary" className="mb-6">
        Stay updated with the latest market trends and business news
      </Typography>

      <Box className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <TopicFilter currentTopic={currentTopic} onTopicChange={handleTopicChange} />
        <Box className="flex items-center gap-2">
          <Tooltip title="Refresh news">
            <IconButton onClick={handleRefresh} disabled={loading} color="primary" size="small">
              <RefreshIcon sx={{ animation: loading ? 'spin 1s linear infinite' : 'none', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
            </IconButton>
          </Tooltip>
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
      </Box>

      {loading && <Loading message="Loading news..." />}
      {error && <Typography color="error">{error}</Typography>}

      {!loading && newsList.length === 0 && (
        <Box className="text-center py-10">
          <Typography color="text.secondary">No news found.</Typography>
        </Box>
      )}

      {groupedNews.map((group) => (
        <Box key={group.date} className="mb-6">
          <Box className="flex items-center gap-2 mb-3">
            <CalendarTodayIcon fontSize="small" color="primary" />
            <Typography variant="h6" color="primary" fontWeight={600}>
              {group.label}
            </Typography>
            <Divider sx={{ flex: 1 }} />
            <Typography variant="caption" color="text.secondary">
              {group.items.length} {group.items.length === 1 ? 'article' : 'articles'}
            </Typography>
          </Box>
          {group.items.map((news) => (
            <NewsCard key={news._id} news={news} />
          ))}
        </Box>
      ))}

      {/* Infinite scroll sentinel */}
      {!loading && hasMore && (
        <Box ref={sentinelRef} className="flex justify-center py-6">
          {loadingMore && <CircularProgress size={28} />}
        </Box>
      )}

      {!loading && !hasMore && newsList.length > 0 && (
        <Typography variant="body2" color="text.secondary" className="text-center py-4">
          You&apos;re all caught up!
        </Typography>
      )}
    </Layout>
  );
};

export default NewsPage;

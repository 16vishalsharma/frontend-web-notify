import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout, Loading } from '@components/common';
import { Typography, Box } from '@mui/material';
import useAppDispatch from '@hooks/useAppDispatch';
import useAppSelector from '@hooks/useAppSelector';
import { fetchAllNews, setCurrentTopic } from '@lib/public/news/newsSlice';
import NewsCard from '@components/news/NewsCard';
import TopicFilter from '@components/news/TopicFilter';

const NewsPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { newsList, loading, error, currentTopic } = useAppSelector((state) => state.news);

  const topic = (router.query.topic as string) || '';

  useEffect(() => {
    dispatch(setCurrentTopic(topic));
    dispatch(fetchAllNews(topic ? { topic } : undefined));
  }, [dispatch, topic]);

  const handleTopicChange = (newTopic: string) => {
    if (newTopic) {
      router.push(`/news?topic=${newTopic}`, undefined, { shallow: true });
    } else {
      router.push('/news', undefined, { shallow: true });
    }
  };

  return (
    <Layout>
      <Typography variant="h1" className="mb-2">Market & Business News</Typography>
      <Typography variant="body1" color="text.secondary" className="mb-6">
        Stay updated with the latest market trends and business news
      </Typography>

      <TopicFilter currentTopic={currentTopic} onTopicChange={handleTopicChange} />

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
    </Layout>
  );
};

export default NewsPage;

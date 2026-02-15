import React from 'react';
import Link from 'next/link';
import { Card, CardContent, Typography, Chip, Box } from '@mui/material';
import { INews } from '@appTypes/index';
import { formatDateTime, truncateText } from '@utils/index';

interface NewsCardProps {
  news: INews;
}

const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  return (
    <Card className="mb-3 transition-shadow hover:shadow-md">
      <CardContent>
        <Box className="flex justify-between items-start gap-4">
          <Box className="flex-1">
            <Box className="flex gap-2 mb-2">
              <Chip label={news.category} size="small" color="primary" />
              <Chip label={news.topic} size="small" variant="outlined" />
            </Box>
            <Typography variant="h3" className="mb-2">
              <Link href={`/news/${news._id}`} className="hover:text-blue-600 transition-colors">
                {news.title}
              </Link>
            </Typography>
            {news.summary && (
              <Typography variant="body2" color="text.secondary" className="mb-2">
                {truncateText(news.summary, 200)}
              </Typography>
            )}
            <Box className="flex items-center gap-2 text-gray-500 text-sm">
              <span>{formatDateTime(news.publishedAt)}</span>
              {news.source && <span>| {news.source}</span>}
            </Box>
          </Box>
          {news.imageUrl && (
            <Box
              component="img"
              src={news.imageUrl}
              alt=""
              sx={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default NewsCard;

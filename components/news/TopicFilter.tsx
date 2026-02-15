import React from 'react';
import { Box, Chip } from '@mui/material';

const TOPICS = [
  { value: '', label: 'All' },
  { value: 'share-market', label: 'Share Market' },
  { value: 'stocks', label: 'Stocks' },
  { value: 'ipo', label: 'IPO' },
  { value: 'mutual-funds', label: 'Mutual Funds' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'startup', label: 'Startup' },
  { value: 'economy', label: 'Economy' },
  { value: 'finance', label: 'Finance' },
  { value: 'business', label: 'Business' },
  { value: 'technology', label: 'Technology' },
];

interface TopicFilterProps {
  currentTopic: string;
  onTopicChange: (topic: string) => void;
}

const TopicFilter: React.FC<TopicFilterProps> = ({ currentTopic, onTopicChange }) => {
  return (
    <Box className="flex flex-wrap gap-2 mb-6">
      {TOPICS.map((topic) => (
        <Chip
          key={topic.value}
          label={topic.label}
          onClick={() => onTopicChange(topic.value)}
          color={currentTopic === topic.value ? 'primary' : 'default'}
          variant={currentTopic === topic.value ? 'filled' : 'outlined'}
          className="cursor-pointer"
        />
      ))}
    </Box>
  );
};

export default TopicFilter;

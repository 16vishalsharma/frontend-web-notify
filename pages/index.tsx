import React from 'react';
import Link from 'next/link';
import { Layout } from '@components/common';
import { Typography, Card, CardContent, Button, Box, Chip } from '@mui/material';
import Grid from '@mui/material/Grid2';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import ArticleIcon from '@mui/icons-material/Article';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

const features = [
  {
    title: 'News',
    description: 'Latest news on share market, startups, crypto, and more topics',
    icon: <NewspaperIcon sx={{ fontSize: 40 }} />,
    path: '/news',
    color: '#2563eb',
  },
  {
    title: 'Blogs',
    description: 'Create and manage blog posts with full blogger profiles',
    icon: <ArticleIcon sx={{ fontSize: 40 }} />,
    path: '/blogs',
    color: '#059669',
  },
  {
    title: 'File Upload',
    description: 'Upload files with cluster-based processing for performance',
    icon: <CloudUploadIcon sx={{ fontSize: 40 }} />,
    path: '/upload',
    color: '#d97706',
  },
  {
    title: 'Products',
    description: 'Browse product catalog with categories and search',
    icon: <ShoppingBagIcon sx={{ fontSize: 40 }} />,
    path: '/products',
    color: '#dc2626',
  },
];

const HomePage: React.FC = () => {
  return (
    <Layout>
      <Box className="text-center mb-10">
        <Typography variant="h1" className="mb-3 font-bold text-gray-900">
          Notify
        </Typography>
        <Typography variant="h6" className="text-gray-500 mb-6">
          Your all-in-one platform for News, Blogs, Products & File Management
        </Typography>
        <Box className="flex justify-center gap-3">
          <Button variant="contained" component={Link} href="/news" size="large">
            Browse News
          </Button>
          <Button variant="outlined" component={Link} href="/blogs" size="large">
            Read Blogs
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {features.map((feature) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={feature.title}>
            <Card
              className="h-full transition-transform hover:-translate-y-1 cursor-pointer"
              component={Link}
              href={feature.path}
              sx={{ textDecoration: 'none' }}
            >
              <CardContent className="text-center p-6">
                <Box sx={{ color: feature.color, mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h3" className="mb-2">
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
                <Chip label="Explore" size="small" sx={{ mt: 2, bgcolor: feature.color, color: 'white' }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
};

export default HomePage;

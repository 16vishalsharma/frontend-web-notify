import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout, Loading } from '@components/common';
import { Typography, Box, Chip, Avatar, Button, Divider, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import { IBlog } from '@appTypes/index';
import { formatDate } from '@utils/index';

const BlogDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [blog, setBlog] = useState<IBlog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchBlog = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_BASE_URL}/api/blogs/${id}`);
        const data = await response.json();
        if (data.success) {
          setBlog(data.data);
        } else {
          setError('Blog not found');
        }
      } catch {
        setError('Failed to load blog');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  return (
    <Layout>
      <Button
        component={Link}
        href="/blogs"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
      >
        Back to Blogs
      </Button>

      {loading && <Loading message="Loading blog..." />}
      {error && (
        <Box className="text-center py-10">
          <Typography color="error" variant="h6">{error}</Typography>
        </Box>
      )}

      {!loading && blog && (
        <Paper variant="outlined" sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
          {blog.featuredImage && (
            <Box
              component="img"
              src={blog.featuredImage}
              alt={blog.title}
              sx={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 2, mb: 4 }}
            />
          )}

          <Typography variant="h1" sx={{ mb: 2 }}>
            {blog.title}
          </Typography>

          <Box className="flex flex-wrap items-center gap-4 mb-4">
            <Box className="flex items-center gap-1">
              {blog.blogger.avatar ? (
                <Avatar src={blog.blogger.avatar} sx={{ width: 32, height: 32 }} />
              ) : (
                <PersonIcon fontSize="small" color="action" />
              )}
              <Typography variant="body2" color="text.secondary">
                {blog.blogger.name}
              </Typography>
            </Box>
            <Box className="flex items-center gap-1">
              <CalendarTodayIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {formatDate(blog.publishedAt || blog.createdAt)}
              </Typography>
            </Box>
            <Chip label={blog.status} size="small" color={blog.status === 'published' ? 'success' : 'default'} />
          </Box>

          {blog.tags && blog.tags.length > 0 && (
            <Box className="flex flex-wrap gap-1 mb-4">
              {blog.tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" variant="outlined" />
              ))}
            </Box>
          )}

          <Divider sx={{ mb: 4 }} />

          <Box
            sx={{ '& p': { mb: 2, lineHeight: 1.8 }, '& img': { maxWidth: '100%', borderRadius: 1 } }}
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {blog.blogger.bio && (
            <>
              <Divider sx={{ my: 4 }} />
              <Box className="flex items-start gap-3">
                <Avatar src={blog.blogger.avatar} sx={{ width: 48, height: 48 }}>
                  {blog.blogger.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {blog.blogger.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {blog.blogger.bio}
                  </Typography>
                </Box>
              </Box>
            </>
          )}
        </Paper>
      )}
    </Layout>
  );
};

export default BlogDetailPage;

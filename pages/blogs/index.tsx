import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout, Loading } from '@components/common';
import { Typography, Card, CardContent, Chip, Box, Button } from '@mui/material';
import Grid from '@mui/material/Grid2';
import AddIcon from '@mui/icons-material/Add';
import { IBlog } from '@appTypes/index';
import { formatDate, truncateText } from '@utils/index';

const BlogsPage: React.FC = () => {
  const [blogs, setBlogs] = useState<IBlog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_BASE_URL}/api/blogs`);
        const data = await response.json();
        setBlogs(data.data || data.blogs || []);
      } catch {
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <Layout>
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h1">Blogs</Typography>
        <Button variant="contained" component={Link} href="/blogs/create" startIcon={<AddIcon />}>
          Create Blog
        </Button>
      </Box>

      {loading && <Loading message="Loading blogs..." />}

      {!loading && blogs.length === 0 && (
        <Card>
          <CardContent className="text-center py-10">
            <Typography variant="h6" color="text.secondary" className="mb-3">
              No blogs found
            </Typography>
            <Button variant="contained" component={Link} href="/blogs/create">
              Create Your First Blog
            </Button>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {blogs?.length > 0 && blogs?.map((blog) => (
          <Grid size={{ xs: 12, md: 6 }} key={blog._id}>
            <Card className="h-full transition-shadow hover:shadow-md">
              {blog.featuredImage && (
                <Box
                  component="img"
                  src={blog.featuredImage}
                  alt={blog.title}
                  sx={{ width: '100%', height: 200, objectFit: 'cover' }}
                />
              )}
              <CardContent>
                <Typography variant="h3" className="mb-2">
                  <Link href={`/blogs/${blog._id}`} className="hover:text-blue-600">
                    {blog.title}
                  </Link>
                </Typography>
                <Box className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                  <span>By <strong>{blog.blogger.name}</strong></span>
                  <span>|</span>
                  <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
                </Box>
                {blog.excerpt && (
                  <Typography variant="body2" color="text.secondary" className="mb-2">
                    {truncateText(blog.excerpt, 150)}
                  </Typography>
                )}
                {blog.tags && blog.tags.length > 0 && (
                  <Box className="flex flex-wrap gap-1 mt-2">
                    {blog.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
};

export default BlogsPage;

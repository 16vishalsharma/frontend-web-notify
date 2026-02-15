import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@components/common';
import {
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import toast from 'react-hot-toast';

const CreateBlogPage: React.FC = () => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    tags: '',
    status: 'draft',
    bloggerName: '',
    bloggerEmail: '',
    bloggerPassword: '',
    bloggerBio: '',
    bloggerAvatar: '',
    bloggerWebsite: '',
    bloggerTwitter: '',
    bloggerLinkedin: '',
    bloggerGithub: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const formBody = new URLSearchParams();
      Object.entries(form).forEach(([key, value]) => {
        if (value) formBody.append(key, value);
      });

      const response = await fetch(`${API_BASE_URL}/blogs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString(),
      });

      if (response.ok || response.redirected) {
        toast.success('Blog created successfully!');
        router.push('/blogs');
      } else {
        toast.error('Failed to create blog');
      }
    } catch {
      toast.error('Error creating blog');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout maxWidth="md">
      <Typography variant="h1" className="mb-6">Create New Blog</Typography>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Typography variant="h2" className="mb-4">Blog Content</Typography>

            <TextField fullWidth label="Title *" name="title" value={form.title} onChange={handleChange} required className="mb-4" />
            <TextField fullWidth label="Excerpt" name="excerpt" value={form.excerpt} onChange={handleChange} multiline rows={2} className="mb-4" />
            <TextField fullWidth label="Content *" name="content" value={form.content} onChange={handleChange} required multiline rows={8} className="mb-4" />
            <TextField fullWidth label="Featured Image URL" name="featuredImage" value={form.featuredImage} onChange={handleChange} className="mb-4" />
            <TextField fullWidth label="Tags (comma-separated)" name="tags" value={form.tags} onChange={handleChange} className="mb-4" />

            <FormControl fullWidth className="mb-4">
              <InputLabel>Status</InputLabel>
              <Select
                value={form.status}
                label="Status"
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
              </Select>
            </FormControl>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h2" className="mb-4">Blogger Information</Typography>

            <TextField fullWidth label="Name *" name="bloggerName" value={form.bloggerName} onChange={handleChange} required className="mb-4" />
            <TextField fullWidth label="Email *" name="bloggerEmail" type="email" value={form.bloggerEmail} onChange={handleChange} required className="mb-4" />
            <TextField fullWidth label="Password *" name="bloggerPassword" type="password" value={form.bloggerPassword} onChange={handleChange} required className="mb-4" />
            <TextField fullWidth label="Bio" name="bloggerBio" value={form.bloggerBio} onChange={handleChange} multiline rows={2} className="mb-4" />
            <TextField fullWidth label="Avatar URL" name="bloggerAvatar" value={form.bloggerAvatar} onChange={handleChange} className="mb-4" />
            <TextField fullWidth label="Website" name="bloggerWebsite" value={form.bloggerWebsite} onChange={handleChange} className="mb-4" />

            <Typography variant="h6" className="mb-3 mt-2">Social Links</Typography>
            <TextField fullWidth label="Twitter" name="bloggerTwitter" value={form.bloggerTwitter} onChange={handleChange} className="mb-4" />
            <TextField fullWidth label="LinkedIn" name="bloggerLinkedin" value={form.bloggerLinkedin} onChange={handleChange} className="mb-4" />
            <TextField fullWidth label="GitHub" name="bloggerGithub" value={form.bloggerGithub} onChange={handleChange} className="mb-4" />

            <Box className="flex gap-3 mt-4">
              <Button type="submit" variant="contained" size="large" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Blog'}
              </Button>
              <Button variant="outlined" size="large" onClick={() => router.push('/blogs')}>
                Cancel
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default CreateBlogPage;

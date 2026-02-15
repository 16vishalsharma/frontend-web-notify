import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '@components/common';
import { Typography, Card, CardContent, TextField, Button, Alert } from '@mui/material';
import useAppDispatch from '@hooks/useAppDispatch';
import { setBloggerAuth } from '@lib/public/auth/authSlice';

const BloggerLoginPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/blogger/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, password }).toString(),
        credentials: 'include',
      });

      if (response.ok || response.redirected) {
        dispatch(setBloggerAuth({ name: email.split('@')[0], email, id: 'session' }));
        router.push('/blogs');
      } else {
        setError('Invalid email or password');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout maxWidth="sm">
      <Card sx={{ mt: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h1" className="mb-2">Blogger Login</Typography>
          <Typography color="text.secondary" className="mb-6">
            Login to manage your blog posts
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mb-4"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mb-4"
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <Typography className="text-center mt-4">
            <Link href="/blogs" className="text-blue-600 hover:underline">
              Back to Blogs
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default BloggerLoginPage;

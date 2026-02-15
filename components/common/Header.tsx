import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import useAppSelector from '@hooks/useAppSelector';
import useAppDispatch from '@hooks/useAppDispatch';
import { clearBloggerAuth } from '@lib/public/auth/authSlice';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Products', path: '/products' },
  { label: 'Blogs', path: '/blogs' },
  { label: 'News', path: '/news' },
  { label: 'Upload', path: '/upload' },
];

const Header: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isLoggedIn, bloggerName } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(clearBloggerAuth());
    router.push('/');
  };

  return (
    <>
      <AppBar position="sticky" sx={{ bgcolor: '#1e293b' }}>
        <Toolbar className="max-w-7xl mx-auto w-full">
          <Box
            component={Link}
            href="/"
            sx={{ flexGrow: 0, mr: 4, display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none' }}
          >
            <Image src="/notify-logo.png" alt="Notify" width={40} height={40} style={{ borderRadius: '50%' }} />
            <Typography
              variant="h6"
              sx={{ color: 'white', fontWeight: 700 }}
            >
              Notify
            </Typography>
          </Box>

          {isMobile ? (
            <>
              <Box sx={{ flexGrow: 1 }} />
              <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
                <MenuIcon />
              </IconButton>
            </>
          ) : (
            <>
              <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
                {navLinks.map((link) => (
                  <Button
                    key={link.path}
                    component={Link}
                    href={link.path}
                    sx={{
                      color: 'white',
                      opacity: router.pathname === link.path ? 1 : 0.7,
                      '&:hover': { opacity: 1 },
                    }}
                  >
                    {link.label}
                  </Button>
                ))}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isLoggedIn ? (
                  <>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      {bloggerName}
                    </Typography>
                    <Button color="inherit" size="small" onClick={handleLogout}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button
                    component={Link}
                    href="/blogger/login"
                    color="inherit"
                    size="small"
                    variant="outlined"
                    sx={{ borderColor: 'rgba(255,255,255,0.3)' }}
                  >
                    Blogger Login
                  </Button>
                )}
              </Box>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250 }} role="presentation" onClick={() => setDrawerOpen(false)}>
          <List>
            {navLinks.map((link) => (
              <ListItem key={link.path} component={Link} href={link.path}>
                <ListItemText primary={link.label} />
              </ListItem>
            ))}
            {isLoggedIn ? (
              <ListItem onClick={handleLogout}>
                <ListItemText primary="Logout" />
              </ListItem>
            ) : (
              <ListItem component={Link} href="/blogger/login">
                <ListItemText primary="Blogger Login" />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;

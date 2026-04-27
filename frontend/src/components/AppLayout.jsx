import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Container,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ShoppingCart,
  Inventory,
  ListAlt,
  AdminPanelSettings,
  Brightness4,
  Brightness7,
  Logout,
  Login,
  PersonAdd,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';

const drawerWidth = 240;

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(true);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Products', icon: <Inventory />, path: '/', auth: false },
    { text: 'Cart', icon: <ShoppingCart />, path: '/cart', auth: true },
    { text: 'Orders', icon: <ListAlt />, path: '/orders', auth: true },
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push({
      text: 'Admin Panel',
      icon: <AdminPanelSettings />,
      path: '/admin/products',
      auth: true,
      admin: true,
    });
  }

  const drawer = (
    <Box>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          component="img"
          src="/Asset/Images/Shopzy.png"
          alt="Shopzy"
          sx={{ width: 32, height: 32 }}
        />
        <Typography variant="h6" noWrap component="div">
          Shopzy
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems
          .filter((item) => !item.auth || user)
          .map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={toggleTheme}>
            <ListItemIcon>
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </ListItemIcon>
            <ListItemText primary={mode === 'dark' ? 'Light Mode' : 'Dark Mode'} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: user && drawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { md: user && drawerOpen ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          {user && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Shopzy
          </Typography>
          <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 1 }}>
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          {user ? (
            <>
              <Typography variant="body2" sx={{ mr: 2 }}>
                {user.username}
              </Typography>
              <Button color="inherit" startIcon={<Logout />} onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" startIcon={<Login />} onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button
                color="inherit"
                startIcon={<PersonAdd />}
                onClick={() => navigate('/register')}
              >
                Register
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      {user && (
        <Box
          component="nav"
          sx={{ width: { md: drawerOpen ? drawerWidth : 0 }, flexShrink: { md: 0 } }}
        >
          <Drawer
            variant={isMobile ? 'temporary' : 'persistent'}
            open={drawerOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </Drawer>
        </Box>
      )}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: user && drawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          minHeight: '100vh',
          backgroundColor: 'background.default',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        <Container maxWidth="xl">{children}</Container>
      </Box>
    </Box>
  );
};

export default AppLayout;
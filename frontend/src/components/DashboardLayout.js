import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as ExamIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Email as MailIcon,
  Assessment as AssessmentIcon,
  Class as ClassIcon,
  LibraryBooks as LibraryIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { useNotification } from '../context/NotificationContext';

const drawerWidth = 280;

const MENU_ITEMS = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/home' },
  { text: 'Mail', icon: <MailIcon />, path: '/mail' },
  { text: 'Users', icon: <PeopleIcon />, path: '/user-list' },
  { text: 'Classes', icon: <ClassIcon />, path: '/classes' },
  { text: 'Exams', icon: <ExamIcon />, path: '/exam-list' },
  { text: 'Results', icon: <AssessmentIcon />, path: '/results' },
  { text: 'Library', icon: <LibraryIcon />, path: '/library' },
  { text: 'Calendar', icon: <CalendarIcon />, path: '/calendar' },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);
  const showNotification = useNotification();

  // Load User Data
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Token Expiration Check
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const exp = payload.exp * 1000;
          if (Date.now() > exp) {
            handleLogout(true); // Call logout with expired flag
          }
        } catch (e) {
          console.error("Token parse error", e);
        }
      }
    };

    const interval = setInterval(checkToken, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleProfileMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = async (isExpired = false) => {
    // Notify Backend for Email
    try {
      if (user.email) {
        await axios.post('http://localhost:5000/api/user/logout', {
          email: user.email,
          firstName: user.firstName,
          expired: isExpired
        });
      }
    } catch (e) {
      console.error("Logout notification failed:", e);
    }

    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    if (isExpired) {
        showNotification("Session expired. Please login again.", "warning");
    } else {
        showNotification("Successfully logged out.", "success");
    }
    
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Top Bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: 'primary.main' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Exam Management System
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
             <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {user.firstName ? `${user.firstName} (${user.role})` : 'User'}
             </Typography>
             <IconButton onClick={handleProfileMenu} sx={{ p: 0 }}>
                <Avatar alt="User" src="/static/images/avatar/2.jpg" />
             </IconButton>
             <Menu
                sx={{ mt: '45px' }}
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
             >
                <MenuItem onClick={() => { navigate('/profile'); handleCloseMenu(); }}>
                   <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon> Profile
                </MenuItem>
                <MenuItem onClick={() => { navigate('/settings'); handleCloseMenu(); }}>
                   <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon> Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                   <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon> Logout
                </MenuItem>
             </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={open}
        onClose={toggleDrawer}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
             width: drawerWidth, 
             boxSizing: 'border-box',
             borderRight: '1px solid rgba(0,0,0,0.12)',
             bgcolor: 'background.paper'
          },
        }}
      >
        <Toolbar /> 
        <Box sx={{ overflow: 'auto', p: 2 }}>
           
           <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'primary.light', borderRadius: 2, color: 'primary.contrastText' }}>
              <Avatar variant="rounded" sx={{ bgcolor: 'white', color: 'primary.main' }}>
                {user.firstName?.[0] || 'U'}
              </Avatar>
              <Box>
                 <Typography variant="subtitle1" fontWeight="bold">
                    {user.firstName} {user.lastName}
                 </Typography>
                 <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {user.email}
                 </Typography>
              </Box>
           </Box>

          <List>
            {MENU_ITEMS.map((item) => {
               const active = location.pathname.startsWith(item.path);
               return (
                <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton 
                     selected={active}
                     onClick={() => navigate(item.path)}
                     sx={{ 
                        borderRadius: 2,
                           '&.Mui-selected': {
                              bgcolor: 'action.selected', 
                              color: 'primary.main',
                              '&:hover': { bgcolor: 'action.hover' },
                              borderLeft: `4px solid ${theme.palette.primary.main}`
                           }
                     }}
                  >
                    <ListItemIcon sx={{ color: active ? 'primary.main' : 'inherit' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: active ? 'bold' : 'medium' }} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
          <Divider sx={{ my: 2 }} />
          <List>
             <ListItem disablePadding>
                <ListItemButton onClick={handleLogout}>
                   <ListItemIcon><LogoutIcon /></ListItemIcon>
                   <ListItemText primary="Logout" />
                </ListItemButton>
             </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%', overflowX: 'hidden' }}>
        <Toolbar /> 
        <Outlet />
      </Box>
    </Box>
  );
}
